import { strapiClient } from "../config/config";

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

export const formatDetail = (detail: any) => {
    const formatted: any = {
        id: detail.id,
        documentId: detail.documentId,
        domain: detail.domain,
        title: detail.title,
        color: detail.color,
        backgroundColor: detail.backgroundColor,
        banner: detail.banner?.url
            ? {
                id: detail.banner.id,
                url: `${strapiClient.defaults.baseURL}${detail.banner.url}`,
            }
            : null,
    };

    if (detail.packages && Array.isArray(detail.packages)) {
        formatted.packages = detail.packages.map((pkg: any) => ({
            id: pkg.id,
            documentId: pkg.documentId,
            name: pkg.name,
            price: pkg.price,
            description: pkg.description,
            image: pkg.image?.url
                ? {
                    id: pkg.image.id,
                    url: `${strapiClient.defaults.baseURL}${pkg.image.url}`,
                }
                : null,
        }));
    }

    if (detail.sections && Array.isArray(detail.sections)) {
        formatted.sections = detail.sections.map((section: any) => {
            if (section.__component === "sections.testominal") {
                return {
                    ...section,
                    testominals: (section.testominals || []).map((t: any) => ({
                        ...t,
                        image: t.image?.url
                            ? {
                                id: t.image.id,
                                url: `${strapiClient.defaults.baseURL}${t.image.url}`,
                            }
                            : null,
                    })),
                };
            }
            return section;
        });
    }

    return formatted;
};
