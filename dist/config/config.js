"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strapiClient = exports.CONFIG = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    STRAPI_URL: process.env.STRAPI_URL || "http://localhost:1337",
    STRAPI_TOKEN: process.env.STRAPI_TOKEN || "da1044b106ed269121dea45efc49b14df9914f67b4be9ee699c0e6d5af96b4bc462e41c6ae2c1afc102b23fdfa71b7d6eed42496d89231794769a792c18cf32e15232d5be2f520c61eba496ec430723220820e07c99ce17e609dda8cd51546c87c9d58f1b0cb0b5170168489e1bdb6391fd539027735ac9736166c4424fb1682",
    PORT: process.env.PORT || 3000,
};
exports.strapiClient = axios_1.default.create({
    baseURL: exports.CONFIG.STRAPI_URL,
    headers: {
        Authorization: `Bearer ${exports.CONFIG.STRAPI_TOKEN}`,
    },
});
//# sourceMappingURL=config.js.map