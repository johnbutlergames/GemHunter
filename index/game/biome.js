const BIOME_TYPES = ["mountainous", "forest", "taiga", "savanna", "prairie", "steppe", "futuristic", "polar", "swamp", "canyon", "valley", "seaside", "cliffside", "tundra", "wasteland", "desolate civilization", "volcanic"];
const BIOME_WEATHERS = [
    { value: "stormy", weight: 0.5 },
    { value: "snowstormy", weight: 0.1 },
    { value: "thunderstormy", weight: 0.1 },
    { value: "rainy", weight: 1 },
    { value: "intensely rainy", weight: 0.1 },
    { value: "sunny", weight: 1 },
    { value: "intensly sunny", weight: 0.1 },
    { value: "overcast", weight: 1 },
    { value: "cloudy", weight: 1 },
    { value: "foggy", weight: 1 }
];
const BIOME_TEMPERATURES = [
    { value: "freezing cold", weight: 0.05 },
    { value: "cold", weight: 0.2 },
    { value: "cool", weight: 0.6 },
    { value: "temperate", weight: 1 },
    { value: "warm", weight: 0.6 },
    { value: "hot", weight: 0.2 },
    { value: "blisteringly hot", weight: 0.05 }
];
const BIOME_FLORA_TYPES = [
    { value: "plants", weight: 2 },
    { value: "trees", weight: 1 },
    { value: "shrubs", weight: 1 },
    { value: "grasses", weight: 1 },
    { value: "flowers", weight: 1 },
    { value: "vines", weight: 1 },
    { value: "mosses", weight: 0.7 },
    { value: "mushrooms", weight: 0.7 },
    { value: "herbs", weight: 0.5 },
    { value: "succulents", weight: 0.5 },
    { value: "spices", weight: 0.5 },
];
const BIOME_FLORA_ATTRIBUTES = [
    { value: "large", weight: 1 },
    { value: "small", weight: 1 },
    { value: "tall", weight: 1 },
    { value: "aquatic", weight: 1 },
    { value: "twisting", weight: 1 },
    { value: "thorny", weight: 0.7 },
    { value: "blooming", weight: 0.5 },
    { value: "giant", weight: 0.5 },
    { value: "vibrant", weight: 0.5 },
    { value: "bioluminescent", weight: 0.5 },
    { value: "floating", weight: 0.3 },
    { value: "poisinous", weight: 0.3 }
];
const BIOME_DIFFICULTIES = [
    { value: "deadly", weight: 0.05 },
    { value: "dangerous", weight: 0.2 },
    { value: "moderate", weight: 1 },
    { value: "easy", weight: 0.5 },
    { value: "peaceful", weight: 0.3 }
];
const BIOME_CIVILIZATIONS = [
    { value: "destroyed", weight: 0.5 },
    { value: "ancient", weight: 0.5 },
    { value: "none", weight: 0.5 },
    { value: "on the brink of collapse", weight: 1 },
    { value: "flourishing", weight: 1 },
    { value: "thriving", weight: 1 },
];
const PRIMARY_STRUCTURE_NAME_CREATIVITY = [
    { value: { type: "boring", description: "The name of this structure should be [adjective] [structure type]." }, weight: 0.1 },
    { value: { type: "bland", description: "The name should simply reflect the attributes of the structure / the biome. The name should include the structure type." }, weight: 0.2 },
    { value: { type: "biome", description: "The name should include the biome name and the type of structure" }, weight: 1 },
    { value: { type: "normal", description: "" }, weight: 1 },
    { value: { type: "creative", description: "When coming up with the name, feel free to be creative." }, weight: 0.5 },
    { value: { type: "place-name", description: "When coming up with the name, use a one word made up place name + the type of structure." }, weight: 0.5 }
];
const BIOME_STRUCTURES = ["Refinery", "Vault", "Monolith", "Castle", "Obelisk", "Watchtower", "Observatory", "Citadel", "Shrine", "Temple", "Cave", "Station", "Warehouse", "Fortress", "Bastion", "Pyramid", "Circle", "Ruins", "Spire", "Tower", "Gate", "Chamber", "Laboratory", "Ritual Grounds", "Beacon", "Pillar", "Chasm", "Grotto", "Cairn", "Cavern", "Forge", "Island", "Port", "Shipwreck", "Village", "City", "Camp", "Shelter", "Hut", "Dock", "Clocktower", "Sanctuary"];

class Biome {
    constructor(x, y, r, spawn) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.spawn = spawn;
        this.environment = new BiomeEnvironment(this);

        this.neighboringBiomes = [];
    }
    initializeExits() {
        this.exits = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        this.exits = this.exits.filter(e => {
            if (e.x * this.r * 2 + this.x == 0 && e.y * this.r * 2 + this.y > 0) return false;
            return true;
        });
        // remove exits that would conflict in the sea line from spawn
    }
    async initialize() {
        console.log("----INITIALIZING BIOME----");
        this.initializeAttributes();
        await this.initializeName();
        await this.initializeMood();
        await this.initializeDescription();
        await this.initializeImagePrompt();
        await this.initializeImage();
        this.name = "Mistwood";
        this.image = new Image();
        this.image.src = "assets/mistwood.jpg";

        console.log("----BIOME INITIALIZATION COMPLETE----")
        this.initialized = true;
    }
    initializeAttributes() {
        console.log("....initializing base attributes....");
        this.type = randomElement(BIOME_TYPES);
        this.civilization = randomElement(BIOME_CIVILIZATIONS);
        this.temperature = randomElement(BIOME_TEMPERATURES);
        this.weather = randomElement(BIOME_WEATHERS);
        this.difficulty = randomElement(BIOME_DIFFICULTIES);
        this.initializeFlora();
        this.initializeStructures();
    }
    initializeFlora() {
        console.log("....initializing flora....");
        this.flora = choose(BIOME_FLORA_TYPES, Math.floor(Math.random() * 2) + 2);
        this.flora = this.flora.map(e => {
            if (Math.random() < 0.6) {
                if (Math.random() < 0.2) {
                    let attributes = choose(BIOME_FLORA_ATTRIBUTES, 2);
                    return `${attributes[0]}, ${attributes[1]} ${e}`;
                } else {
                    let attribute = randomElement(BIOME_FLORA_ATTRIBUTES);
                    return `${attribute} ${e}`;
                }
            } else {
                return e;
            }
        });
        if (this.spawn) {
            this.difficulty = "peaceful";
            // spawn should be peaceful
        }
    }
    initializeStructures() {
        console.log("....initializing structures....");

        let structures = [];
        for (let n = 0; n < 4 + Math.random() * 3; n++) {
            structures.push(randomElement(BIOME_STRUCTURES));
        }
        structures = structures.filter((e, i, a) => a.indexOf(e) == i);

        this.primaryStructures = [structures.shift()];
        if (Math.random() < 0.5) this.primaryStructures.push(structures.shift());

        this.commonStructures = structures;
    }
    async initializeName() {
        console.log("....initializing name....");
        const NAME_CREATIVITY = [
            { value: { type: "boring", description: "The name of this biome should be [weather or temparture] [type]. Use synonyms for both words, not the actual values." }, weight: 0.1 },
            { value: { type: "bland", description: "The name of the biome should simply reflect the attributes of the biome. The name should include the biome type. The name should be two words long." }, weight: 0.2 },
            { value: { type: "creative1", description: "The name of the biome should be two words long. The first word should start with the letter #randomLetter1. Be creative with your choice of the second word." }, weight: 1 },
            { value: { type: "creative2", description: "The name of the biome should be two words long. The second word should start with the letter #randomLetter2. Be creative with your choice of the first word." }, weight: 1 },
            { value: { type: "random1", description: "The name of the biome should be two words long. The first word should start with the letter #randomLetter1. Be creative with your choice of the second word." }, weight: 1 },
            { value: { type: "random2", description: "The name of the biome should be two words long. The second word should start with the letter #randomLetter2. Be creative with your choice of the first word." }, weight: 1 },
            { value: { type: "random3", description: `The name of the biome should be two words long. The first word should start with #randomLetter1. The second word should start with #randomLetter2.` }, weight: 1 },
            { value: { type: "random4", description: `The biome name should be one word long, and should start with the letter #randomLetter1. It should also contain the letter #randomLetter3. Use a made up place name.` }, weight: 1 },
            { value: { type: "random5", description: "The name of the biome should be two words long. The first word should start with the letter #randomLetter1. Be creative with your choice of the second word. Use a made up place name." }, weight: 1 },
            { value: { type: "random6", description: "The name of the biome should be two words long. The second word should start with the letter #randomLetter2. Be creative with your choice of the first word. Use a made up place name." }, weight: 1 },
            { value: { type: "random7", description: `The name of the biome should be two words long. The first word should start with #randomLetter1. The second word should start with #randomLetter2. Use a made up place name.` }, weight: 2 },
        ];
        const ALPHABET1 = "ABCDEFGHIJKLMNOPQRSTUVWYZ"; // No good name with first word starting with x
        const ALPHABET2 = "ABCDFGHIJKLMNOPQRSTUVWZ"; // If second word starts with y or e, its always yield or echo, which are bad. Also x is bad
        const ALPHABET3 = "ABCDEFGHIJKLMNOPQRSTUVWXZ"; // Any letter can be contained in the word
        this.nameCreativity = randomElement(NAME_CREATIVITY);
        this.nameCreativity.description = this.nameCreativity.description
            .replace(/#randomLetter1/g, e => randomElement(ALPHABET1))
            .replace(/#randomLetter2/g, e => randomElement(ALPHABET2))
            .replace(/#randomLetter3/g, e => randomElement(ALPHABET3));
        let prompt = [
            `Consider a ${this.type} biome with the following attributes:`,
            `- Type: ${this.type}`,
            `- Weather: ${this.weather}`,
            `- Temperature: ${this.temperature}`,
            `- Flora: ${JSON.stringify(this.flora)}`,
            ``,
            `Your job is to come up with a name for this biome.`,
            `${this.nameCreativity.description}`,
            ``,
            `Only return the name of the biome, nothing else.`
        ].join("\n");
        this.namePrompt = prompt;
        console.log(prompt);
        let data = await sendPrompt(prompt);
        data = data.replace(/\n/g, "");

        let failedToSeparateWords = data.split(/\s+/).some(word => {
            const matches = word.match(/[A-Z][a-z]*/g);
            return matches && matches.length > 1;
        });
        if (failedToSeparateWords) {
            console.error("...Gemini didn't put a space in the biome name??? Fixing...");
            data = data.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
        let includedMoreThanTwoWords = data.split(" ").length > 2;
        if (includedMoreThanTwoWords) {
            console.error("...Gemini put more than two words in the name??? Fixing...");
            data = data.split(" ");
            data = data[0] + " " + data[data.length - 1];
            // first words are probably adjectives, so take the first and last word to avoid a name with two adjectives
        }
        if (data.match(/biome/gi)) {
            console.error("...Gemini included 'biome' in the name? Really??? Fixing to 'Land' I guess...");
            data = data.replace(/biome/gi, "Land");
        }
        if (data.split(" ").some(e => e[0] != e[0].toUpperCase())) {
            console.error("...Gemini didn't capitalize all the words in the name. Fixing...");
            data = data.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ");
        }
        if (data.split(" ").length == 2 && data.length <= 11 && Math.random() < 0.1) {
            data = data.split(" ");
            data = data[0] + data[1].toLowerCase();
        }
        // only combine the words if there is two and the combined length is less than 11 characters
        if (data.split(" ").length == 2 && Math.random() < 0.4) data = "The " + data;
        // only add The to the name if it's two words

        console.log(data);
        this.name = data;
    }
    async initializeMood() {
        console.log("....initializing mood....");
        let prompt = [
            `Consider the land of ${this.name}. It is a ${this.weather}, ${this.temperature}, ${this.type} biome.`,
            `Your job is to come up with two mood / color tone words that describe this biome.`,
            ``,
            `Only return the the words, seperated by a comma and space.`
        ].join("\n");
        this.descriptionPrompt = prompt;
        console.log(prompt);
        let data = await sendPrompt(prompt);
        data = data.replace(/\n/g, "");
        console.log(data);
        this.mood = data.split(", ");
    }
    async initializeDescription() {
        console.log("....initializing description....");
        let prompt = [
            `Consider the land of ${this.name}. It is a ${this.weather}, ${this.temperature}, ${this.type} biome. The mood of ${this.name} is ${this.mood[0]} and ${this.mood[1]}. Plants found in this biome are: ${JSON.stringify(this.flora)}.`,
            ``,
            `Your job is to come up with a three sentence description for this biome. The first sentence should describe the plants that grow here. The second sentence should describe the environment. The third sentence should describe a unique event that only happens in this land.`,
            ``,
            `Only return the description of ${this.name}, nothing else.`
        ].join("\n");
        this.descriptionPrompt = prompt;
        console.log(prompt);
        let data = await sendPrompt(prompt);
        data = data.replace(/\n/g, "");

        data = data.split(".");
        data.pop();
        data.pop();
        data = data.join(".");
        data += ".";
        // remove the stupid nothingburger sentence it always puts at the end, trick it by asking for a real sentence first. This way it sounds better.

        console.log(data);
        this.description = data;
    }
    async initializeImagePrompt() {
        console.log("....initializing image prompt....");
        let prompt = [
            this.description,
            "",
            `Turn this into a prompt for an AI image generator to create a pixel art landscape image representing this biome: ${this.description}`,
            `The prompt should be concise, and should focus on the visual aspects of the biome. The prompt should include the mood / color tone of the biome, as well as the types of plants that grow there. The prompt should not include the name of the biome.`,
            `Only return the prompt, nothing else. Make sure the prompt includes the words "pixel art landscape" to ensure the image is generated in the correct style.`
        ].join("\n");
        this.imagePromptPrompt = prompt;
        console.log(prompt);
        let data = await sendPrompt(prompt);
        data = data.replace(/\n/g, "");
        console.log(data);
        this.imagePrompt = data;
    }
    async initializeImage() {
        console.log("....initializing image....");
        let imageSrc = await generateImage(this.imagePrompt);
        this.image = new Image();
        this.image.src = imageSrc;
    }
}