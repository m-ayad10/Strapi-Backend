import { Router } from "express";
import * as sectionController from "../controllers/section.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/:domain", sectionController.getSections);
router.post("/:domain/faq", sectionController.addFaq);
router.put("/:domain/faq", sectionController.replaceFaq);
router.delete("/:domain/faq", sectionController.deleteFaq);
router.post("/:domain/testimonial", upload.array("images", 10), sectionController.addTestimonial);
router.put("/:domain/testimonial", upload.array("images", 10), sectionController.replaceTestimonial);
router.delete("/:domain/testimonial", sectionController.deleteTestimonial);

router.put("/:domain/sections", upload.array("images", 10), sectionController.updateSections);

export default router;
