import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginUser } from "../services/auth.service";
import { CONFIG } from "../config/config";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await loginUser(email, password);

        if (!result) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { token, user } = result;

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        return res.status(200).json({
            message: "Login successful",
            user,
            token // Sending token in response as well as requested
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
};

export const verifyToken = async (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
        return res.status(200).json({ user: decoded });
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
