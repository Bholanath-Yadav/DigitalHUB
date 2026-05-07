import app from "./app.js";
import { logger } from "./lib/logger.js";

// Export app for serverless environments (Vercel, etc.)
export default app;

// Start server locally if not in serverless environment
if (process.env.VERCEL !== "1") {
  const rawPort = process.env.PORT ?? "3001";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

