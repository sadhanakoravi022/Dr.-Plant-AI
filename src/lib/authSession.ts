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
    return 'Please disable "Confirm email" in Supabase Dashboard (Authentication > Providers > Email) or confirm your account.';
  }
  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Incorrect mobile number or password.';
  }
  if (normalizedMessage.includes('already registered') || normalizedMessage.includes('user already registered')) {
    return 'This mobile number is already registered. Try logging in instead.';
  }
  if (normalizedMessage.includes('error sending confirmation email')) {
    return 'Sign-up email delivery failed. Disable "Confirm email" in Supabase Auth settings to enable phone-based login.';
  }
  if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('violates row-level security')) {
    return 'Database permissions issue on profile creation. Please apply the latest schema trigger or disable email confirmation in Supabase.';
  }

  return `Unable to ${action} right now: ${message}`;
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
  const metadata = {
    full_name: input.fullName.trim(),
    phone: digitsOnly,
    village: input.village.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    preferred_language: input.preferredLanguage,
  };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    return { success: false, errorMessage: getAuthErrorMessage(error.message, 'sign up') };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { success: false, errorMessage: 'Sign up did not return a user. Please try again.' };
  }

  // If a session was automatically created, we can safely upsert profile via authenticated RLS:
  let activeSession = data.session;
  if (!activeSession) {
    // Attempt auto-login in case email confirmation is disabled but session wasn't returned in signUp
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    activeSession = signInData.session;
  }

  if (activeSession) {
    try {
      await supabase.from('application_users').upsert({
        id: userId,
        full_name: metadata.full_name,
        phone: metadata.phone,
        village: metadata.village,
        district: metadata.district,
        state: metadata.state,
        pincode: metadata.pincode,
        preferred_language: metadata.preferred_language,
      });
    } catch (err) {
      console.warn('Could not upsert profile after signup (trigger may have already handled it):', err);
    }
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

  let profile = await fetchFarmerProfile(userId);

  // If profile does not exist in application_users table (e.g. earlier failed signup or missing trigger),
  // now that the user is authenticated (auth.uid() = userId), we can create it safely.
  if (!profile) {
    const meta = (data.user?.user_metadata || {}) as Record<string, string>;
    const digitsOnly = input.phone.replace(/\D/g, '');
    const fallbackProfile: FarmerProfile = {
      id: userId,
      fullName: meta.full_name || 'Farmer',
      phone: meta.phone || digitsOnly,
      village: meta.village || '',
      district: meta.district || '',
      state: meta.state || '',
      pincode: meta.pincode || '',
      preferredLanguage: (meta.preferred_language as LanguageCode) || 'en',
    };

    const { error: insertErr } = await supabase.from('application_users').upsert({
      id: userId,
      full_name: fallbackProfile.fullName,
      phone: fallbackProfile.phone,
      village: fallbackProfile.village,
      district: fallbackProfile.district,
      state: fallbackProfile.state,
      pincode: fallbackProfile.pincode,
      preferred_language: fallbackProfile.preferredLanguage,
    });

    if (!insertErr) {
      profile = await fetchFarmerProfile(userId);
    }
    if (!profile) {
      profile = fallbackProfile;
    }
  }

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

export async function signOutFarmer(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}