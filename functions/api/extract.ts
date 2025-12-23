// @ts-nocheck
export const onRequestPost = async (context: any) => {
    try {
        const { request } = context;
        const body = await request.json();
        const { url, apiKey, mode } = body;

        if (!url) {
            return new Response(JSON.stringify({ error: "Missing URL" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Missing API Key" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const externalResponse = await fetch("https://api.extract.pics/v0/extractions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url,
                mode: mode || "advanced",
                ignoreInlineImages: true
            })
        });

        const data = await externalResponse.json();
        return new Response(JSON.stringify(data), {
            status: externalResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const onRequestGet = async (context: any) => {
    try {
        const { request } = context;
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const apiKey = url.searchParams.get("apiKey");

        if (!id || !apiKey) {
            return new Response(JSON.stringify({ error: "Missing ID or API Key" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(`https://api.extract.pics/v0/extractions/${id}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
