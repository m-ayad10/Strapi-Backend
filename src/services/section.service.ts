import { strapiClient } from "../config/config";
import { StrapiResponse, StrapiSingleResponse } from "../types/strapi.types";
import FormData from "form-data";

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
    imagePath?: string;
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
        image: number | null;
    }>;
}

type Section = FaqSection | TestimonialSection;

/**
 * Upload image to Strapi
 */
const uploadImage = async (file: Express.Multer.File): Promise<number> => {
    const form = new FormData();
    form.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    const response = await strapiClient.post<any[]>("/api/upload", form, {
        headers: { ...form.getHeaders() },
    });

    const uploadedFile = response.data[0];
    if (!uploadedFile) {
        throw new Error("Failed to upload image");
    }

    return uploadedFile.id;
};

/**
 * Fetch detail entry by domain
 */
export const getDetailByDomain = async (domain: string) => {
    const response = await strapiClient.get<StrapiResponse<any>>(
        `/api/details?filters[domain][$eq]=${encodeURIComponent(
            domain
        )}&populate[banner]=true&populate[packages][populate][image]=true&populate[sections][on][sections.testominal][populate][testominals][populate][image]=true&populate[sections][on][sections.faq][populate][faqs]=*`
    );

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
 * Find FAQ section in existing sections
 */
const findFaqSection = (sections: Section[]): FaqSection | null => {
    return (sections.find((s) => s.__component === "sections.faq") as FaqSection) || null;
};

/**
 * Find Testimonial section in existing sections
 */
const findTestimonialSection = (sections: Section[]): TestimonialSection | null => {
    return (
        (sections.find((s) => s.__component === "sections.testominal") as TestimonialSection) || null
    );
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
 * Normalize media fields (convert objects to IDs)
 */
const normalizeMedia = (section: Section): Section => {
    if (section.__component === "sections.testominal") {
        return {
            ...section,
            testominals: section.testominals.map((t) => ({
                ...t,
                image: typeof t.image === "object" ? (t.image as any)?.id : t.image,
            })),
        };
    }
    return section;
};

/**
 * Update detail sections using documentId (Strapi v5)
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

    const response = await strapiClient.put<StrapiSingleResponse<any>>(
        `/api/details/${documentId}`,
        {
            data: {
                sections: normalized,
            },
        }
    );

    return response.data;
};

/**
 * Add or update FAQ section
 * - If FAQ section exists, adds new items to existing faqs array
 * - If FAQ section doesn't exist, creates new section
 * - Ensures only ONE FAQ section exists
 */
export const addOrUpdateFaq = async (domain: string, title: string, newFaqs: FaqItem[]) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);
    console.log("newFaqs", newFaqs)
    const existingFaqSection = findFaqSection(sections);
    console.log("existingFaqSection", existingFaqSection);
    if (existingFaqSection) {
        const updatedFaqSection: FaqSection = {
            ...existingFaqSection,
            title: title || existingFaqSection.title,
            faqs: [...existingFaqSection.faqs, ...newFaqs],
        };

        // Remove old FAQ section and add updated one
        sections = removeFaqSection(sections);
        sections.push(updatedFaqSection);
    } else {
        // Create new FAQ section
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
 * - Replaces all FAQs with new ones
 * - Ensures only ONE FAQ section exists
 */
export const replaceFaq = async (domain: string, title: string, faqs: FaqItem[]) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    // Remove existing FAQ section if any
    sections = removeFaqSection(sections);

    // Create new FAQ section
    const newFaqSection: FaqSection = {
        __component: "sections.faq",
        title,
        faqs,
    };

    sections.push(newFaqSection);

    return updateSections(detail.documentId, sections);
};

/**
 * Add or update Testimonial section
 * - If Testimonial section exists, adds new items to existing testominals array
 * - If Testimonial section doesn't exist, creates new section
 * - Ensures only ONE Testimonial section exists
 * - Handles image uploads
 */
export const addOrUpdateTestimonial = async (
    domain: string,
    title: string,
    newTestimonials: TestimonialItem[],
    imageFiles?: Express.Multer.File[]
) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    // Upload images and prepare testimonial data
    const testimonialsWithImages = await Promise.all(
        newTestimonials.map(async (t, index) => {
            let imageId: number | null = null;

            const imageFile = imageFiles && imageFiles[index];
            if (imageFile) {
                try {
                    imageId = await uploadImage(imageFile);
                } catch (error) {
                    console.error("Image upload failed for testimonial:", error);
                    // Continue without image
                }
            }

            return {
                name: t.name,
                role: t.role,
                quote: t.quote,
                image: imageId,
            };
        })
    );

    const existingTestimonialSection = findTestimonialSection(sections);

    if (existingTestimonialSection) {
        // Update existing Testimonial section - merge new testimonials
        const updatedTestimonialSection: TestimonialSection = {
            ...existingTestimonialSection,
            title, // Update title
            testominals: [...existingTestimonialSection.testominals, ...testimonialsWithImages],
        };

        // Remove old Testimonial section and add updated one
        sections = removeTestimonialSection(sections);
        sections.push(updatedTestimonialSection);
    } else {
        // Create new Testimonial section
        const newTestimonialSection: TestimonialSection = {
            __component: "sections.testominal",
            title,
            testominals: testimonialsWithImages,
        };

        sections.push(newTestimonialSection);
    }

    return updateSections(detail.documentId, sections);
};

/**
 * Replace entire Testimonial section
 * - Replaces all testimonials with new ones
 * - Ensures only ONE Testimonial section exists
 * - Handles image uploads
 */
export const replaceTestimonial = async (
    domain: string,
    title: string,
    testimonials: TestimonialItem[],
    imageFiles?: Express.Multer.File[]
) => {
    const detail = await getDetailByDomain(domain);
    let sections = getExistingSections(detail);

    // Upload images and prepare testimonial data
    const testimonialsWithImages = await Promise.all(
        testimonials.map(async (t, index) => {
            let imageId: number | null = null;

            const imageFile = imageFiles && imageFiles[index];
            if (imageFile) {
                try {
                    imageId = await uploadImage(imageFile);
                } catch (error) {
                    console.error("Image upload failed for testimonial:", error);
                }
            }

            return {
                name: t.name,
                role: t.role,
                quote: t.quote,
                image: imageId,
            };
        })
    );

    // Remove existing Testimonial section if any
    sections = removeTestimonialSection(sections);

    // Create new Testimonial section
    const newTestimonialSection: TestimonialSection = {
        __component: "sections.testominal",
        title,
        testominals: testimonialsWithImages,
    };

    sections.push(newTestimonialSection);

    return updateSections(detail.documentId, sections);
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

    return {
        faq: findFaqSection(sections),
        testimonial: findTestimonialSection(sections),
    };
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
                            imageId = await uploadImage(file);
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
