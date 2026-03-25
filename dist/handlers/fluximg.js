"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fluxImageHandler;
const axios_1 = __importDefault(require("axios"));
async function fluxImageHandler(req, res) {
    const prompt = req.query.prompt?.trim();
    const seed = req.query.seed || Math.floor(Math.random() * 1000000);
    if (!prompt) {
        res.status(400);
        res.setHeader("Content-Type", "text/plain");
        return res.send("Parameter 'prompt' wajib diisi");
    }
    try {
        const endpoint = "https://nologintoo.abdelatifana0.workers.dev/";
        const imageUrl = `${endpoint}?target=pollinations&prompt=${encodeURIComponent(prompt)}&model=flux&width=512&height=512&seed=${seed}`;
        const response = await axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
        res.setHeader("Content-Type", "image/jpeg");
        res.send(Buffer.from(response.data, "binary"));
    }
    catch (err) {
        console.error(err);
        res.status(500);
        res.setHeader("Content-Type", "text/plain");
        res.send("Gagal generate gambar: " + err.message);
    }
}
