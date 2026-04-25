import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());

// Parse JSON bodies for all non-delhivery routes
app.use((req, res, next) => {
  // Skip body parsing for delhivery-api POST routes — we forward the raw body
  if (req.path.startsWith("/delhivery-api") && req.method === "POST") {
    return next();
  }
  express.json()(req, res, () => {
    express.urlencoded({ extended: true })(req, res, next);
  });
});

/*
---------------------------------------------------
Health Check
---------------------------------------------------
*/
app.get("/api", (req, res) => {
  res.json({ status: "API running" });
});

/*
---------------------------------------------------
Delhivery API Proxy
Handles:
https://truecargos.com/delhivery-api/*
---------------------------------------------------
*/
app.use("/delhivery-api", async (req, res) => {
  try {
    const apiPath = req.path;
    const query = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";

    const fullUrl = `https://track.delhivery.com${apiPath}${query}`;

    const fetchOptions = {
      method: req.method,
      headers: {
        Authorization: "Token 38ddf1efc8e1669a4bf352376506b7da9d0b3c99",
      }
    };

    // Forward body for POST/PUT/PATCH requests
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      if (apiPath.includes("create.json")) {
        // Delhivery create.json expects application/x-www-form-urlencoded
        // Read raw body directly and forward as-is
        fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";

        const rawBody = await new Promise((resolve) => {
          let data = "";
          req.on("data", (chunk) => { data += chunk; });
          req.on("end", () => resolve(data));
          setTimeout(() => resolve(data), 5000);
        });

        let body = rawBody || "";

        // If raw body is empty (shouldn't happen), try req.body
        if (!body && req.body) {
          if (typeof req.body === "object" && req.body.format && req.body.data) {
            body = `format=${req.body.format}&data=${req.body.data}`;
          } else if (typeof req.body === "string") {
            body = req.body;
          }
        }

        // Safety: ensure format= is present
        if (!body.includes("format=")) {
          body = `format=json&${body}`;
        }

        fetchOptions.body = body;
        console.log("[delhivery proxy] outgoing body:", body.substring(0, 300));
      } else {
        fetchOptions.headers["Content-Type"] = "application/json";
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      }
    }

    const response = await fetch(fullUrl, fetchOptions);

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);

  } catch (error) {
    console.error("Delhivery API error:", error);

    res.status(500).json({
      error: "Delhivery proxy failed",
      message: error.message
    });
  }
});

/*
---------------------------------------------------
Delhivery label proxy — fetches packing slip, strips amounts, returns PDF
---------------------------------------------------
*/
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN || "38ddf1efc8e1669a4bf352376506b7da9d0b3c99";

app.get("/api/delhivery-label", async (req, res) => {
  const waybill = String(req.query.waybill || "").trim();
  if (!waybill) {
    return res.status(400).json({ error: "waybill is required" });
  }

  try {
    const delhiveryUrl = `https://track.delhivery.com/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=4R`;
    const delhiveryRes = await fetch(delhiveryUrl, {
      headers: {
        Authorization: `Token ${DELHIVERY_TOKEN}`,
        Accept: "*/*",
      },
    });

    if (!delhiveryRes.ok) {
      const text = await delhiveryRes.text();
      return res.status(delhiveryRes.status).json({ error: "Delhivery error", details: text });
    }

    let pdfBytes;
    const contentType = delhiveryRes.headers.get("content-type") || "";
    if (contentType.includes("application/pdf")) {
      pdfBytes = await delhiveryRes.arrayBuffer();
    } else {
      const json = await delhiveryRes.json();
      const s3Url = json?.packages?.[0]?.pdf_download_link;
      if (!s3Url) {
        return res.status(502).json({ error: "pdf_download_link not found" });
      }
      const pdfRes = await fetch(s3Url);
      if (!pdfRes.ok) {
        return res.status(pdfRes.status).json({ error: "Failed to fetch PDF from S3" });
      }
      pdfBytes = await pdfRes.arrayBuffer();
    }

    // Strip amount values from PDF using pdf-lib
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawRectangle({
          x: width * 0.55,
          y: height * 0.04,
          width: width * 0.45,
          height: height * 0.30,
          color: rgb(1, 1, 1),
          borderWidth: 0,
        });
      }
      pdfBytes = await pdfDoc.save();
    } catch (pdfErr) {
      console.error("[delhivery-label] PDF stripping failed:", pdfErr?.message);
    }

    const finalBuf = Buffer.from(pdfBytes);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="label-${waybill}.pdf"`);
    return res.status(200).send(finalBuf);
  } catch (err) {
    console.error("delhivery-label error:", err);
    return res.status(500).json({ error: "Internal error", message: err.message });
  }
});

/*
---------------------------------------------------
Forward /api routes to Vercel-style handler
---------------------------------------------------
*/
app.use("/api", async (req, res) => {
  try {
    const module = await import("/var/www/heydeliver/api/[...path].ts");
    const handler = module.default;

    const pathSegments = req.path.split("/").filter(Boolean);

    Object.defineProperty(req, "query", {
      value: { ...req.query, path: pathSegments },
      writable: true
    });

    await handler(req, res);

  } catch (error) {
    console.error("API error:", error);

    res.status(500).json({
      error: "Internal API error",
      message: error.message
    });
  }
});

/*
---------------------------------------------------
Start Server
---------------------------------------------------
*/
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
