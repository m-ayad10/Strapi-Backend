import * as strapiApi from "../api/strapi.api";
import { formatTemplate, formatTenant } from "../utils/dataUtils";
import { getTenantByDomain } from "./tenant.service";

/**
 * Fetch all available templates
 */
export const getAllTemplates = async () => {
    const response = await strapiApi.getTemplates();
    return response.data.data.map((template: any) => formatTemplate(template));
};

/**
 * Update the template of a tenant by domain
 * @param domain - The domain of the tenant
 * @param templateId - The documentId of the new template
 */
export const updateTenantTemplate = async (domain: string, templateId: string) => {
    const tenant = await getTenantByDomain(domain);
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    const payload = {
        template: templateId,
    };

    const response = await strapiApi.updateTenant(tenant.documentId, payload);
    return formatTenant(response.data.data);
};
