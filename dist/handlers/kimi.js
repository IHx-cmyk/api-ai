"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const crypto_1 = __importDefault(require("crypto"));
async function kimiAI(prompt) {
    const session_id = `session_${Date.now()}_${crypto_1.default.randomBytes(5).toString("hex")}`;
    const nonceRes = await axios_1.default.get("https://kimi-ai.chat/chat/", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        }
    });
    const nonce = nonceRes.data.match(/"nonce":"(.*?)"/)?.[1];
    if (!nonce)
        throw new Error("Gagal mengambil nonce");
    const data = qs_1.default.stringify({
        action: "kimi_send_message",
        nonce,
        message: prompt,
        model: "moonshotai/Kimi-K2-Instruct-0905",
        session_id
    });
    const res = await axios_1.default.post("https://kimi-ai.chat/wp-admin/admin-ajax.php", data, {
        headers: {
            accept: "*/*",
            "accept-language": "id-ID",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
            referer: "https://kimi-ai.chat/chat/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        }
    });
    if (!res.data?.success)
        throw new Error("Gagal mengambil respon dari Kimi AI");
    return res.data.data.message;
}
async function handler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await kimiAI(q);
        res.json({
            status: true,
            response: result
        });
    }
    catch (err) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        });
    }
}
