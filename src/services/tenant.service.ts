import * as strapiApi from "../api/strapi.api";
import { formatDetail } from "../utils/dataUtils";

export const getTenantByDomain = async (domain: string) => {
    const filter = `filters[domain][$eq]=${domain}`;
    const response = await strapiApi.getDetails(filter);

    if (response.data.data.length === 0) {
        return null;
    }

    return formatDetail(response.data.data[0]);
};
