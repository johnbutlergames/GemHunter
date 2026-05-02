async function sendPrompt(prompt) {
    return fetch("http://localhost:3000/generate", {
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
            if (!data.text) {
                throw new Error("Invalid response format");
            }
            return data.text;
        });
}