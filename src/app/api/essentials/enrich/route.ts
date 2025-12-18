import { NextRequest, NextResponse } from 'next/server';
import { enrichWardrobeEssentials } from '@/lib/product-scraper';

export async function POST(req: NextRequest) {
    try {
        const { essentials } = await req.json();

        if (!essentials) {
            return NextResponse.json(
                { error: 'Essentials data required' },
                { status: 400 }
            );
        }

        // Get Cloudflare worker URL from environment
        const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

        // Enrich essentials with product URLs and images
        const enrichedEssentials = await enrichWardrobeEssentials(essentials, workerUrl);

        return NextResponse.json({ essentials: enrichedEssentials });
    } catch (error) {
        console.error('Error enriching essentials:', error);
        return NextResponse.json(
            { error: 'Failed to enrich essentials' },
            { status: 500 }
        );
    }
}
