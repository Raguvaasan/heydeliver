import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buildDelhiveryFormBody(body) {
  const params = new URLSearchParams();
  params.set("format", "json");

  if (body && typeof body === "object") {
    if (body.data !== undefined) {
      const dataStr = typeof body.data === "string" ? body.data : JSON.stringify(body.data);
      params.set("data", dataStr);
    } else if (body.shipments) {
      params.set("data", JSON.stringify(body));
    }
  } else if (typeof body === "string") {
    if (body.includes("format=") && body.includes("data=")) {
      return body;
    }
    params.set("data", body);
  }

  return params.toString();
}

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
        // Construct form body from whatever the frontend sent (JSON or form)
        fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
        fetchOptions.body = buildDelhiveryFormBody(req.body);
        console.log("[delhivery proxy] outgoing body:", fetchOptions.body.substring(0, 200));
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
