async function sniffImage(image) {
    let blob = dataURLtoBlob(image.src);
    return fetch("http://localhost:3000/sniff-image", {
        method: "POST",
        headers: {
            "Content-Type": "image/jpeg"
        },
        body: blob
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error: ${res.status} ${errorText}`);
            }
            return res.json();
        });
}

async function sniffImageFile(image) {
    return fetch("http://localhost:3000/sniff-image-file", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ src: image.src })
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error: ${res.status} ${errorText}`);
            }
            return res.json();
        });
}

function dataURLtoBlob(dataUrl) {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/:(.*?);/)[1];

    const binary = atob(base64);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
}