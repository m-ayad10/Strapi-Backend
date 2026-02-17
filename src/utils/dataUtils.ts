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

export const formatTemplate = (template: any) => {
    if (!template) return null;
    return {
        id: template.id,
        documentId: template.documentId,
        model: template.model,
        image: template.image?.url
            ? {
                id: template.image.id,
                url: `${strapiClient.defaults.baseURL}${template.image.url}`,
            }
            : null,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        publishedAt: template.publishedAt,
    };
};

export const formatTenant = (tenant: any) => {
    const formatted: any = {
        id: tenant.id,
        documentId: tenant.documentId,
        domain: tenant.domain,
        title: tenant.title,
        color: tenant.color,
        backgroundColor: tenant.backgroundColor,
        banner: tenant.banner?.url
            ? {
                id: tenant.banner.id,
                url: `${strapiClient.defaults.baseURL}${tenant.banner.url}`,
            }
            : null,
        template: formatTemplate(tenant.template),
    };

    if (tenant.packages && Array.isArray(tenant.packages)) {
        formatted.packages = tenant.packages.map((pkg: any) => ({
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

    if (tenant.sections && Array.isArray(tenant.sections)) {
        formatted.sections = tenant.sections.map((section: any) => {
            if (section.__component === "sections.testimonials") {
                return {
                    ...section,
                    testimonials: (section.testimonials || []).map((t: any) => ({
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
            if (section.__component === "sections.faq") {
                return {
                    ...section,
                    faqs: (section.faqs || []).map((faq: any) => ({
                        ...faq
                    }))
                };
            }
            return section;
        });
    }

    return formatted;
};
