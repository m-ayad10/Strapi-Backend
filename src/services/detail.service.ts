import { strapiClient } from "../config/config";
import { StrapiResponse, StrapiSingleResponse, Detail, StrapiFile } from "../types/strapi.types";
import { createStrapiFormData } from "../utils/formData";
import { trimStrings } from "../utils/dataUtils";
import FormData from "form-data";

const uploadFile = async (file: Express.Multer.File): Promise<number> => {
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

const formatDetail = (detail: any) => {
    const bannerUrl = detail.banner?.url
        ? `${strapiClient.defaults.baseURL}${detail.banner.url}`
        : null;

    const formatted: any = {
        id: detail.id,
        documentId: detail.documentId,
        domain: detail.domain,
        title: detail.title,
        color: detail.color,
        backgroundColor: detail.backgroundColor,
        banner: bannerUrl,
    };

    if (detail.packages && Array.isArray(detail.packages)) {
        formatted.packages = detail.packages.map((pkg: any) => ({
            id: pkg.id,
            documentId: pkg.documentId,
            name: pkg.name,
            price: pkg.price,
            description: pkg.description,
            image: pkg.image?.url
                ? `${strapiClient.defaults.baseURL}${pkg.image.url}`
                : null,
        }));
    }

    if (detail.sections && Array.isArray(detail.sections)) {
        formatted.sections = detail.sections;
    }

    return formatted;
};

export const getDetailByDocumentId = async (documentId: string) => {
    try {
        const populate = `populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`;
        const response = await strapiClient.get<StrapiSingleResponse<Detail>>(`/api/details/${documentId}?${populate}`);
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
        bannerId = await uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        banner: bannerId,
    });

    const populate = `populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`;
    const response = await strapiClient.post<StrapiSingleResponse<Detail>>(`/api/details?${populate}`, { data: payload });

    return formatDetail(response.data.data);
};

export const updateDetail = async (documentId: string, data: any, bannerFile?: Express.Multer.File) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await uploadFile(bannerFile);
    }

    const payload = trimStrings({
        ...data,
        ...(bannerId && { banner: bannerId }),
    });

    const populate = `populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`;
    const response = await strapiClient.put<StrapiSingleResponse<Detail>>(`/api/details/${documentId}?${populate}`, { data: payload });
    return formatDetail(response.data.data);
};

export const deleteDetail = async (documentId: string) => {
    const response = await strapiClient.delete<StrapiSingleResponse<Detail>>(`/api/details/${documentId}`);
    return response.data;
};
