"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = espHandler;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const uuid_1 = require("uuid");
class ChatEspanyolBot {
    constructor() {
        this.baseUrl = "https://chatespanolaigratis.com/en/";
        this.ajaxUrl = "https://chatespanolaigratis.com/wp-admin/admin-ajax.php";
        this.config = {
            nonce: null,
            botId: null,
            postId: null
        };
        this.headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": this.baseUrl,
            "Origin": "https://chatespanolaigratis.com",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        };
    }
    async refreshTokens() {
        const { data } = await axios_1.default.get(this.baseUrl, {
            headers: { "User-Agent": this.headers["User-Agent"] }
        });
        const $ = cheerio.load(data);
        const container = $('div[id^="aipkit_chat_container_"]');
        if (!container.length)
            throw new Error("Container chat tidak ditemukan");
        const configString = container.attr("data-config");
        if (!configString)
            throw new Error("data-config kosong");
        const parsed = JSON.parse(configString);
        this.config.nonce = parsed.nonce;
        this.config.botId = parsed.botId;
        this.config.postId = parsed.postId;
    }
    async sendMessage(message) {
        if (!this.config.nonce) {
            await this.refreshTokens();
        }
        const payload = new URLSearchParams();
        payload.append("action", "aipkit_frontend_chat_message");
        payload.append("_ajax_nonce", this.config.nonce);
        payload.append("bot_id", this.config.botId);
        payload.append("post_id", this.config.postId);
        payload.append("message", message);
        payload.append("session_id", (0, uuid_1.v4)());
        payload.append("conversation_uuid", (0, uuid_1.v4)());
        try {
            const { data } = await axios_1.default.post(this.ajaxUrl, payload.toString(), { headers: this.headers });
            if (!data || data.success === false || data === 0) {
                throw new Error("Invalid token / WordPress error");
            }
            let raw = data.data?.reply || data.data?.response || "";
            return raw.replace(/<[^>]*>?/gm, "").trim();
        }
        catch (err) {
            this.config.nonce = null;
            await this.refreshTokens();
            const { data } = await axios_1.default.post(this.ajaxUrl, payload.toString(), { headers: this.headers });
            let raw = data.data?.reply || data.data?.response || "";
            return raw.replace(/<[^>]*>?/gm, "").trim();
        }
    }
}
const espBot = new ChatEspanyolBot();
async function espHandler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await espBot.sendMessage(q);
        if (!result) {
            return res.json({
                status: false,
                error: "Tidak ada respon."
            });
        }
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
