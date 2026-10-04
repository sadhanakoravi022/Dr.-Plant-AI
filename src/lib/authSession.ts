import { supabase, isSupabaseConfigured } from './supabaseClient';
import { LanguageCode } from '../types';

const PHONE_AUTH_DOMAIN = 'drplant.internal';

export interface FarmerProfile {
  id: string;
  fullName: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  preferredLanguage: LanguageCode;
}

export interface SignUpInput {
  fullName: string;
  phone: string;
  password: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  preferredLanguage: LanguageCode;
}

export interface SignInInput {
  phone: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
  profile?: FarmerProfile;
}

function phoneToEmail(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  return `${digitsOnly}@${PHONE_AUTH_DOMAIN}`;
}

function assertConfigured(): string | null {
  if (!isSupabaseConfigured || !supabase) {
    return 'Account sign-in is not available right now. You can still use the app as a guest.';
  }
  return null;
}

function getAuthErrorMessage(message: string, action: 'sign in' | 'sign up'): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
    return 'Too many account attempts. Please wait a few minutes and try again.';
  }
  if (normalizedMessage.includes('email not confirmed')) {
    return 'Please confirm your account email before signing in.';
  }
  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Incorrect mobile number or password.';
  }
  if (normalizedMessage.includes('already registered')) {
    return 'This mobile number is already registered. Try logging in instead.';
  }
  if (normalizedMessage.includes('error sending confirmation email')) {
    return 'Sign-up email delivery is not configured in Supabase. Disable email confirmation for this phone-based login, or configure an SMTP provider.';
  }

  return `Unable to ${action} right now. Please try again.`;
}

export async function signUpFarmer(input: SignUpInput): Promise<AuthResult> {
  const configError = assertConfigured();
  if (configError || !supabase) return { success: false, errorMessage: configError! };

  const digitsOnly = input.phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { success: false, errorMessage: 'Enter a valid 10-digit mobile number.' };
  }
  if (input.password.length < 4) {
    return { success: false, errorMessage: 'Password must be at least 4 characters.' };
  }
  if (!input.fullName.trim()) {
    return { success: false, errorMessage: 'Enter your name.' };
  }

  const email = phoneToEmail(input.phone);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
  });

  if (error) {
    return { success: false, errorMessage: getAuthErrorMessage(error.message, 'sign up') };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { success: false, errorMessage: 'Sign up did not return a user. Please try again.' };
  }

  const { error: profileError } = await supabase.from('application_users').insert({
    id: userId,
    full_name: input.fullName.trim(),
    phone: digitsOnly,
    village: input.village.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    preferred_language: input.preferredLanguage,
  });

  if (profileError) {
    return {
      success: false,
      errorMessage:
        profileError.code === '42P01'
          ? 'Your account was created, but the profile database schema does not allow farmer accounts. Apply the latest Supabase schema.'
          : profileError.message,
    };
  }

  return {
    success: true,
    profile: {
      id: userId,
      fullName: input.fullName.trim(),
      phone: digitsOnly,
      village: input.village.trim(),
      district: input.district.trim(),
      state: input.state.trim(),
      pincode: input.pincode.trim(),
      preferredLanguage: input.preferredLanguage,
    },
  };
}

export async function signInFarmer(input: SignInInput): Promise<AuthResult> {
  const configError = assertConfigured();
  if (configError || !supabase) return { success: false, errorMessage: configError! };

  const email = phoneToEmail(input.phone);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: input.password });

  if (error) {
    return { success: false, errorMessage: getAuthErrorMessage(error.message, 'sign in') };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { success: false, errorMessage: 'Login failed. Please try again.' };
  }

  const profile = await fetchFarmerProfile(userId);
  return { success: true, profile: profile || undefined };
}

export async function fetchFarmerProfile(userId: string): Promise<FarmerProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('application_users')
    .select('id, full_name, phone, village, district, state, pincode, preferred_language')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.full_name || '',
    phone: data.phone || '',
    village: data.village || '',
    district: data.district || '',
    state: data.state || '',
    pincode: data.pincode || '',
    preferredLanguage: (data.preferred_language as LanguageCode) || 'en',
  };
}

export async function getCurrentFarmerProfile(): Promise<FarmerProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return null;

  return fetchFarmerProfile(userId);
}

export async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id || null;
}

export function subscribeToAuthChanges(callback: (event: string) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((event) => callback(event));
  return () => data.subscription.unsubscribe();
}

export async function signOutFarmer(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}