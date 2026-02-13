export const trimStrings = (data: any): any => {
    if (typeof data === "string") {
        return data.trim();
    }
    if (Array.isArray(data)) {
        return data.map((item) => trimStrings(item));
    }
    if (data !== null && typeof data === "object") {
        const trimmedData: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                trimmedData[key] = trimStrings(data[key]);
            }
        }
        return trimmedData;
    }
    return data;
};
