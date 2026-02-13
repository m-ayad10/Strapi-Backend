export const validateRequiredFields = (
    body: Record<string, any>,
    fields: string[]
): string | null => {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(", ")}`;
    }
    return null;
};

export const isValidPrice = (price: any): boolean => {
    return typeof price === 'number' || (!isNaN(parseFloat(price)) && isFinite(price));
};
