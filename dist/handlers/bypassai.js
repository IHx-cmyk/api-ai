"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bypassaihandler;
const axios_1 = __importDefault(require("axios"));
async function bypassai(text) {
    if (!text)
        throw new Error("parameter 'text' diperlukan.");
    const { data } = await axios_1.default.get('https://31jnx1hcnk.execute-api.us-east-1.amazonaws.com/default/test_7_aug_24', {
        headers: {
            origin: 'https://bypassai.writecream.com',
            referer: 'https://bypassai.writecream.com/',
            'user-agent': 'mozilla/5.0 (linux; android 15; sm-f958 build/ap3a.240905.015) applewebkit/537.36 (khtml, like gecko) chrome/130.0.6723.86 mobile safari/537.36'
        },
        params: { content: text }
    });
    return data.finalContent.replace(/<span[^>]*>|<\/span>/g, '');
}
async function bypassaihandler(req, res) {
    try {
        const text = req.query.text;
        if (!text) {
            return res.status(400).json({
                creator: "Moli55",
                status: false,
                error: "parameter 'text' diperlukan"
            });
        }
        const result = await bypassai(text);
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
