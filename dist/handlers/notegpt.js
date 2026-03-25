"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notegptHandler;
const axios_1 = __importDefault(require("axios"));
async function notegptAI(message) {
    if (!message)
        throw new Error("Parameter 'q' diperlukan");
    const response = await axios_1.default.post("https://notegpt.io/api/v2/chat/stream", {
        message,
        language: "ace",
        model: "deepseek-reasoner",
        tone: "default",
        length: "moderate",
        conversation_id: "641eed40-0865-4dcf-9b90-39c868e4b710"
    }, {
        headers: { "Content-Type": "application/json" },
        responseType: "stream"
    });
    let resultText = "";
    await new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
                if (line.startsWith("data:")) {
                    const payload = line.replace(/^data:\s*/, "");
                    if (payload === "[DONE]")
                        continue;
                    try {
                        const parsed = JSON.parse(payload);
                        if (parsed.text)
                            resultText += parsed.text;
                    }
                    catch { }
                }
            }
        });
        response.data.on("end", resolve);
        response.data.on("error", reject);
    });
    return resultText || "Tidak ada respons dari Notegpt";
}
async function notegptHandler(req, res) {
    try {
        const query = (req.query.q || req.body.q);
        if (!query) {
            return res.status(400).json({
                creator: "Moli55",
                status: false,
                error: "Parameter 'q' diperlukan"
            });
        }
        const aiResponse = await notegptAI(query);
        res.json({
            creator: "Moli55",
            status: true,
            response: aiResponse
        });
    }
    catch (err) {
        res.status(500).json({
            creator: "Moli55",
            status: false,
            error: err.message || "Internal Server Error"
        });
    }
}
