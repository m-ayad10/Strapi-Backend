import { Router } from "express";
import * as tenantController from "../controllers/tenant.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Public routes
router.get("/:domain", tenantController.getTenant);

// Protected/Management routes
router.post("/", upload.single("banner"), tenantController.createTenant);
router.patch("/:id", upload.single("banner"), tenantController.updateTenant);
router.delete("/:id", tenantController.deleteTenant);

export default router;
