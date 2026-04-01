import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// NOTE: urlencoded middleware is applied per-route below, NOT globally,
// so that the delhivery proxy can forward raw form bodies untouched.

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
app.use("/delhivery-api", express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    const apiPath = req.path;
    const query = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";

    const fullUrl = `https://track.delhivery.com${apiPath}${query}`;

    const fetchOptions = {
      method: req.method,
      headers: {
        Authorization: "Token 91aeec33f78a2d21a6348658708de71f31489038",
      }
    };

    // Forward body for POST/PUT/PATCH requests
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      if (apiPath.includes("create.json")) {
        // Delhivery create.json expects application/x-www-form-urlencoded
        // Forward the raw body as-is to preserve format=json&data=...
        fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
        let rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf-8") : String(req.body || "");
        
        // Safety: ensure format= is present
        if (!rawBody.includes("format=")) {
          rawBody = `format=json&${rawBody}`;
        }
        fetchOptions.body = rawBody;
        console.log("[delhivery proxy] outgoing body:", rawBody.substring(0, 200));
      } else {
        fetchOptions.headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(req.body);
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
