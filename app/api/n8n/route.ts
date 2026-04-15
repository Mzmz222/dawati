import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SECRET_TOKEN = process.env.VITE_N8N_SECRET_TOKEN || 'dawati_secret_998877';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('X-Dawati-Secret');

        if (authHeader !== SECRET_TOKEN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();

        // Log for internal tracking
        console.log('n8n Webhook received:', payload.action);

        // Business Logic can be added here if n8n needs something specific returned

        return NextResponse.json({ success: true, message: 'Payload received' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
