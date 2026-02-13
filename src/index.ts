import express, { Application } from "express";
import cors from "cors";
import { CONFIG } from "./config/config";
import tenantRoutes from "./routes/tenant.routes";
import detailRoutes from "./routes/detail.routes";
import packageRoutes from "./routes/package.routes";
import sectionRoutes from "./routes/section.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Host"],
    credentials: true,
  })
);

// Routes
app.use("/tenant", tenantRoutes);
app.use("/details", detailRoutes);
app.use("/packages", packageRoutes);
app.use("/sections", sectionRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(CONFIG.PORT, () => {
  console.log(`Backend running on port ${CONFIG.PORT}`);
});

export default app;
