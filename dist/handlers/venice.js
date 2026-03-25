"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = veniceHandler;
const axios_1 = __importDefault(require("axios"));
async function veniceAI(question) {
    const { data } = await axios_1.default.post('https://outerface.venice.ai/api/inference/chat', {
        requestId: 'nekorinn',
        modelId: 'dolphin-3.0-mistral-24b',
        prompt: [{ content: question, role: 'user' }],
        systemPrompt: 'Jawablah menggunakan Bahasa Indonesia yang baik dan benar.',
        conversationType: 'text',
        temperature: 0.8,
        webEnabled: true,
        topP: 0.9,
        isCharacter: false,
        clientProcessingTime: 15
    }, {
        headers: {
            'accept': '*/*',
            'content-type': 'application/json',
            'origin': 'https://venice.ai',
            'referer': 'https://venice.ai/',
            'user-agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'x-venice-version': 'interface@20250523.214528+393d253'
        }
    });
    const chunks = data
        .split('\n')
        .filter((chunk) => chunk.trim())
        .map((chunk) => JSON.parse(chunk));
    return chunks.map((chunk) => chunk.content).join('');
}
async function veniceHandler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                creator: "Moli55",
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await veniceAI(q);
        res.json({
            creator: "Moli55",
            status: true,
            response: result
        });
    }
    catch (err) {
        res.status(500).json({
            creator: "Moli55",
            status: false,
            error: err.message || "internal server error"
        });
    }
}
