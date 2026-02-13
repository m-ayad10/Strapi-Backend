import FormData from "form-data";
/**
 * Helper to build FormData for Strapi.
 * @param jsonBody The JSON payload (will be stringified under 'data' key)
 * @param filesMap Map of field names to file buffers/streams. Key should be the field name (e.g. 'files.banner')
 */
export declare const createStrapiFormData: (jsonBody: Record<string, any>, filesMap?: Record<string, {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}>) => FormData;
//# sourceMappingURL=formData.d.ts.map