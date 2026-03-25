"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bibleAIHandler;
const axios_1 = __importDefault(require("axios"));
async function bibleAIHandler(req, res) {
    const question = req.query.q;
    const apikey = req.query.apikey;
    if (!question || !apikey) {
        return res.status(400).json({
            creator: "Moli55",
            status: false,
            message: "Parameter 'q' dan 'apikey' wajib diisi"
        });
    }
    const translation = "TB";
    const language = "id";
    const filters = ["bible", "books", "articles"];
    const params = new URLSearchParams({
        question,
        translation,
        language,
        "filters[]": filters,
        pro: "false"
    });
    const url = `https://api.bibleai.com/v2/search?${params.toString()}`;
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Accept: "application/json",
                Origin: "https://bibleai.com",
                Referer: "https://bibleai.com/"
            }
        });
        if (!response.data || response.data.status !== 1) {
            return res.json({
                creator: "Moli55",
                status: false,
                message: "Tidak ada hasil"
            });
        }
        const { answer, sources } = response.data.data;
        let resultMsg = {
            answer,
            sources: [],
            question
        };
        if (Array.isArray(sources)) {
            const verses = sources.filter(s => s.type === "verse").slice(0, 10);
            resultMsg.sources = verses.map(s => s.text);
        }
        res.json({
            creator: "Moli55",
            status: true,
            response: resultMsg
        });
    }
    catch (err) {
        res.status(500).json({
            creator: "Moli55",
            status: false,
            message: err.message || "Internal Server Error"
        });
    }
}
