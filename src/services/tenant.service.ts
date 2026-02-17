import { trimStrings, formatTenant } from "../utils/dataUtils";
import * as strapiApi from "../api/strapi.api";

export const getTenantByDomain = async (domain: string) => {
    const filter = `filters[domain][$eq]=${domain}`;
    const response = await strapiApi.getTenants(filter);

    if (response.data.data.length === 0) {
        return null;
    }

    return formatTenant(response.data.data[0]);
};

export const getTenantByDocumentId = async (documentId: string) => {
    try {
        const response = await strapiApi.getTenantByDocumentId(documentId);
        return formatTenant(response.data.data);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

export const createTenant = async (data: any, bannerFile?: Express.Multer.File) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await strapiApi.uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        banner: bannerId,
    });

    const response = await strapiApi.createTenant(payload);
    return formatTenant(response.data.data);
};

export const updateTenant = async (documentId: string, data: any, bannerFile?: Express.Multer.File) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await strapiApi.uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        ...(bannerId && { banner: bannerId }),
    });

    const response = await strapiApi.updateTenant(documentId, payload);
    return formatTenant(response.data.data);
};

export const deleteTenant = async (documentId: string) => {
    const response = await strapiApi.deleteTenant(documentId);
    return response.data;
};
