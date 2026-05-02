const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});