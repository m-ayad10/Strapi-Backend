import { Router } from "express";
import * as detailController from "../controllers/detail.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", upload.single("banner"), detailController.createDetail);
router.patch("/:id", upload.single("banner"), detailController.updateDetail);
router.delete("/:id", detailController.deleteDetail);

export default router;
