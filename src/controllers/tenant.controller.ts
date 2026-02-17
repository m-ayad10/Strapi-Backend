import { Request, Response, NextFunction } from "express";
import * as tenantService from "../services/tenant.service";
import { validateRequiredFields } from "../utils/validation";

export const getTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { domain } = req.params as { domain: string };

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        const tenant = await tenantService.getTenantByDomain(domain);

        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        return res.json(tenant);
    } catch (error) {
        next(error);
    }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requiredFields = ["domain", "title", "color", "backgroundColor"];
        const validationError = validateRequiredFields(req.body, requiredFields);

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Banner image is required" });
        }

        const tenant = await tenantService.createTenant(req.body, req.file);
        return res.status(201).json(tenant);
    } catch (error) {
        next(error);
    }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingTenant = await tenantService.getTenantByDocumentId(documentId);
        if (!existingTenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        const tenant = await tenantService.updateTenant(documentId, req.body, req.file);
        return res.json(tenant);
    } catch (error) {
        next(error);
    }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: documentId } = req.params as { id: string };
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const existingTenant = await tenantService.getTenantByDocumentId(documentId);
        if (!existingTenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        await tenantService.deleteTenant(documentId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
