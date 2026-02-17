import { Request, Response, NextFunction } from "express";
import * as templateService from "../services/template.service";

/**
 * Get all available templates
 */
export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await templateService.getAllTemplates();
        return res.json(templates);
    } catch (error) {
        next(error);
    }
};

/**
 * Patch the template of a tenant
 */
export const updateTenantTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { templateId } = req.body as { templateId: string };

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!templateId) {
            return res.status(400).json({ error: "templateId (documentId) is required" });
        }

        const updatedTenant = await templateService.updateTenantTemplate(domain, templateId);
        return res.json(updatedTenant);
    } catch (error: any) {
        if (error.message === "Tenant not found") {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
