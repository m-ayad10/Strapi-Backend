import { Router } from "express";
import * as tenantController from "../controllers/tenant.controller";

const router = Router();

router.get("/:domain", tenantController.getTenant);

export default router;
