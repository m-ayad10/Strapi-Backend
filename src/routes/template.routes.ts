import { Router } from "express";
import * as templateController from "../controllers/template.controller";

const router = Router();

// Route to get all templates
router.get("/", templateController.getTemplates);

// Route to patch a specific tenant's template by domain
router.patch("/:domain", templateController.updateTenantTemplate);

export default router;
