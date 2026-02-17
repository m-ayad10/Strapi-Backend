import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
    STRAPI_URL: process.env.STRAPI_URL || "http://localhost:1337",
    STRAPI_TOKEN: process.env.STRAPI_TOKEN,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-key",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
};

export const strapiClient = axios.create({
    baseURL: CONFIG.STRAPI_URL,
    headers: {
        Authorization: `Bearer ${CONFIG.STRAPI_TOKEN}`,
    },
});
