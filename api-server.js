import express from "express";
import cors from "cors";

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
---------------------------------------------------
*/
app.use("/delhivery-api", async (req, res) => {
  try {
    const apiPath = req.path;
    const query = req.url.includes("?")
      ? req.url.substring(req.url.indexOf("?"))
      : "";

    const fullUrl = `https://track.delhivery.com${apiPath}${query}`;

    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        Authorization: "Token 91aeec33f78a2d21a6348658708de71f31489038",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status).json(data);

  } catch (error) {
    console.error("Delhivery API error:", error);

    res.status(500).json({
      error: "Delhivery proxy failed",
      message: error.message,
    });
  }
});

/*
---------------------------------------------------
API ROUTER (Fix for Vercel-style routes)
---------------------------------------------------
*/
app.use("/api", async (req, res) => {
  try {
    // remove "/api" prefix
    const path = req.originalUrl.replace(/^\/api\/?/, "").split("?")[0];

    // split path → required for [...path].ts
    const pathSegments = path.split("/").filter(Boolean);

    const module = await import(
      "file:///var/www/heydeliver/api/[...path].ts"
    );

    const handler = module.default;

    // override query safely
    req.query = {
      ...req.query,
      path: pathSegments,
    };

    await handler(req, res);

  } catch (error) {
    console.error("API error:", error);

    res.status(500).json({
      error: "Internal API error",
      message: error.message,
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