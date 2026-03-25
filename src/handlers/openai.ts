import { Request, Response } from 'express'
import axios from 'axios'


async function fetchOpenAI() {
    const { data } = await axios.get("https://openai.idnet.my.id/chat.data", {
        headers: { "User-Agent": "Mozilla/5.0" }
    })


    const index = data.indexOf("content")
    const message = index !== -1 ? data[index + 1] : null

    return message
}


export default async function handler(req: Request, res: Response) {
    try {
        const prompt = (req.query.q || req.body.q) as string


        const message = await fetchOpenAI()

        if (!message) {
            return res.status(404).json({
                status: false,
                error: "Respon tidak ditemukan"
            })
        }

        res.json({
            status: true,
            response: message
        })
    } catch (err: any) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        })
    }
}