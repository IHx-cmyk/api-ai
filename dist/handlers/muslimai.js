"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = muslimAiHandler;
const axios_1 = __importDefault(require("axios"));
async function muslimAiHandler(req, res) {
    const query = req.query.q?.trim();
    if (!query) {
        res.status(400);
        res.setHeader("Content-Type", "application/json");
        return res.json({ status: false, message: "Parameter 'q' wajib diisi" });
    }
    try {
        const searchUrl = 'https://www.muslimai.io/api/search';
        const headers = { 'Content-Type': 'application/json' };
        const searchResponse = await axios_1.default.post(searchUrl, { query: query }, { headers });
        const passages = searchResponse.data.map((item) => item.content).join('\n\n');
        const answerUrl = 'https://www.muslimai.io/api/answer';
        const prompt = `Use the following passages to answer the query to the best of your ability as a world class expert in the Quran. Do not mention that you were provided any passages in your answer: ${query}\n\n${passages}`;
        const answerResponse = await axios_1.default.post(answerUrl, { prompt: prompt }, { headers });
        res.json({
            status: true,
            creator: "Moli55",
            data: {
                answer: answerResponse.data,
                sources: searchResponse.data
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500);
        res.json({
            status: false,
            message: "Gagal mendapatkan respon dari Muslim AI",
            error: err.message
        });
    }
}
