"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = text2imgHandler;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const https_1 = __importDefault(require("https"));
async function generateImage(prompt) {
    const form = new form_data_1.default();
    form.append('Prompt', prompt);
    form.append('Language', 'eng_Latn');
    form.append('Size', '1024x1024');
    form.append('Upscale', '2');
    form.append('Batch_Index', '0');
    const agent = new https_1.default.Agent({ rejectUnauthorized: false });
    const response = await axios_1.default.post('https://api.zonerai.com/zoner-ai/txt2img', form, {
        httpsAgent: agent,
        headers: {
            ...form.getHeaders(),
            'Origin': 'https://zonerai.com',
            'Referer': 'https://zonerai.com/',
            'User-Agent': 'Mozilla/5.0'
        },
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
}
async function text2imgHandler(req, res) {
    try {
        const q = (req.query.q || req.body.q);
        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' (prompt) diperlukan"
            });
        }
        const imageBuffer = await generateImage(q);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    }
    catch (err) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        });
    }
}
