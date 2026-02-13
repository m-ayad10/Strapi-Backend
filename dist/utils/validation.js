"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPrice = exports.validateRequiredFields = void 0;
const validateRequiredFields = (body, fields) => {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(", ")}`;
    }
    return null;
};
exports.validateRequiredFields = validateRequiredFields;
const isValidPrice = (price) => {
    return typeof price === 'number' || (!isNaN(parseFloat(price)) && isFinite(price));
};
exports.isValidPrice = isValidPrice;
//# sourceMappingURL=validation.js.map