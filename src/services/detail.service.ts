import { Detail } from "../types/strapi.types";
import { trimStrings, formatDetail } from "../utils/dataUtils";
import * as strapiApi from "../api/strapi.api";

export const getDetailByDocumentId = async (documentId: string) => {
    try {
        const response = await strapiApi.getDetailByDocumentId(documentId);
        return formatDetail(response.data.data);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

export const createDetail = async (data: any, bannerFile?: Express.Multer.File) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await strapiApi.uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        banner: bannerId,
    });

    const response = await strapiApi.createDetail(payload);

    return formatDetail(response.data.data);
};

export const updateDetail = async (documentId: string, data: any, bannerFile?: Express.Multer.File) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await strapiApi.uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        ...(bannerId && { banner: bannerId }),
    });

    const response = await strapiApi.updateDetail(documentId, payload);
    return formatDetail(response.data.data);
};

export const deleteDetail = async (documentId: string) => {
    const response = await strapiApi.deleteDetail(documentId);
    return response.data;
};
