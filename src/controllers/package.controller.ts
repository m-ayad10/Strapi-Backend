import { Request, Response, NextFunction } from "express";
import * as packageService from "../services/package.service";
import { isValidPrice, validateRequiredFields } from "../utils/validation";

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requiredFields = ["name", "price", "description", "detail"];
        const validationError = validateRequiredFields(req.body, requiredFields);

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        if (!isValidPrice(req.body.price)) {
            return res.status(400).json({ error: "Price must be a valid number" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Package image is required" });
        }

        const pkg = await packageService.createPackage(req.body, req.file);
        return res.status(201).json(pkg);
    } catch (error) {
        next(error);
    }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingPackage = await packageService.getPackageByDocumentId(documentId);
        if (!existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }

        if (req.body.price && !isValidPrice(req.body.price)) {
            return res.status(400).json({ error: "Price must be a valid number" });
        }

        const pkg = await packageService.updatePackage(documentId, req.body, req.file);
        return res.json(pkg);
    } catch (error) {
        next(error);
    }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingPackage = await packageService.getPackageByDocumentId(documentId);
        if (!existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }

        await packageService.deletePackage(documentId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
