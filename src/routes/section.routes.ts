import { Router } from "express";
import * as sectionController from "../controllers/section.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/:domain", sectionController.getSections);
router.post("/:domain/faq", sectionController.addFaq);
router.patch("/:domain/faq", sectionController.replaceFaq);
router.delete("/:domain/faq", sectionController.deleteFaq);

// Testimonial Section (Bulk)
router.post("/:domain/testimonial", upload.array("images", 10), sectionController.addTestimonial);
router.patch("/:domain/testimonial", upload.array("images", 10), sectionController.replaceTestimonial);
router.delete("/:domain/testimonial", sectionController.deleteTestimonial);

// Bulk update for all sections (Reorder ONLY)
router.patch("/:domain/sections", sectionController.updateSections);

export default router;
