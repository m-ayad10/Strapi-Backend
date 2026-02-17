import { strapiClient } from "../config/config";
import { trimStrings } from "../utils/dataUtils";
import * as strapiApi from "../api/strapi.api";

export const getPackageByDocumentId = async (documentId: string) => {
    try {
        const response = await strapiApi.getPackageByDocumentId(documentId, "populate=image");
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
        image: {
            url: pkg.image?.url
                ? `${strapiClient.defaults.baseURL}${pkg.image.url}`
                : null,
            id: pkg.image?.id
        }
    };
};

export const createPackage = async (data: any, imageFile?: Express.Multer.File) => {
    let imageId;
    if (imageFile) {
        imageId = await strapiApi.uploadFile(imageFile);
    }

    const payload = trimStrings({
        ...data,
        image: imageId,
    });

    const response = await strapiApi.createPackage(payload, "populate=image");
    return formatPackage(response.data.data);
};

export const updatePackage = async (documentId: string, data: any, imageFile?: Express.Multer.File) => {
    let imageId;
    if (imageFile) {
        imageId = await strapiApi.uploadFile(imageFile);
    }

    const payload = trimStrings({
        ...data,
        ...(imageId && { image: imageId }),
    });

    const response = await strapiApi.updatePackage(documentId, payload, "populate=image");
    return formatPackage(response.data.data);
};

export const deletePackage = async (documentId: string) => {
    const response = await strapiApi.deletePackage(documentId);
    console.log(response.data)
    return response.data;
};
