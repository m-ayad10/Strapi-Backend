export interface StrapiResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
export interface StrapiSingleResponse<T> {
    data: T;
    meta: {};
}
export interface StrapiFile {
    id: number;
    documentId: string;
    name: string;
    url: string;
    formats?: {
        thumbnail?: {
            url: string;
            name: string;
            hash: string;
            ext: string;
            mime: string;
            width: number;
            height: number;
            size: number;
        };
    };
}
export interface Package {
    id: number;
    documentId: string;
    name: string;
    price: number;
    description: string;
    image?: StrapiFile;
}
export interface Detail {
    id: number;
    documentId: string;
    domain: string;
    title: string;
    color: string;
    backgroundColor: string;
    banner?: StrapiFile;
    packages?: Package[];
}
//# sourceMappingURL=strapi.types.d.ts.map