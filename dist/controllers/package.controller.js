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
exports.deletePackage = exports.updatePackage = exports.createPackage = void 0;
const packageService = __importStar(require("../services/package.service"));
const validation_1 = require("../utils/validation");
const createPackage = async (req, res, next) => {
    try {
        const requiredFields = ["name", "price", "description", "detail"];
        const validationError = (0, validation_1.validateRequiredFields)(req.body, requiredFields);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        if (!(0, validation_1.isValidPrice)(req.body.price)) {
            return res.status(400).json({ error: "Price must be a valid number" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Package image is required" });
        }
        const pkg = await packageService.createPackage(req.body, req.file);
        return res.status(201).json(pkg);
    }
    catch (error) {
        next(error);
    }
};
exports.createPackage = createPackage;
const updatePackage = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }
        const existingPackage = await packageService.getPackageByDocumentId(documentId);
        if (!existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }
        if (req.body.price && !(0, validation_1.isValidPrice)(req.body.price)) {
            return res.status(400).json({ error: "Price must be a valid number" });
        }
        const pkg = await packageService.updatePackage(documentId, req.body, req.file);
        return res.json(pkg);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePackage = updatePackage;
const deletePackage = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }
        const existingPackage = await packageService.getPackageByDocumentId(documentId);
        if (!existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }
        await packageService.deletePackage(documentId);
        return res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deletePackage = deletePackage;
//# sourceMappingURL=package.controller.js.map