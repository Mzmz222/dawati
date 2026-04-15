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

const N8N_WEBHOOK_URL = import.meta.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || import.meta.env.VITE_N8N_WEBHOOK_URL;
const SECRET_TOKEN = import.meta.env.VITE_N8N_SECRET_TOKEN;

export const triggerN8N = async (payload: N8NPayload) => {
  if (!N8N_WEBHOOK_URL) {
    console.error('N8N Webhook URL is missing');
    return { success: false, error: 'Webhook URL missing' };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dawati-Secret': SECRET_TOKEN || '',
      },
      body: JSON.stringify(payload),
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

/**
 * Fetches the global WhatsApp number from database
 */
export const getWhatsAppNumber = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();

    if (error || !data) return '966500000000'; // Fallback
    return data.value;
  } catch {
    return '966500000000';
  }
};
