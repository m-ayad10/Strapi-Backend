import { StrapiSingleResponse, Detail } from "../types/strapi.types";
export declare const getDetailByDocumentId: (documentId: string) => Promise<Detail | null>;
export declare const createDetail: (data: any, bannerFile?: Express.Multer.File) => Promise<Detail>;
export declare const updateDetail: (documentId: string, data: any, bannerFile?: Express.Multer.File) => Promise<Detail>;
export declare const deleteDetail: (documentId: string) => Promise<StrapiSingleResponse<Detail>>;
//# sourceMappingURL=detail.service.d.ts.map