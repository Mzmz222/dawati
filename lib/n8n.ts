import { supabase } from './supabase';

export interface N8NPayload {
  action: 'send_preview' | 'send_bulk_invites' | 'generate_passkit';
  is_preview: boolean;
  order_id?: string;
  event_id?: string;
  customer?: {
    name: string;
    phone: string;
  };
  guests?: any[];
  images?: {
    watermarked: string;
    original: string;
  };
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/dawati';
const SECRET_TOKEN = process.env.NEXT_PUBLIC_N8N_SECRET || 'dawati_secret_2024';

export const triggerN8N = async (payload: any) => {
  const enrichedPayload = {
    ...payload,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dawati-Secret': SECRET_TOKEN,
      },
      body: JSON.stringify(enrichedPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error triggering n8n:', error);
    return { success: false, error: error.message };
  }
};

export const getWhatsAppNumber = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();

    if (error || !data) return '966500000000';
    return data.value;
  } catch {
    return '966500000000';
  }
};
