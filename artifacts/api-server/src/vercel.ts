/**
 * Vercel serverless entry point.
 * Exports the Express app directly (no app.listen) so Vercel can
 * invoke it as a serverless function.
 */
import app from "./app.js";

export default app;
