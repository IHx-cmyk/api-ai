"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nanoBananaHandler;
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
function genserial() {
    let s = "";
    for (let i = 0; i < 32; i++)
        s += Math.floor(Math.random() * 16).toString(16);
    return s;
}
async function upload(filename) {
    const form = new form_data_1.default();
    form.append("file_name", filename);
    const res = await axios_1.default.post("https://api.imgupscaler.ai/api/common/upload/upload-image", form, {
        headers: {
            ...form.getHeaders(),
            origin: "https://imgupscaler.ai",
            referer: "https://imgupscaler.ai/",
        },
    });
    return res.data.result;
}
async function uploadtoOSS(putUrl, filePath) {
    const file = fs_1.default.readFileSync(filePath);
    const type = (0, path_1.extname)(filePath) === ".png" ? "image/png" : "image/jpeg";
    const res = await axios_1.default.put(putUrl, file, {
        headers: {
            "Content-Type": type,
            "Content-Length": file.length,
        },
        maxBodyLength: Infinity,
    });
    return res.status === 200;
}
async function createJob(imageUrl, prompt) {
    const form = new form_data_1.default();
    form.append("model_name", "magiceraser_v4");
    form.append("original_image_url", imageUrl);
    form.append("prompt", prompt);
    form.append("ratio", "match_input_image");
    form.append("output_format", "jpg");
    const res = await axios_1.default.post("https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job", form, {
        headers: {
            ...form.getHeaders(),
            "product-code": "magiceraser",
            "product-serial": genserial(),
            origin: "https://imgupscaler.ai",
            referer: "https://imgupscaler.ai/",
        },
    });
    return res.data.result.job_id;
}
async function cekjob(jobId) {
    const res = await axios_1.default.get(`https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`, {
        headers: {
            origin: "https://imgupscaler.ai",
            referer: "https://imgupscaler.ai/",
        },
    });
    return res.data;
}
async function magicEraser(imagePath, prompt) {
    const filename = (0, path_1.basename)(imagePath);
    const up = await upload(filename);
    await uploadtoOSS(up.url, imagePath);
    const cdn = "https://cdn.imgupscaler.ai/" + up.object_name;
    const jobId = await createJob(cdn, prompt);
    let result;
    do {
        await new Promise((r) => setTimeout(r, 3000));
        result = await cekjob(jobId);
    } while (result.code === 300006);
    return result.result.output_url[0];
}
async function nanoBananaHandler(req, res) {
    try {
        const { imageUrl, prompt } = req.query;
        if (!imageUrl || !prompt) {
            return res.status(400).json({
                status: false,
                message: "imageUrl dan prompt wajib diisi"
            });
        }
        const imgRes = await axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
        const tmpInput = (0, path_1.join)((0, os_1.tmpdir)(), `nano-${Date.now()}.jpg`);
        fs_1.default.writeFileSync(tmpInput, Buffer.from(imgRes.data));
        const resultUrl = await magicEraser(tmpInput, prompt);
        fs_1.default.unlinkSync(tmpInput);
        res.json({
            status: true,
            result: {
                prompt,
                image: resultUrl
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
}
