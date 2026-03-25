"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = claudeAPI;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
function generateApiKey() {
    const r = Math.floor(1e11 * Math.random());
    return "tryit-" + r + "-a3edf17b505349f1794bcdbc7290a045";
}
function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
async function claudeAPI(req, res) {
    const text = req.query.text?.trim();
    const apikey = req.query.apikey?.trim();
    if (!text)
        return res.status(400).json({ status: false, message: "Parameter 'text' diperlukan" });
    if (!apikey)
        return res.status(400).json({ status: false, message: "Parameter 'apikey' diperlukan" });
    try {
        const apiKey = generateApiKey();
        const sessionUuid = generateUUID();
        const formData = new form_data_1.default();
        formData.append("chat_style", "claudeai_0");
        formData.append("chatHistory", JSON.stringify([{ role: "user", content: text }]));
        formData.append("model", "standard");
        formData.append("session_uuid", sessionUuid);
        formData.append("hacker_is_stinky", "very_stinky");
        const response = await axios_1.default.post("https://api.deepai.org/hacking_is_a_serious_crime", formData, {
            headers: {
                ...formData.getHeaders(),
                "api-key": apiKey,
                "user-agent": "Mozilla/5.0",
                "referer": "https://deepai.org/chat/claude-3-haiku",
                "accept": "*/*"
            }
        });
        res.json({ status: true, data: response.data });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: err.message || "Terjadi kesalahan saat menghubungi Claude." });
    }
}
