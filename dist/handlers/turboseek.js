"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = turboseekhandler;
const axios_1 = __importDefault(require("axios"));
async function turboseekai(query) {
    if (!query)
        throw new Error('parameter query diperlukan.');
    const inst = axios_1.default.create({
        baseURL: 'https://www.turboseek.io/api',
        headers: {
            origin: 'https://www.turboseek.io',
            referer: 'https://www.turboseek.io/',
            'user-agent': 'mozilla/5.0 (linux; android 15; sm-f958 build/ap3a.240905.015) applewebkit/537.36 (khtml, like gecko) chrome/130.0.6723.86 mobile safari/537.36'
        }
    });
    const { data: sources } = await inst.post('/getSources', { question: query });
    const { data: similarquestions } = await inst.post('/getSimilarQuestions', {
        question: query,
        sources
    });
    const { data: answerraw } = await inst.post('/getAnswer', {
        question: query,
        sources
    });
    const cleananswer = answerraw
        .match(/<p>(.*?)<\/p>/gs)
        ?.map(match => match
        .replace(/<\/?p>/g, '')
        .replace(/<\/?strong>/g, '')
        .replace(/<\/?em>/g, '')
        .replace(/<\/?b>/g, '')
        .replace(/<\/?i>/g, '')
        .replace(/<\/?u>/g, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim())
        .join('\n\n') || answerraw.replace(/<\/?[^>]+(>|$)/g, '').trim();
    return {
        answer: cleananswer,
        sources: sources.map((s) => s.url),
        similarquestions
    };
}
async function turboseekhandler(req, res) {
    try {
        const query = (req.query.q || req.body.q);
        if (!query) {
            return res.status(400).json({
                creator: "Moli55",
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }
        const result = await turboseekai(query);
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
