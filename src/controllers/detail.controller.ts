import { Request, Response, NextFunction } from "express";
import * as detailService from "../services/detail.service";
import { validateRequiredFields } from "../utils/validation";

export const createDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requiredFields = ["domain", "title", "color", "backgroundColor"];
        const validationError = validateRequiredFields(req.body, requiredFields);

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Banner image is required" });
        }

        const detail = await detailService.createDetail(req.body, req.file);
        return res.status(201).json(detail);
    } catch (error) {
        next(error);
    }
};

export const updateDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingDetail = await detailService.getDetailByDocumentId(documentId);
        if (!existingDetail) {
            return res.status(404).json({ error: "Detail not found" });
        }

        const detail = await detailService.updateDetail(documentId, req.body, req.file);
        return res.json(detail);
    } catch (error) {
        next(error);
    }
};

export const deleteDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingDetail = await detailService.getDetailByDocumentId(documentId);
        if (!existingDetail) {
            return res.status(404).json({ error: "Detail not found" });
        }

        await detailService.deleteDetail(documentId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
