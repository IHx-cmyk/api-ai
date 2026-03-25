"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = svaraHandler;
const axios_1 = __importDefault(require("axios"));
const svara = {
    api: {
        base: 'https://svara.aculix.net',
        endpoint: { generate: '/generate-speech' },
    },
    headers: {
        'user-agent': 'NB Android/1.0.0',
        'accept-encoding': 'gzip',
        'content-type': 'application/json',
    },
    cid: new Uint8Array([
        0x24, 0x52, 0x43, 0x41, 0x6e, 0x6f, 0x6e, 0x79, 0x6d, 0x6f, 0x75, 0x73, 0x49, 0x44, 0x3a, 0x31,
        0x33, 0x65, 0x38, 0x37, 0x35, 0x33, 0x61, 0x65, 0x36, 0x31, 0x39, 0x34, 0x63, 0x37, 0x62, 0x39,
        0x32, 0x37, 0x33, 0x32, 0x64, 0x36, 0x36, 0x64, 0x37, 0x30, 0x32, 0x33, 0x30, 0x37, 0x32
    ]),
    auth: new Uint8Array([
        0x77, 0x76, 0x65, 0x62, 0x6e, 0x79, 0x75, 0x36, 0x36, 0x36, 0x38, 0x37, 0x35, 0x36, 0x68, 0x34,
        0x35, 0x67, 0x66, 0x65, 0x63, 0x64, 0x66, 0x65, 0x67, 0x6e, 0x68, 0x6d, 0x75, 0x36, 0x6b, 0x6a,
        0x35, 0x68, 0x36, 0x34, 0x67, 0x35, 0x33, 0x66, 0x76, 0x72, 0x62, 0x67, 0x6e, 0x79, 0x35
    ]),
    voiceX: {
        'alloy': 'af_alloy', 'aoede': 'af_aoede', 'bella': 'af_bella', 'heart': 'af_heart',
        'jessica': 'af_jessica', 'kore': 'af_kore', 'nicole': 'af_nicole', 'nova': 'af_nova',
        'river': 'af_river', 'sarah': 'af_sarah', 'sky': 'af_sky',
        'adam': 'am_adam', 'echo': 'am_echo', 'eric': 'am_eric', 'fenrir': 'am_fenrir',
        'liam': 'am_liam', 'michael': 'am_michael', 'onyx': 'am_onyx', 'puck': 'am_puck',
        'santa': 'am_santa', 'alice': 'bf_alice', 'emma': 'bf_emma', 'isabella': 'bf_isabella',
        'lily': 'bf_lily', 'daniel': 'bm_daniel', 'fable': 'bm_fable', 'george': 'bm_george',
        'lewis': 'bm_lewis', 'anaya': 'hf_alpha', 'riya': 'hf_beta', 'arjun': 'hm_omega', 'kabir': 'hm_psi',
        'dora': 'ef_dora', 'santiago': 'em_alex', 'noel': 'em_santa', 'siwis': 'ff_siwis',
        'aiko': 'jf_alpha', 'gongitsune': 'jf_gongitsune', 'nezumi': 'jf_nezumi', 'tebukuro': 'jf_tebukuro',
        'kumo': 'jm_kumo', 'sara': 'if_sara', 'nicola': 'im_nicola', 'doras': 'pf_dora',
        'alex': 'pm_alex', 'antonio': 'pm_santa', 'xiaobei': 'zf_xiaobei', 'xiaoni': 'zf_xiaoni',
        'xiaoxiao': 'zf_xiaoxiao', 'xiaoyi': 'zf_xiaoyi', 'yunjian': 'zm_yunjian', 'yunxi': 'zm_yunxi',
        'yunxia': 'zm_yunxia', 'yunyang': 'zm_yunyang'
    },
    getVoiceId(vn) {
        return this.voiceX[vn.toLowerCase().trim()];
    }
};
async function svaraHandler(req, res) {
    const text = req.query.text;
    const voice = req.query.voice;
    const apikey = req.query.apikey;
    if (!text || !voice || !apikey) {
        return res.status(400).json({
            creator: "Moli55",
            status: false,
            message: "Parameter 'text', 'voice', dan 'apikey' wajib diisi"
        });
    }
    if (text.length > 300) {
        return res.status(413).json({
            creator: "Moli55",
            status: false,
            message: "Panjang `text` maksimal 300 karakter"
        });
    }
    const voiceId = svara.getVoiceId(voice);
    if (!voiceId) {
        const av = Object.keys(svara.voiceX).join(', ');
        return res.status(422).json({
            creator: "Moli55",
            status: false,
            message: `Nama voice "${voice}" tidak valid. Pilih salah satu dari: ${av}`
        });
    }
    const decoder = new TextDecoder();
    const ciu = decoder.decode(svara.cid);
    const toket = decoder.decode(svara.auth);
    try {
        const response = await axios_1.default.post(`${svara.api.base}${svara.api.endpoint.generate}`, { customerId: ciu, text, voice: voiceId }, { headers: { ...svara.headers, authorization: toket } });
        const { outputUrl } = response.data;
        res.json({
            creator: "Moli55",
            status: true,
            response: {
                text,
                voice: voiceId,
                audio: outputUrl,
                text_length: text.length
            }
        });
    }
    catch (err) {
        res.status(500).json({
            creator: "Moli55",
            status: false,
            message: err.message || "Terjadi kesalahan internal"
        });
    }
}
