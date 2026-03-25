"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gitaHandler;
const axios_1 = __importDefault(require("axios"));
async function gitaAI(question) {
    if (!question)
        throw new Error('Question is required.');
    try {
        const response = await axios_1.default.get('https://api.siputzx.my.id/api/ai/gita', {
            params: { q: question }
        });
        if (response.data && response.data.status) {
            return response.data.data;
        }
        else {
            throw new Error('Gagal mendapatkan respon dari Gita AI');
        }
    }
    catch (err) {
        throw err;
    }
}
async function gitaHandler(req, res) {
    const q = (req.query.q || req.body.q);
    if (!q) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'q' diperlukan."
        });
    }
    try {
        const result = await gitaAI(q);
        res.json({
            status: true,
            response: result
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}
