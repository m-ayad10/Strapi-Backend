import { Router } from "express";
import * as packageController from "../controllers/package.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", upload.single("image"), packageController.createPackage);
router.patch("/:id", upload.single("image"), packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);

export default router;
