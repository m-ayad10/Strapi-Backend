import { StrapiSingleResponse, Package } from "../types/strapi.types";
export declare const getPackageByDocumentId: (documentId: string) => Promise<Package | null>;
export declare const createPackage: (data: any, imageFile?: Express.Multer.File) => Promise<Package>;
export declare const updatePackage: (documentId: string, data: any, imageFile?: Express.Multer.File) => Promise<Package>;
export declare const deletePackage: (documentId: string) => Promise<StrapiSingleResponse<Package>>;
//# sourceMappingURL=package.service.d.ts.map