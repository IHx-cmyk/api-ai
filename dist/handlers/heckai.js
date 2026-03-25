"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = heckai;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
async function heckai(req, res) {
    const text = req.query.text?.trim();
    if (!text)
        return res.status(400).json({ status: false, message: "Parameter 'text' diperlukan" });
    try {
        const sessionId = (0, uuid_1.v4)();
        const apiRes = await axios_1.default.post("https://api.heckai.weight-wave.com/api/ha/v1/chat", {
            model: "meta-llama/llama-4-scout",
            question: text,
            language: "Indonesian",
            sessionId: sessionId,
            previousQuestion: text,
            previousAnswer: null
        }, {
            headers: { "Content-Type": "application/json" },
            responseType: "stream"
        });
        let answer = "";
        await new Promise((resolve, reject) => {
            apiRes.data.on("data", (chunk) => {
                const lines = chunk.toString().split("\n");
                for (let line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.replace("data: ", "").trim();
                        if (data && !data.startsWith("[") && !data.includes("✩")) {
                            answer += data;
                        }
                    }
                }
            });
            apiRes.data.on("end", resolve);
            apiRes.data.on("error", reject);
        });
        if (!answer)
            answer = "Tidak ada respon.";
        res.json({ status: true, answer: answer.trim() });
    }
    catch (err) {
        res.status(500).json({ status: false, message: err?.response?.data || err.message || "Gagal memproses HeckAI" });
    }
}
