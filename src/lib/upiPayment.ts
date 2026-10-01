import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getDeviceId } from './deviceId';

export interface UpiPaymentConfig {
  vpa: string;
  payeeName: string;
}

export function getUpiPaymentConfig(): UpiPaymentConfig | null {
  const vpa = import.meta.env.VITE_UPI_VPA as string | undefined;
  const payeeName = (import.meta.env.VITE_UPI_PAYEE_NAME as string | undefined) || 'Dr Plant AI';
  if (!vpa) return null;
  return { vpa, payeeName };
}

export function buildUpiDeepLink(amount: number, note: string): string | null {
  const config = getUpiPaymentConfig();
  if (!config) return null;
  const params = new URLSearchParams({
    pa: config.vpa,
    pn: config.payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(amount: number, note: string): Promise<string | null> {
  const link = buildUpiDeepLink(amount, note);
  if (!link) return null;
  return QRCode.toDataURL(link, { width: 320, margin: 1 });
}

export interface PremiumClaimInput {
  plan: 'single' | 'lifetime';
  amountPaid: number;
  utrReference: string;
  phone: string;
}

export interface PremiumClaimResult {
  success: boolean;
  errorMessage?: string;
}

export async function submitPremiumPaymentClaim(input: PremiumClaimInput): Promise<PremiumClaimResult> {
  const trimmedUtr = input.utrReference.trim();
  if (trimmedUtr.length < 6) {
    return { success: false, errorMessage: 'Enter the full UTR / reference number from your UPI app.' };
  }
  if (input.phone.trim().length < 10) {
    return { success: false, errorMessage: 'Enter a valid mobile number.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  const { error } = await supabase.from('premium_subscriptions').insert({
    device_id: getDeviceId(),
    phone: input.phone.trim(),
    plan: input.plan,
    amount_paid: input.amountPaid,
    utr_reference: trimmedUtr,
    status: 'pending_verification',
  });

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  return { success: true };
}
