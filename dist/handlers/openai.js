"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const axios_1 = __importDefault(require("axios"));
async function fetchOpenAI() {
    const { data } = await axios_1.default.get("https://openai.idnet.my.id/chat.data", {
        headers: { "User-Agent": "Mozilla/5.0" }
    });
    const index = data.indexOf("content");
    const message = index !== -1 ? data[index + 1] : null;
    return message;
}
async function handler(req, res) {
    try {
        const prompt = (req.query.q || req.body.q);
        const message = await fetchOpenAI();
        if (!message) {
            return res.status(404).json({
                status: false,
                error: "Respon tidak ditemukan"
            });
        }
        res.json({
            status: true,
            response: message
        });
    }
    catch (err) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        });
    }
}
