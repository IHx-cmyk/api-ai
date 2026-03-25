"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = iAskGPTHandler;
const axios_1 = __importDefault(require("axios"));
async function iAskGPT(question) {
    if (!question)
        throw new Error('Question is required.');
    const systemPrompt = "Kamu adalah GPT, sebuah model bahasa besar yang dilatih oleh OpenAI. Jawablah semua pertanyaan dengan gaya bahasa GPT yang profesional, cerdas, dan sangat membantu. Aku adalah GPT.\n\n";
    const payload = {
        stream: false,
        prompt: systemPrompt + question
    };
    try {
        const response = await axios_1.default.post('https://api.iask.ai/v1/query', payload, {
            headers: {
                'Authorization': 'Bearer HD7zrGqqvMy-YgGWMdSSNKGpyMFtvTpEXQUtPYfKz7I',
                'Content-Type': 'application/json'
            },
            timeout: 120000
        });
        const result = response.data.response?.message;
        if (result) {
            return result;
        }
        else {
            throw new Error('No response message found from iAsk API');
        }
    }
    catch (err) {
        throw err;
    }
}
async function iAskGPTHandler(req, res) {
    const q = req.query.q;
    if (!q) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'q' diperlukan."
        });
    }
    try {
        const result = await iAskGPT(q);
        res.json({
            status: true,
            response: result
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}
