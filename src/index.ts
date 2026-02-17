import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CONFIG } from "./config/config";
import tenantRoutes from "./routes/tenant.routes";
import packageRoutes from "./routes/package.routes";
import sectionRoutes from "./routes/section.routes";
import authRoutes from "./routes/auth.routes";
import templateRoutes from "./routes/template.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
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
app.use("/packages", packageRoutes);
app.use("/sections", sectionRoutes);
app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);

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
