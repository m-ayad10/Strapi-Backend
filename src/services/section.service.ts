import * as strapiApi from "../api/strapi.api";
import { formatDetail } from "../utils/dataUtils";

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
    __component: "sections.testominal";
    id?: number;
    title: string;
    testominals: Array<{
        name: string;
        role: string;
        quote: string;
        image: any;
    }>;
}

type Section = FaqSection | TestimonialSection;

/**
 * Fetch detail entry by domain
 */
export const getDetailByDomain = async (domain: string) => {
    const filter = `filters[domain][$eq]=${encodeURIComponent(domain)}`;
    const response = await strapiApi.getDetails(filter);

    if (!response.data.data || response.data.data.length === 0) {
        throw new Error(`No detail found for domain: ${domain}`);
    }

    return response.data.data[0];
};

/**
 * Get existing sections from detail entry
 */
const getExistingSections = (detail: any): Section[] => {
    return (detail?.sections || []).filter((section: any) => {
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
    return sections.findIndex((s) => s.__component === "sections.testominal");
};

/**
 * Normalize media fields (convert objects to IDs)
 */
const normalizeMedia = (section: Section): Section => {
    if (section.__component === "sections.testominal") {
        return {
            ...section,
            testominals: section.testominals.map((t) => ({
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

    return formatDetail(response.data.data);
};

/**
 * Add or update FAQ section
 * - Preserves original section order
 */
export const addOrUpdateFaq = async (domain: string, title: string, newFaqs: FaqItem[]) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

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

    return updateSections(detail.documentId, sections);
};

/**
 * Replace entire FAQ section
 * - Preserves original section order
 */
export const replaceFaq = async (domain: string, title: string, faqs: FaqItem[]) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

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

    return updateSections(detail.documentId, sections);
};

/**
 * Add or update Testimonial section (Append logic)
 * - Preserves original section order
 * - Fixed sequential image upload
 */
export const addTestimonial = async (
    domain: string,
    title: string,
    newTestimonials: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    // Upload images sequentially
    let imagePtr = 0;
    const testimonialsWithImages = [];

    for (const t of newTestimonials) {
        let imageId = t.image;
        if (typeof imageId === 'object' && imageId?.id) {
            imageId = imageId.id;
        }

        const imageFile = imageFiles && imageFiles[imagePtr];
        // If it's a new testimonial (no image ID) or explicitly needs a new upload
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
            testominals: [...(existingSection.testominals || []), ...testimonialsWithImages],
        };
    } else {
        sections.push({
            __component: "sections.testominal",
            title: title || "What Our Clients Say",
            testominals: testimonialsWithImages,
        });
    }

    return updateSections(detail.documentId, sections);
};

/**
 * Replace entire Testimonial section
 * - Preserves original section order
 * - Fixed sequential image upload
 */
export const replaceTestimonial = async (
    domain: string,
    title: string,
    testimonials: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    // Upload images sequentially
    let imagePtr = 0;
    const testimonialsWithImages = [];

    for (const t of testimonials) {
        let imageId = t.image;
        if (typeof imageId === 'object' && imageId?.id) {
            imageId = imageId.id;
        }

        const imageFile = imageFiles && imageFiles[imagePtr];
        // If it's a new testimonial or we are replacing images
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
        __component: "sections.testominal",
        title: title || "What Our Clients Say",
        testominals: testimonialsWithImages,
    };

    const existingIndex = findTestimonialIndex(sections);
    if (existingIndex !== -1) {
        sections[existingIndex] = newSection;
    } else {
        sections.push(newSection);
    }

    return updateSections(detail.documentId, sections);
};

/**
 * Remove FAQ section from sections array
 */
const removeFaqSection = (sections: Section[]): Section[] => {
    return sections.filter((s) => s.__component !== "sections.faq");
};

/**
 * Remove Testimonial section from sections array
 */
const removeTestimonialSection = (sections: Section[]): Section[] => {
    return sections.filter((s) => s.__component !== "sections.testominal");
};

/**
 * Delete FAQ section completely
 */
export const deleteFaq = async (domain: string) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    sections = removeFaqSection(sections);

    return updateSections(detail.documentId, sections);
};

/**
 * Delete Testimonial section completely
 */
export const deleteTestimonial = async (domain: string) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    sections = removeTestimonialSection(sections);

    return updateSections(detail.documentId, sections);
};

/**
 * Get current sections structure
 */
export const getSections = async (domain: string) => {
    const detail = await getDetailByDomain(domain);
    const sections = getExistingSections(detail);
    const faqIdx = findFaqIndex(sections);
    const testimonialIdx = findTestimonialIndex(sections);

    return {
        faq: faqIdx !== -1 ? sections[faqIdx] : null,
        testimonial: testimonialIdx !== -1 ? sections[testimonialIdx] : null,
    };
};

/**
 * Reorder sections ONLY
 * - Takes an array of section identifiers (like { __component: "..." })
 * - Matches them against existing sections
 * - Updates Strapi with the new order, preserving all existing content
 */
export const reorderSections = async (domain: string, newOrder: any[]) => {
    const detail = await getDetailByDomain(domain);
    const existingSections = getExistingSections(detail);

    // Rearrange complete existing section objects based on the new order of components
    const reordered: Section[] = [];

    for (const item of newOrder) {
        const comp = item.__component;
        if (!comp) continue;

        const found = existingSections.find(s => s.__component === comp);
        if (found) {
            reordered.push(found);
        }
    }

    // Optional: Add back any sections not mentioned in the new order at the end
    // (Though usually the frontend should send all of them)
    existingSections.forEach(s => {
        if (!reordered.find(r => r.__component === s.__component)) {
            reordered.push(s);
        }
    });

    return updateSections(detail.documentId, reordered);
};

/**
 * Bulk update and reorder sections
 * - Enforces single-instance rule
 * - Handles image uploads for testimonials
 * - Preserves order from the input array
 */
export const updateSectionsBulk = async (
    domain: string,
    sectionsData: any[],
    imageFiles?: Express.Multer.File[]
) => {
    const detail = await getDetailByDomain(domain);
    const componentCounters: Record<string, number> = {};

    // 1. Validate single instance rule & Normalize components
    const validatedSections = await Promise.all(
        sectionsData.map(async (section: any) => {
            const comp = section.__component;
            if (!comp) throw new Error("Each section must have a __component field");

            // Enforce single instance
            componentCounters[comp] = (componentCounters[comp] || 0) + 1;
            if (componentCounters[comp] > 1) {
                throw new Error(`Component ${comp} can only exist once.`);
            }

            // 2. Handle specific component logic (like images)
            if (comp === "sections.testominal") {
                const testimonials = section.testominals || [];
                let imagePtr = 0;
                const testimonialsWithImages = [];

                for (const t of testimonials) {
                    let imageId = t.image;

                    // If it's a new testimonial or needs update and we have files
                    // Note: This logic depends on how frontend sends files. 
                    // For simplicity, we assume files match items that don't have IDs or 
                    // have a flag. Here we just take files sequentially if they are provided 
                    // and the item expects an image.
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
                    testominals: testimonialsWithImages,
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

    // 3. Update Strapi
    return updateSections(detail.documentId, validatedSections);
};
