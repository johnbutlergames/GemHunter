const { GoogleGenerativeAI } = require("@google/generative-ai");
const { extractBiomePalette, extractBiomePaletteFromURL } = require("./image-sniffer");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = 3000;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'index')));
app.use(express.raw({ type: "image/*", limit: "10mb" }));

let models = [
    "gemma-3-1b-it",
    "gemma-3-4b-it",
    "gemma-3-12b-it",
    "gemma-3-27b-it"
];
let modelNumber = 0;

app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        const model = genAI.getGenerativeModel({
            model: models[modelNumber],
        });
        modelNumber++;
        modelNumber %= models.length;
        // switch requests between models to maximize allotted tokens.

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Generation failed" });
    }
});

app.post("/generate-image", async (req, res) => {
    try {
        const { prompt } = req.body;

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Image generation failed");

        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");

        res.json({
            image: `data:image/jpeg;base64,${base64}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image generation failed" });
    }
});

app.post("/sniff-image", async (req, res) => {
    const buffer = req.body;
    const palette = await extractBiomePalette(buffer);
    res.json({ palette });
});

app.post("/sniff-image-file", async (req, res) => {
    const url = req.body.src;
    const palette = await extractBiomePaletteFromURL(url);
    res.json({ palette });
});

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    const open = await import('open');
    open.default(`http://localhost:${port}`);
});