import { strapiClient } from "../config/config";
import { StrapiResponse, StrapiSingleResponse, Package, StrapiFile } from "../types/strapi.types";
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

export const getPackageByDocumentId = async (documentId: string) => {
    try {
        const response = await strapiClient.get<StrapiSingleResponse<Package>>(`/api/packages/${documentId}?populate=image`);
        return formatPackage(response.data.data);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

const formatPackage = (pkg: any) => {
    return {
        id: pkg.id,
        documentId: pkg.documentId,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        image: pkg.image?.url
            ? `${strapiClient.defaults.baseURL}${pkg.image.url}`
            : null,
    };
};

export const createPackage = async (data: any, imageFile?: Express.Multer.File) => {
    let imageId;
    if (imageFile) {
        imageId = await uploadFile(imageFile);
    }

    const payload = trimStrings({
        ...data,
        image: imageId,
    });

    const response = await strapiClient.post<StrapiSingleResponse<Package>>("/api/packages?populate=image", { data: payload });
    return formatPackage(response.data.data);
};

export const updatePackage = async (documentId: string, data: any, imageFile?: Express.Multer.File) => {
    let imageId;
    if (imageFile) {
        imageId = await uploadFile(imageFile);
    }

    const payload = trimStrings({
        ...data,
        ...(imageId && { image: imageId }),
    });

    const response = await strapiClient.put<StrapiSingleResponse<Package>>(`/api/packages/${documentId}?populate=image`, { data: payload });
    return formatPackage(response.data.data);
};

export const deletePackage = async (documentId: string) => {
    const response = await strapiClient.delete<StrapiSingleResponse<Package>>(`/api/packages/${documentId}`);
    console.log(response.data)
    return response.data;
};
