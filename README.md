# GemHunter
## About
GemHunter is a browser-based RPG that uses Google Gemini to generate a unique world every time you play. Each world gets a Gemini-crafted description, an AI-generated pixel art landscape, and a color palette pulled directly from that image.

Explore peacefully and discover each world's secrets, or hunt for gems and face the wrath of the inhabitants of GemHunter. Collect them all, defeat the boss, and make your way back before it's too late!

## Prerequisites
- Text editor (such as [VSCode](https://code.visualstudio.com/download))
- Node.js (including [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- A free Google Gemini API key

## Installation
1. Clone the repository: `git clone https://github.com/yourusername/gemhunter.git`
2. Install dependencies: `npm install`
3. Add your Gemini API key
    - Get a free key from https://aistudio.google.com/app/apikey (reqires an age-verified Google Account)
    - Create a file called `.env` in the root directory
    - Add the API key to the file: `GEMINI_API_KEY=[your-key-here]`
4. Open a terminal and start the game: `npm run start`

