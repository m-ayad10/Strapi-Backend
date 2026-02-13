import FormData from "form-data";

/**
 * Helper to build FormData for Strapi.
 * @param jsonBody The JSON payload (will be stringified under 'data' key)
 * @param filesMap Map of field names to file buffers/streams. Key should be the field name (e.g. 'files.banner')
 */
export const createStrapiFormData = (
    jsonBody: Record<string, any>,
    filesMap?: Record<string, { buffer: Buffer; originalname: string; mimetype: string }>
): FormData => {
    const form = new FormData();

    // Strapi expects the JSON body to be stringified in the 'data' field
    if (jsonBody) {
        form.append("data", JSON.stringify(jsonBody));
    }

    // Append files if any
    // Strapi file upload convention: 
    // If uploading directly to 'upload' endpoint: keys are 'files'
    // If uploading as part of content creation: keys are 'files.fieldName'
    if (filesMap) {
        Object.entries(filesMap).forEach(([key, file]) => {
            form.append(key, file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        });
    }

    return form;
};
