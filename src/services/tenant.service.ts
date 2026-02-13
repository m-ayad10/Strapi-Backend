import { strapiClient } from "../config/config";
import { StrapiResponse, Detail } from "../types/strapi.types";

export const getTenantByDomain = async (domain: string) => {
    const response = await strapiClient.get<StrapiResponse<Detail>>(`http://localhost:1337/api/details?filters[domain][$eq]=${domain}&populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`);

    if (response.data.data.length === 0) {
        return null;
    }

    const tenant = response.data.data[0];
    if (!tenant) {
        return null;
    }
    const bannerUrl = `${strapiClient.defaults.baseURL}${tenant.banner?.formats?.thumbnail?.url}`
    const packages = tenant.packages?.map((pkg) => ({
        id: pkg.id,
        documentId: pkg.documentId,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        image: pkg.image?.url
            ? `${strapiClient.defaults.baseURL}${pkg.image.url}`
            : null,
    })) || []
    return {
        id: tenant.id,
        documentId: tenant.documentId,
        domain: tenant.domain,
        title: tenant.title,
        color: tenant.color,
        backgroundColor: tenant.backgroundColor,
        banner: tenant.banner
            ? bannerUrl
            : null,
        packages,
        sections: tenant.sections
    };
};
