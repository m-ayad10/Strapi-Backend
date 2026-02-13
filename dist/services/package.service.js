"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackage = exports.updatePackage = exports.createPackage = exports.getPackageByDocumentId = void 0;
const config_1 = require("../config/config");
const form_data_1 = __importDefault(require("form-data"));
const uploadFile = async (file) => {
    const form = new form_data_1.default();
    form.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });
    const response = await config_1.strapiClient.post("/api/upload", form, {
        headers: { ...form.getHeaders() },
    });
    const uploadedFile = response.data[0];
    if (!uploadedFile) {
        throw new Error("Failed to upload file");
    }
    return uploadedFile.id;
};
const getPackageByDocumentId = async (documentId) => {
    try {
        const response = await config_1.strapiClient.get(`/api/packages/${documentId}`);
        return response.data.data;
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};
exports.getPackageByDocumentId = getPackageByDocumentId;
const createPackage = async (data, imageFile) => {
    let imageId;
    if (imageFile) {
        imageId = await uploadFile(imageFile);
    }
    const payload = {
        ...data,
        image: imageId,
    };
    const response = await config_1.strapiClient.post("/api/packages&populate=image", { data: payload });
    return response.data.data;
};
exports.createPackage = createPackage;
const updatePackage = async (documentId, data, imageFile) => {
    let imageId;
    if (imageFile) {
        imageId = await uploadFile(imageFile);
    }
    const payload = {
        ...data,
        ...(imageId && { image: imageId }),
    };
    const response = await config_1.strapiClient.put(`/api/packages&populate=image/${documentId}`, { data: payload });
    return response.data.data;
};
exports.updatePackage = updatePackage;
const deletePackage = async (documentId) => {
    const response = await config_1.strapiClient.delete(`/api/packages/${documentId}`);
    console.log(response.data);
    return response.data;
};
exports.deletePackage = deletePackage;
//# sourceMappingURL=package.service.js.map