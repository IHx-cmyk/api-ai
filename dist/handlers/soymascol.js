"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = soyMascolHandler;
const axios_1 = __importDefault(require("axios"));
async function soyMascolAI(question) {
    if (!question)
        throw new Error("Parameter 'q' diperlukan.");
    const { data } = await axios_1.default.post("https://ai.soymaycol.icu/api/chat", {
        messages: [
            {
                id: Date.now().toString(),
                role: "user",
                content: question,
                experimental_attachments: []
            }
        ],
        modelId: "microsoft/Phi-4"
    }, {
        headers: { "Content-Type": "application/json" },
        responseType: 'text',
        validateStatus: () => true
    });
    const result = data
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => {
        try {
            const json = JSON.parse(line.replace("data:", "").trim());
            if (json.type === "text-delta" && json.delta)
                return json.delta;
            return '';
        }
        catch {
            return '';
        }
    })
        .join('');
    if (!result)
        throw new Error("Tidak ada balasan dari AI.");
    return result;
}
async function soyMascolHandler(req, res) {
    const question = (req.query.q || req.body.q);
    const session = (req.query.session || req.body.session);
    const apikey = (req.query.apikey || req.body.apikey);
    if (!question)
        return res.status(400).json({ status: false, message: "Parameter 'q' diperlukan." });
    if (!apikey)
        return res.status(401).json({ status: false, message: "Parameter 'apikey' diperlukan." });
    try {
        const answer = await soyMascolAI(question);
        res.json({
            status: true,
            name: "SoyMascol Chat",
            endpoint: "/api/ai/soyMascol",
            filename: "SoyMascol",
            response: answer,
            params: {
                q: question,
                session: session || null,
                apikey: apikey
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}
