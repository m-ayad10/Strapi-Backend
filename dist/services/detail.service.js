"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetail = exports.updateDetail = exports.createDetail = exports.getDetailByDocumentId = void 0;
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
const getDetailByDocumentId = async (documentId) => {
    try {
        const response = await config_1.strapiClient.get(`/api/details/${documentId}`);
        return response.data.data;
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};
exports.getDetailByDocumentId = getDetailByDocumentId;
const createDetail = async (data, bannerFile) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await uploadFile(bannerFile);
    }
    const payload = {
        ...data,
        banner: bannerId,
    };
    const response = await config_1.strapiClient.post("/api/details", { data: payload });
    return response.data.data;
};
exports.createDetail = createDetail;
const updateDetail = async (documentId, data, bannerFile) => {
    let bannerId;
    if (bannerFile) {
        bannerId = await uploadFile(bannerFile);
    }
    const payload = {
        ...data,
        ...(bannerId && { banner: bannerId }),
    };
    const response = await config_1.strapiClient.put(`/api/details/${documentId}`, { data: payload });
    return response.data.data;
};
exports.updateDetail = updateDetail;
const deleteDetail = async (documentId) => {
    const response = await config_1.strapiClient.delete(`/api/details/${documentId}`);
    return response.data;
};
exports.deleteDetail = deleteDetail;
//# sourceMappingURL=detail.service.js.map