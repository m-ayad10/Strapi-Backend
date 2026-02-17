import { Request, Response, NextFunction } from "express";
import * as sectionService from "../services/section.service";

export const getSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        const sections = await sectionService.getSections(domain);
        return res.json(sections);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const addFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { title, faqs } = req.body;

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!title || !faqs || !Array.isArray(faqs)) {
            return res.status(400).json({ error: "title and faqs array are required" });
        }

        const result = await sectionService.addOrUpdateFaq(domain, title, faqs);
        return res.json(result);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const replaceFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { title, faqs } = req.body;

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!title || !faqs || !Array.isArray(faqs)) {
            return res.status(400).json({ error: "title and faqs array are required" });
        }

        const result = await sectionService.replaceFaq(domain, title, faqs);
        return res.json(result);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const deleteFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        const result = await sectionService.deleteFaq(domain);
        return res.status(204).send();
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const addTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { title, testimonials: testimonialsJson } = req.body;

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!testimonialsJson) {
            return res.status(400).json({ error: "testimonials array is required" });
        }

        let testimonials;
        try {
            testimonials = typeof testimonialsJson === 'string' ? JSON.parse(testimonialsJson) : testimonialsJson;
        } catch (e) {
            return res.status(400).json({ error: "testimonials must be valid JSON" });
        }

        if (!Array.isArray(testimonials)) {
            return res.status(400).json({ error: "testimonials must be an array" });
        }

        const files = (req.files as Express.Multer.File[]) || [];
        const result = await sectionService.addTestimonial(domain, title, testimonials, files);

        return res.json(result);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const replaceTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { title, testimonials: testimonialsJson } = req.body;

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!testimonialsJson) {
            return res.status(400).json({ error: "testimonials array is required" });
        }

        let testimonials;
        try {
            testimonials = typeof testimonialsJson === 'string' ? JSON.parse(testimonialsJson) : testimonialsJson;
        } catch (e) {
            return res.status(400).json({ error: "testimonials must be valid JSON" });
        }

        if (!Array.isArray(testimonials)) {
            return res.status(400).json({ error: "testimonials must be an array" });
        }

        const files = (req.files as Express.Multer.File[]) || [];
        const result = await sectionService.replaceTestimonial(domain, title, testimonials, files);

        return res.json(result);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        const result = await sectionService.deleteTestimonial(domain);
        return res.status(204).send();
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

export const updateSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domain } = req.params as { domain: string };
        const { sections: sectionsJson } = req.body;

        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        if (!sectionsJson) {
            return res.status(400).json({ error: "sections array is required" });
        }

        let sections;
        try {
            sections = typeof sectionsJson === 'string' ? JSON.parse(sectionsJson) : sectionsJson;
        } catch (e) {
            return res.status(400).json({ error: "sections must be valid JSON" });
        }

        if (!Array.isArray(sections)) {
            return res.status(400).json({ error: "sections must be an array" });
        }

        const result = await sectionService.reorderSections(domain, sections);

        return res.json(result);
    } catch (error: any) {
        if (error.message?.includes("No tenant found")) {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
