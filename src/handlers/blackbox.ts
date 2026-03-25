import { Request, Response } from "express";
import axios from "axios";

async function blackboxAI(text: string) {
    if (!text) throw new Error("parameter 'text' diperlukan.");

    const payload = {
        messages: [
            { role: "user", content: text }
        ],
        id: "simple-chat",
        codeModelMode: true,
        userSystemPrompt: "Be a helpful assistant.",
        maxTokens: 1024,
        validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb"
    };

    const headers = {
        "Content-Type": "application/json",
        "Origin": "https://app.blackbox.ai",
        "Referer": "https://app.blackbox.ai/",
        "User-Agent": "Mozilla/5.0"
    };

    const { data } = await axios.post(
        "https://app.blackbox.ai/api/chat",
        payload,
        { headers }
    );

    let result = data;

    if (typeof result === "string") {
        result = result.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        return result;
    }

    if (result?.response) {
        return result.response.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    }

    return "Gagal mendapatkan respon.";
}

export default async function blackboxHandler(req: Request, res: Response) {
    try {
        const q = (req.query.q || req.body.q) as string;

        if (!q) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            });
        }

        const result = await blackboxAI(q);

        res.json({
            status: true,
            response: result
        });

    } catch (err: any) {
        res.status(500).json({
            status: false,
            error: err.response?.data || err.message || "internal server error"
        });
    }
}