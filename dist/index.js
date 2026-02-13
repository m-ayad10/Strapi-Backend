"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config/config");
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const detail_routes_1 = __importDefault(require("./routes/detail.routes"));
const package_routes_1 = __importDefault(require("./routes/package.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Host"],
    credentials: true,
}));
// Routes
app.use("/tenant", tenant_routes_1.default);
app.use("/details", detail_routes_1.default);
app.use("/packages", package_routes_1.default);
// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start Server
app.listen(config_1.CONFIG.PORT, () => {
    console.log(`Backend running on port ${config_1.CONFIG.PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map