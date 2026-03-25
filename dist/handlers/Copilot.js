"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const axios_1 = __importDefault(require("axios"));
async function fetchCopilot(prompt) {
    const { data } = await axios_1.default.get("https://www.kitsulabs.xyz/api/v1/copilot", {
        params: {
            model: "gpt-5",
            prompt: prompt
        }
    });
    return data?.data?.text || null;
}
async function handler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await fetchCopilot(q);
        if (!result) {
            return res.status(404).json({
                status: false,
                error: "Respon tidak ditemukan"
            });
        }
        res.json({
            status: true,
            response: result
        });
    }
    catch (err) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        });
    }
}
