export declare const getTenantByDomain: (domain: string) => Promise<{
    id: number;
    documentId: string;
    domain: string;
    title: string;
    color: string;
    backgroundColor: string;
    banner: string | null;
    packages: {
        id: number;
        documentId: string;
        name: string;
        price: number;
        description: string;
        image: string | null;
    }[];
} | null>;
//# sourceMappingURL=tenant.service.d.ts.map