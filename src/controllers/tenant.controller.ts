import { Request, Response, NextFunction } from "express";
import * as tenantService from "../services/tenant.service";

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
