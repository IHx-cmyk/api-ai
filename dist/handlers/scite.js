"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sciteHandler;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
async function sciteAI(prompt) {
    const anonId = (0, crypto_1.randomUUID)();
    const postRes = await axios_1.default.post("https://api.scite.ai/assistant/poll", {
        turns: [{ role: "user", content: prompt }],
        user_input: prompt,
        session_id: null,
        country: null,
        alwaysUseReferences: false,
        neverUseReferences: false,
        abstractsOnly: false,
        fullTextsOnly: false,
        numReferences: 25,
        rankBy: "relevance",
        answerLength: "medium",
        model: "gpt-4o-mini-2024-07-18",
        reasoningEffort: "medium",
        citationStyle: "apa",
        anon_id: anonId
    }, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 11; vivo 1901)",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Authorization": "Bearer null",
            "Origin": "https://scite.ai",
            "Referer": "https://scite.ai/"
        }
    });
    const taskId = postRes.data?.id;
    if (!taskId)
        throw new Error("Gagal mendapatkan taskId.");
    let resultData;
    while (true) {
        const getRes = await axios_1.default.get(`https://api.scite.ai/assistant/tasks/${taskId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 11; vivo 1901)",
                "Accept": "application/json, text/plain, */*",
                "Authorization": "Bearer null",
                "Origin": "https://scite.ai",
                "Referer": "https://scite.ai/"
            }
        });
        resultData = getRes.data;
        if (resultData.status === "SUCCESS")
            break;
        if (resultData.status === "FAILURE")
            throw new Error("AI Task Failed.");
        await new Promise(r => setTimeout(r, 2000));
    }
    const assistantTurn = resultData.result?.turns?.find((t) => t.role === "assistant");
    return assistantTurn?.content || "Tidak ada respon dari AI.";
}
async function sciteHandler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                creator: "Moli55",
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await sciteAI(q);
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
