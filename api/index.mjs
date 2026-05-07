import app from "../artifacts/api-server/dist/index.mjs";

export default function handler(req, res) {
  // Remove /api prefix from URL
  const url = req.url.startsWith("/api") ? req.url.slice(4) : req.url;
  
  // Create a modified request object
  const modifiedReq = Object.create(req);
  modifiedReq.url = url || "/";
  
  return app(modifiedReq, res);
}
