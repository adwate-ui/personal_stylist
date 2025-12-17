

async function testLink() {
    const url = "http://localhost:3000/api/wardrobe/link";
    const body = {
        url: "https://www.uniqlo.com/us/en/products/E450314-000/00"
    };

    console.log("Testing:", url);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.error("Error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Body:", text);
            return;
        }

        const data = await res.json();
        console.log("Success! Result:");
        console.log(JSON.stringify(data, null, 2));

        if (data.image_url && data.image_url.startsWith("http")) {
            console.log("Image URL found and seems valid.");
        } else {
            console.log("WARNING: Image URL missing or invalid.");
        }

    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testLink();
