import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const { templateUrl, fields, qrConfig, barcodeUrl } = await req.json();

        if (!templateUrl) {
            return NextResponse.json({ error: 'Missing template URL' }, { status: 400 });
        }

        // 1. Fetch the main template image
        const templateResponse = await fetch(templateUrl);
        const templateBuffer = Buffer.from(await templateResponse.arrayBuffer());

        // Get metadata to know dimensions
        const metadata = await sharp(templateBuffer).metadata();
        const width = metadata.width || 1200;
        const height = metadata.height || 1600;

        // 2. Prepare SVG for text overlays
        // Note: In a real server, we would load the .woff2 files and use them in the SVG
        let svgOverlay = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

        // Support for Arabic fonts assuming they are loaded in the environment or available in OS
        // For local dev, we use standard sans-serif fallback if fonts aren't in /fonts
        fields.forEach((field: any) => {
            if (!field.enabled && !field.text) return;

            const x = (field.x / 100) * width;
            const y = (field.y / 100) * height;
            const fontSize = field.fontSize || 24;
            const color = field.color || '#000000';
            const fontFamily = field.fontFamily || 'Arial';
            const fontWeight = field.bold ? 'bold' : 'normal';
            const fontStyle = field.italic ? 'italic' : 'normal';

            svgOverlay += `
        <text 
          x="${x}" 
          y="${y}" 
          fill="${color}" 
          font-family="${fontFamily}, sans-serif" 
          font-size="${fontSize}" 
          font-weight="${fontWeight}"
          font-style="${fontStyle}"
          text-anchor="middle"
          dominant-baseline="middle"
          direction="rtl"
        >
          ${field.text || field.label}
        </text>`;
        });

        svgOverlay += `</svg>`;

        // 3. Composite everything
        const composites: any[] = [
            { input: Buffer.from(svgOverlay), top: 0, left: 0 }
        ];

        // Add QR code if provided
        if (qrConfig && barcodeUrl) {
            const qrResponse = await fetch(barcodeUrl);
            const qrBuffer = Buffer.from(await qrResponse.arrayBuffer());
            const qrResized = await sharp(qrBuffer)
                .resize(Math.round(qrConfig.size))
                .toBuffer();

            composites.push({
                input: qrResized,
                top: Math.round((qrConfig.y / 100) * height - qrConfig.size / 2),
                left: Math.round((qrConfig.x / 100) * width - qrConfig.size / 2),
            });
        }

        const finalImage = await sharp(templateBuffer)
            .composite(composites)
            .webp({ quality: 90 })
            .toBuffer();

        return new NextResponse(finalImage, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        console.error('Image Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
