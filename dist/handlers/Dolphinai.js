"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dolphinHandler;
const axios_1 = __importDefault(require("axios"));
async function dolphinAI(message, template = 'logical') {
    const templates = ['logical', 'creative', 'summarize', 'code-beginner', 'code-advanced'];
    if (!message)
        throw new Error('Parameter message diperlukan.');
    if (!templates.includes(template))
        throw new Error(`Available templates: ${templates.join(', ')}.`);
    const { data: rawData } = await axios_1.default.post('https://chat.dphn.ai/api/chat', {
        messages: [{ role: 'user', content: message }],
        model: 'dolphinserver:24B',
        template
    }, {
        headers: {
            origin: 'https://chat.dphn.ai',
            referer: 'https://chat.dphn.ai/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
    });
    const result = rawData
        .split('\n\n')
        .filter(line => line && line.startsWith('data: {'))
        .map(line => JSON.parse(line.substring(6)))
        .map(item => item.choices?.[0]?.delta?.content || '')
        .join('');
    if (!result)
        throw new Error('No result found.');
    return result;
}
async function dolphinHandler(req, res) {
    const q = (req.query.q || req.body.q);
    const template = (req.query.template || req.body.template || 'logical');
    if (!q)
        return res.status(400).json({ status: false, message: "Parameter 'q' diperlukan." });
    try {
        const answer = await dolphinAI(q, template);
        res.json({ status: true, response: answer });
    }
    catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}
