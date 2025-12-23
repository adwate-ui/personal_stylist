
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { url, apiKey, mode } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
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

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json({ error: "External API failed", details: errorText }, { status: externalResponse.status });
        }

        const data = await externalResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Extraction Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Poll status proxy
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const apiKey = searchParams.get("apiKey") || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!id || !apiKey) {
        return NextResponse.json({ error: "Missing ID or API Key" }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.extract.pics/v0/extractions/${id}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: "External API failed" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Extraction Proxy Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
