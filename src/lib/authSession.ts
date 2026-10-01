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
    if (error.message.toLowerCase().includes('already registered')) {
      return { success: false, errorMessage: 'This mobile number is already registered. Try logging in instead.' };
    }
    return { success: false, errorMessage: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { success: false, errorMessage: 'Sign up did not return a user. Please try again.' };
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'farmer',
    full_name: input.fullName.trim(),
    phone: digitsOnly,
    village: input.village.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    preferred_language: input.preferredLanguage,
  });

  if (profileError) {
    return { success: false, errorMessage: profileError.message };
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
    return { success: false, errorMessage: 'Incorrect mobile number or password.' };
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
    .from('profiles')
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

export async function signOutFarmer(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}