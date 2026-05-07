import app from "./dist/app.mjs";

export default function handler(req, res) {
  // Remove /api prefix if present
  if (req.url.startsWith("/api")) {
    req.url = req.url.slice(4) || "/";
  }
  
  return app(req, res);
}
