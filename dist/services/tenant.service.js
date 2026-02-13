"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantByDomain = void 0;
const config_1 = require("../config/config");
const getTenantByDomain = async (domain) => {
    var _a, _b, _c, _d;
    const response = await config_1.strapiClient.get(`http://localhost:1337/api/details?filters[domain][$eq]=${domain}&populate[banner]=true&populate[packages][populate][image]=true`);
    if (response.data.data.length === 0) {
        return null;
    }
    const tenant = response.data.data[0];
    if (!tenant) {
        return null;
    }
    const bannerUrl = `${config_1.strapiClient.defaults.baseURL}${(_c = (_b = (_a = tenant.banner) === null || _a === void 0 ? void 0 : _a.formats) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url}`;
    const packages = ((_d = tenant.packages) === null || _d === void 0 ? void 0 : _d.map((pkg) => {
        var _a;
        return ({
            id: pkg.id,
            documentId: pkg.documentId,
            name: pkg.name,
            price: pkg.price,
            description: pkg.description,
            image: ((_a = pkg.image) === null || _a === void 0 ? void 0 : _a.url)
                ? `${config_1.strapiClient.defaults.baseURL}${pkg.image.url}`
                : null,
        });
    })) || [];
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
        packages
    };
};
exports.getTenantByDomain = getTenantByDomain;
//# sourceMappingURL=tenant.service.js.map