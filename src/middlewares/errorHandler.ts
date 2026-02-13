import { Request, Response, NextFunction } from "express";
import { isAxiosError } from "axios";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Unhandled Error:", err);

    if (isAxiosError(err)) {
        const status = err.response?.status || 502;
        const message = err.response?.data?.error?.message || err.message;
        const details = err.response?.data?.error?.details || err.response?.data || null;

        console.error("Strapi API Error Details:", JSON.stringify(details, null, 2));

        return res.status(status).json({
            error: "Strapi API Error",
            message: message,
            details: details,
        });
    }

    if (err instanceof Error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    return res.status(500).json({
        error: "Unknown Error",
    });
};
