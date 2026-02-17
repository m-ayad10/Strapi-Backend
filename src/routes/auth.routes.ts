import { Router } from "express";
import { login, logout, verifyToken } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.get("/verify-token", verifyToken);
router.post("/logout", logout);

export default router;
