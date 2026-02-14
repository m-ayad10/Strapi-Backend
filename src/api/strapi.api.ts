import { strapiClient } from "../config/config";
import { StrapiResponse, StrapiSingleResponse, StrapiFile } from "../types/strapi.types";
import FormData from "form-data";

/**
 * Common population string for Details
 */
export const DETAIL_POPULATE = `populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`;

/**
 * Upload a file to Strapi
 */
export const uploadFile = async (file: Express.Multer.File): Promise<number> => {
    const form = new FormData();
    form.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    const response = await strapiClient.post<StrapiFile[]>("/api/upload", form, {
        headers: { ...form.getHeaders() },
    });

    const uploadedFile = response.data[0];
    if (!uploadedFile) {
        throw new Error("Failed to upload file");
    }

    return uploadedFile.id;
};

/**
 * Detail API calls
 */
export const getDetails = async (params: string = "") => {
    const query = params ? `&${params}` : "";
    return await strapiClient.get<StrapiResponse<any>>(`/api/details?${DETAIL_POPULATE}${query}`);
};

export const getDetailByDocumentId = async (documentId: string, params: string = "") => {
    const query = params ? `&${params}` : "";
    return await strapiClient.get<StrapiSingleResponse<any>>(`/api/details/${documentId}?${DETAIL_POPULATE}${query}`);
};

export const createDetail = async (data: any, params: string = "") => {
    const query = params ? `&${params}` : "";
    return await strapiClient.post<StrapiSingleResponse<any>>(`/api/details?${DETAIL_POPULATE}${query}`, { data });
};

export const updateDetail = async (documentId: string, data: any, params: string = "") => {
    const query = params ? `&${params}` : "";
    return await strapiClient.put<StrapiSingleResponse<any>>(`/api/details/${documentId}?${DETAIL_POPULATE}${query}`, { data });
};

export const deleteDetail = async (documentId: string) => {
    return await strapiClient.delete<StrapiSingleResponse<any>>(`/api/details/${documentId}`);
};

/**
 * Package API calls
 */
export const getPackageByDocumentId = async (documentId: string, params: string = "") => {
    const query = params ? `?${params}` : "";
    return await strapiClient.get<StrapiSingleResponse<any>>(`/api/packages/${documentId}${query}`);
};

export const createPackage = async (data: any, params: string = "") => {
    const query = params ? `?${params}` : "";
    return await strapiClient.post<StrapiSingleResponse<any>>(`/api/packages${query}`, { data });
};

export const updatePackage = async (documentId: string, data: any, params: string = "") => {
    const query = params ? `?${params}` : "";
    return await strapiClient.put<StrapiSingleResponse<any>>(`/api/packages/${documentId}${query}`, { data });
};

export const deletePackage = async (documentId: string) => {
    return await strapiClient.delete<StrapiSingleResponse<any>>(`/api/packages/${documentId}`);
};

/**
 * Section API calls
 */
export const updateSections = async (documentId: string, sections: any[]) => {
    return await strapiClient.put<StrapiSingleResponse<any>>(
        `/api/details/${documentId}?${DETAIL_POPULATE}`,
        {
            data: {
                sections,
            },
        }
    );
};
