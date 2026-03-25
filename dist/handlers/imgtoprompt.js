"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = imgToPromptHandler;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
async function imgToPromptHandler(req, res) {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).json({
            creator: 'Moli55',
            status: false,
            message: "Parameter 'url' wajib diisi"
        });
    }
    try {
        const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const form = new form_data_1.default();
        form.append('file', buffer, 'img.jpg');
        const apiRes = await axios_1.default.post('https://be.neuralframes.com/clip_interrogate/', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer uvcKfXuj6Ygncs6tiSJ6VXLxoapJdjQ3EEsSIt45Zm+vsl8qcLAAOrnnGWYBccx4sbEaQtCr416jxvc/zJNAlcDjLYjfHfHzPpfJ00l05h0oy7twPKzZrO4xSB+YGrmCyb/zOduHh1l9ogFPg/3aeSsz+wZYL9nlXfXdvCqDIP9bLcQMHiUKB0UCGuew2oRt',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
                'Referer': 'https://www.neuralframes.com/tools/image-to-prompt'
            }
        });
        res.json({
            creator: 'Moli55',
            status: true,
            prompt: apiRes.data?.caption || apiRes.data?.prompt || 'Tidak ada prompt ditemukan'
        });
    }
    catch (e) {
        res.status(500).json({
            creator: 'Moli55',
            status: false,
            message: e.message
        });
    }
}
