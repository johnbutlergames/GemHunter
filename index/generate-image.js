async function generateImage(prompt) {
    return fetch("http://localhost:3000/generate-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error: ${res.status} ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data.image) {
                throw new Error("Invalid response format");
            }
            return data.image; // returns a base64 image string
        });
}

// const image = await generateImage("pixel art forest village, warm colors");
// document.getElementById("world-image").src = image;