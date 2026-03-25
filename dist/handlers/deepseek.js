"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
async function deepseekChat(q) {
    try {
        const baseUrl = 'https://chat-deep.ai';
        const ajaxUrl = 'https://chat-deep.ai/wp-admin/admin-ajax.php';
        const headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Origin': baseUrl,
            'Referer': baseUrl + '/deepseek-chat/',
            'Sec-Ch-Ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Linux"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        };
        const formData = new form_data_1.default();
        formData.append('action', 'deepseek_chat');
        formData.append('message', q);
        formData.append('model', 'default');
        formData.append('nonce', '7df78b0165');
        formData.append('save_conversation', '0');
        formData.append('session_only', '1');
        const response = await axios_1.default.post(ajaxUrl, formData, {
            headers: {
                ...headers,
                ...formData.getHeaders()
            }
        });
        if (response.data?.success) {
            return response.data?.data?.response || null;
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
async function handler(req, res) {
    const q = req.query.q;
    if (!q) {
        return res.status(400).json({
            status: false,
            message: 'q required'
        });
    }
    try {
        const result = await deepseekChat(q);
        if (!result) {
            throw new Error('Gagal mendapatkan respon dari server.');
        }
        res.json({
            status: true,
            model: 'deepseek-default',
            result
        });
    }
    catch (e) {
        res.status(500).json({
            status: false,
            message: e.message
        });
    }
}
