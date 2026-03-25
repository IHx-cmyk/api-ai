"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = blackboxHandler;
const axios_1 = __importDefault(require("axios"));
async function blackboxAI(text) {
    if (!text)
        throw new Error("parameter 'text' diperlukan.");
    const payload = {
        messages: [
            { role: "user", content: text }
        ],
        id: "simple-chat",
        codeModelMode: true,
        userSystemPrompt: "Be a helpful assistant.",
        maxTokens: 1024,
        validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb"
    };
    const headers = {
        "Content-Type": "application/json",
        "Origin": "https://app.blackbox.ai",
        "Referer": "https://app.blackbox.ai/",
        "User-Agent": "Mozilla/5.0"
    };
    const { data } = await axios_1.default.post("https://app.blackbox.ai/api/chat", payload, { headers });
    let result = data;
    if (typeof result === "string") {
        result = result.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        return result;
    }
    if (result?.response) {
        return result.response.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    }
    return "Gagal mendapatkan respon.";
}
async function blackboxHandler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await blackboxAI(q);
        res.json({
            status: true,
            response: result
        });
    }
    catch (err) {
        res.status(500).json({
            status: false,
            error: err.response?.data || err.message || "internal server error"
        });
    }
}
