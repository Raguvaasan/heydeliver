import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
         Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

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
