"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const axios_1 = require("axios");
const errorHandler = (err, req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    console.error("Unhandled Error:", err);
    if ((0, axios_1.isAxiosError)(err)) {
        const status = ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 502;
        const message = ((_d = (_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || err.message;
        const details = ((_g = (_f = (_e = err.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.details) || ((_h = err.response) === null || _h === void 0 ? void 0 : _h.data) || null;
        console.error("Strapi API Error Details:", JSON.stringify(details, null, 2));
        return res.status(status).json({
            error: "Strapi API Error",
            message: message,
            details: details,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
    return res.status(500).json({
        error: "Unknown Error",
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map