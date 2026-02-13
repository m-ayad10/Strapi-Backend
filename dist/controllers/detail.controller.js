"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetail = exports.updateDetail = exports.createDetail = void 0;
const detailService = __importStar(require("../services/detail.service"));
const validation_1 = require("../utils/validation");
const createDetail = async (req, res, next) => {
    try {
        const requiredFields = ["domain", "title", "color", "backgroundColor"];
        const validationError = (0, validation_1.validateRequiredFields)(req.body, requiredFields);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Banner image is required" });
        }
        const detail = await detailService.createDetail(req.body, req.file);
        return res.status(201).json(detail);
    }
    catch (error) {
        next(error);
    }
};
exports.createDetail = createDetail;
const updateDetail = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }
        const existingDetail = await detailService.getDetailByDocumentId(documentId);
        if (!existingDetail) {
            return res.status(404).json({ error: "Detail not found" });
        }
        const detail = await detailService.updateDetail(documentId, req.body, req.file);
        return res.json(detail);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDetail = updateDetail;
const deleteDetail = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }
        const existingDetail = await detailService.getDetailByDocumentId(documentId);
        if (!existingDetail) {
            return res.status(404).json({ error: "Detail not found" });
        }
        await detailService.deleteDetail(documentId);
        return res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDetail = deleteDetail;
//# sourceMappingURL=detail.controller.js.map