import * as strapiApi from "../api/strapi.api";
import { formatTenant } from "../utils/dataUtils";

interface FaqItem {
    id?: number;
    questions: string;
    answers: string;
}

interface TestimonialItem {
    id?: number;
    name: string;
    role: string;
    quote: string;
    image?: any;
}

interface FaqSection {
    __component: "sections.faq";
    id?: number;
    title: string;
    faqs: FaqItem[];
}

interface TestimonialSection {
    __component: "sections.testimonials";
    id?: number;
    title: string;
    testimonials: Array<{
        name: string;
        role: string;
        quote: string;
        image: any;
    }>;
}

type Section = FaqSection | TestimonialSection;

/**
 * Fetch tenant entry by domain
 */
export const getTenantByDomain = async (domain: string) => {
    const filter = `filters[domain][$eq]=${encodeURIComponent(domain)}`;
    const response = await strapiApi.getTenants(filter);

    if (!response.data.data || response.data.data.length === 0) {
        throw new Error(`No tenant found for domain: ${domain}`);
    }

    return response.data.data[0];
};

/**
 * Get existing sections from tenant entry
 */
const getExistingSections = (tenant: any): Section[] => {
    return (tenant?.sections || []).filter((section: any) => {
        if (!section.__component) {
            console.warn("Section missing __component, skipping:", section);
            return false;
        }
        return true;
    });
};

/**
 * Find FAQ section index in existing sections
 */
const findFaqIndex = (sections: Section[]): number => {
    return sections.findIndex((s) => s.__component === "sections.faq");
};

/**
 * Find Testimonial section index in existing sections
 */
const findTestimonialIndex = (sections: Section[]): number => {
    return sections.findIndex((s) => s.__component === "sections.testimonials");
};

/**
 * Normalize media fields (convert objects to IDs)
 */
const normalizeMedia = (section: Section): Section => {
    if (section.__component === "sections.testimonials") {
        return {
            ...section,
            testimonials: section.testimonials.map((t) => ({
                ...t,
                image: typeof t.image === "object" ? t.image?.id : t.image,
            })),
        };
    }
    return section;
};

/**
 * Remove IDs from nested objects for Strapi v5 compatibility
 */
const removeIds = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(removeIds);
    } else if (typeof obj === 'object' && obj !== null) {
        const { id, ...rest } = obj;
        const newObj: any = {};
        for (const key in rest) {
            newObj[key] = removeIds(rest[key]);
        }
        return newObj;
    }
    return obj;
};

const updateSections = async (documentId: string, sections: Section[]) => {
    const normalized = sections.map((s) => {
        const withMedia = normalizeMedia(s);
        return removeIds(withMedia);
    });

    const response = await strapiApi.updateSections(documentId, normalized);

    return formatTenant(response.data.data);
};

/**
 * Add or update FAQ section
 */
export const addOrUpdateFaq = async (domain: string, title: string, newFaqs: FaqItem[]) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);

    const existingIndex = findFaqIndex(sections);

    if (existingIndex !== -1) {
        const existingFaqSection = sections[existingIndex] as FaqSection;
        const updatedFaqSection: FaqSection = {
            ...existingFaqSection,
            title: title || existingFaqSection.title,
            faqs: [...(existingFaqSection.faqs || []), ...newFaqs],
        };
        sections[existingIndex] = updatedFaqSection;
    } else {
        const newFaqSection: FaqSection = {
            __component: "sections.faq",
            title,
            faqs: newFaqs,
        };
        sections.push(newFaqSection);
    }

    return updateSections(tenant.documentId, sections);
};

/**
 * Replace entire FAQ section
 */
export const replaceFaq = async (domain: string, title: string, faqs: FaqItem[]) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);

    const existingIndex = findFaqIndex(sections);
    const newFaqSection: FaqSection = {
        __component: "sections.faq",
        title,
        faqs,
    };

    if (existingIndex !== -1) {
        sections[existingIndex] = newFaqSection;
    } else {
        sections.push(newFaqSection);
    }

    return updateSections(tenant.documentId, sections);
};

/**
 * Add or update Testimonial section
 */
export const addTestimonial = async (
    domain: string,
    title: string,
    newTestimonials: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);

    let imagePtr = 0;
    const testimonialsWithImages = [];

    for (const t of newTestimonials) {
        let imageId = t.image;
        if (typeof imageId === 'object' && imageId?.id) {
            imageId = imageId.id;
        }

        const imageFile = imageFiles && imageFiles[imagePtr];
        if (imageFile && (!imageId || typeof imageId !== 'number')) {
            try {
                imageId = await strapiApi.uploadFile(imageFile);
                imagePtr++;
            } catch (error) {
                console.error("Image upload failed for testimonial:", error);
            }
        }

        testimonialsWithImages.push({
            name: t.name,
            role: t.role,
            quote: t.quote,
            image: imageId || null,
        });
    }

    const existingIndex = findTestimonialIndex(sections);

    if (existingIndex !== -1) {
        const existingSection = sections[existingIndex] as TestimonialSection;
        sections[existingIndex] = {
            ...existingSection,
            title: title || existingSection.title,
            testimonials: [...(existingSection.testimonials || []), ...testimonialsWithImages],
        };
    } else {
        sections.push({
            __component: "sections.testimonials",
            title: title || "What Our Clients Say",
            testimonials: testimonialsWithImages,
        });
    }

    return updateSections(tenant.documentId, sections);
};

/**
 * Replace entire Testimonial section
 */
export const replaceTestimonial = async (
    domain: string,
    title: string,
    testimonials: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);

    let imagePtr = 0;
    const testimonialsWithImages = [];

    for (const t of testimonials) {
        let imageId = t.image;
        if (typeof imageId === 'object' && imageId?.id) {
            imageId = imageId.id;
        }

        const imageFile = imageFiles && imageFiles[imagePtr];
        if (imageFile && (!imageId || typeof imageId !== 'number')) {
            try {
                imageId = await strapiApi.uploadFile(imageFile);
                imagePtr++;
            } catch (error) {
                console.error("Image upload failed for testimonial:", error);
            }
        }

        testimonialsWithImages.push({
            name: t.name,
            role: t.role,
            quote: t.quote,
            image: imageId || null,
        });
    }

    const newSection: TestimonialSection = {
        __component: "sections.testimonials",
        title: title || "What Our Clients Say",
        testimonials: testimonialsWithImages,
    };

    const existingIndex = findTestimonialIndex(sections);
    if (existingIndex !== -1) {
        sections[existingIndex] = newSection;
    } else {
        sections.push(newSection);
    }

    return updateSections(tenant.documentId, sections);
};

/**
 * Delete FAQ section completely
 */
export const deleteFaq = async (domain: string) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);
    sections = sections.filter((s) => s.__component !== "sections.faq");
    return updateSections(tenant.documentId, sections);
};

/**
 * Delete Testimonial section completely
 */
export const deleteTestimonial = async (domain: string) => {
    const tenant = await getTenantByDomain(domain);
    let sections = getExistingSections(tenant);
    sections = sections.filter((s) => s.__component !== "sections.testimonials");
    return updateSections(tenant.documentId, sections);
};

/**
 * Get current sections structure
 */
export const getSections = async (domain: string) => {
    const tenant = await getTenantByDomain(domain);
    const sections = getExistingSections(tenant);
    const faqIdx = findFaqIndex(sections);
    const testimonialIdx = findTestimonialIndex(sections);

    return {
        faq: faqIdx !== -1 ? sections[faqIdx] : null,
        testimonial: testimonialIdx !== -1 ? sections[testimonialIdx] : null,
    };
};

/**
 * Reorder sections ONLY
 */
export const reorderSections = async (domain: string, newOrder: any[]) => {
    const tenant = await getTenantByDomain(domain);
    const existingSections = getExistingSections(tenant);
    const reordered: Section[] = [];

    for (const item of newOrder) {
        const comp = item.__component;
        if (!comp) continue;
        const found = existingSections.find(s => s.__component === comp);
        if (found) {
            reordered.push(found);
        }
    }

    existingSections.forEach(s => {
        if (!reordered.find(r => r.__component === s.__component)) {
            reordered.push(s);
        }
    });

    return updateSections(tenant.documentId, reordered);
};

/**
 * Bulk update and reorder sections
 */
export const updateSectionsBulk = async (
    domain: string,
    sectionsData: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const tenant = await getTenantByDomain(domain);
    const componentCounters: Record<string, number> = {};

    const validatedSections = await Promise.all(
        sectionsData.map(async (section: any) => {
            const comp = section.__component;
            if (!comp) throw new Error("Each section must have a __component field");

            componentCounters[comp] = (componentCounters[comp] || 0) + 1;
            if (componentCounters[comp] > 1) {
                throw new Error(`Component ${comp} can only exist once.`);
            }

            if (comp === "sections.testimonials") {
                const testimonials = section.testimonials || [];
                let imagePtr = 0;
                const testimonialsWithImages = [];

                for (const t of testimonials) {
                    let imageId = t.image;

                    if (imageFiles && imageFiles[imagePtr] && (!t.image || typeof t.image !== 'number')) {
                        const file = imageFiles[imagePtr];
                        if (file) {
                            imageId = await strapiApi.uploadFile(file);
                            imagePtr++;
                        }
                    } else if (typeof t.image === 'object' && t.image?.id) {
                        imageId = t.image.id;
                    }

                    testimonialsWithImages.push({
                        name: t.name,
                        role: t.role,
                        quote: t.quote,
                        image: imageId,
                    });
                }

                return {
                    __component: comp,
                    title: section.title,
                    testimonials: testimonialsWithImages,
                };
            }

            if (comp === "sections.faq") {
                return {
                    __component: comp,
                    title: section.title,
                    faqs: (section.faqs || []).map((f: any) => ({
                        questions: f.questions,
                        answers: f.answers,
                    })),
                };
            }

            return section;
        })
    );

    return updateSections(tenant.documentId, validatedSections);
};
