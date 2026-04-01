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
        Authorization: "Token 91aeec33f78a2d21a6348658708de71f31489038",
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
