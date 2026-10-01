import React, { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Lock,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/treatmentVaultData';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  signUpFarmer,
  signInFarmer,
  signOutFarmer,
  getCurrentFarmerProfile,
  FarmerProfile,
} from '../lib/authSession';

interface AuthViewProps {
  currentLanguage: LanguageCode;
  darkMode?: boolean;
  onAuthenticated?: (profile: FarmerProfile) => void;
  onSkip?: () => void;
}

const BRAND_GREEN = '#14532D';

export const AuthView: React.FC<AuthViewProps> = ({ currentLanguage, darkMode = false, onAuthenticated, onSkip }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    getCurrentFarmerProfile()
      .then(setProfile)
      .finally(() => setIsCheckingSession(false));
  }, []);

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 10;
  const isPasswordValid = password.length >= 4;

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const result =
      mode === 'signup'
        ? await signUpFarmer({ fullName, phone, password, village, district, state, pincode, preferredLanguage })
        : await signInFarmer({ phone, password });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.errorMessage || 'Something went wrong. Please try again.');
      return;
    }

    setProfile(result.profile || null);
    if (result.profile) {
      onAuthenticated?.(result.profile);
    }
  };

  const handleLogout = async () => {
    await signOutFarmer();
    setProfile(null);
  };

  const pageBg = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const surfaceBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-800' : 'border-slate-200';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBase = `w-full pl-9 pr-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
    darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
  }`;

  const HeaderBand = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="px-5 pt-8 pb-6 text-center" style={{ backgroundColor: BRAND_GREEN }}>
      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
        <Leaf className="w-7 h-7" style={{ color: BRAND_GREEN }} />
      </div>
      <h1 className="text-white font-black text-lg leading-tight">{title}</h1>
      <p className="text-white/70 text-xs mt-1">{subtitle}</p>
    </div>
  );

  if (isCheckingSession) {
    return (
      <div className={`flex-1 flex items-center justify-center ${pageBg}`}>
        <Loader2 className="w-6 h-6 animate-spin opacity-40" />
      </div>
    );
  }

  if (profile) {
    return (
      <div className={`flex-1 overflow-y-auto ${pageBg} ${textPrimary}`}>
        <HeaderBand title={profile.fullName} subtitle={profile.phone} />

        <div className="p-4 -mt-4">
          <div className={`p-5 rounded-2xl border ${surfaceBg} ${borderColor} space-y-4 shadow-sm`}>
            <div className={`p-3 rounded-xl border ${borderColor} flex items-center gap-2`}>
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className={`text-xs ${textSecondary}`}>
                {[profile.village, profile.district, profile.state, profile.pincode].filter(Boolean).join(', ') || 'No location set'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl flex items-start gap-2.5" style={{ backgroundColor: BRAND_GREEN }}>
              <ShieldCheck className="w-5 h-5 text-white shrink-0" />
              <p className="text-xs text-white leading-relaxed">
                Your premium unlock and reminders now follow this account, not just this phone.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`w-full py-3 rounded-xl border ${borderColor} flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-transform active:scale-[0.98] ${textSecondary}`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${pageBg} ${textPrimary}`}>
      <HeaderBand
        title="Dr Plant AI"
        subtitle={mode === 'signup' ? 'Create your farmer account' : 'Welcome back'}
      />

      <div className="p-4 -mt-4 space-y-4">
        <div className={`p-5 rounded-2xl border ${surfaceBg} ${borderColor} space-y-4 shadow-sm`}>
          <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
            Optional — the app works fully without an account. Signing in just keeps your premium unlock and reminders with you across devices.
          </p>

          {!isSupabaseConfigured && (
            <div className={`p-3 rounded-xl border ${borderColor} flex items-start gap-2`}>
              <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className={`text-xs ${textSecondary}`}>Account sign-in isn't set up yet. You can still use the app as a guest.</p>
            </div>
          )}

          {/* Sliding Mode Toggle */}
          <div className={`relative grid grid-cols-2 p-1 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out"
              style={{
                backgroundColor: BRAND_GREEN,
                transform: mode === 'signup' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))',
              }}
            />
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`relative z-10 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                mode === 'signup' ? 'text-white' : textSecondary
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`relative z-10 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                mode === 'login' ? 'text-white' : textSecondary
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className={inputBase}
              />
            </div>
          )}

          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number"
              className={`${inputBase} pr-9`}
            />
            {phone.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPhoneValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className={`text-[10px] font-bold ${textSecondary}`}>{phoneDigits.length}/10</span>
                )}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`${inputBase} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="space-y-3 pt-1 border-t border-dashed border-slate-300 dark:border-slate-700">
              <p className={`text-[10px] font-black uppercase tracking-wider pt-3 ${textSecondary}`}>Your Location</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village"
                  className={`px-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className={`px-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className={`px-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className={`px-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isSupabaseConfigured || !isPhoneValid || !isPasswordValid || (mode === 'signup' && !fullName.trim())}
            className="w-full py-3.5 rounded-xl text-white font-extrabold text-sm cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
          </button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors hover:text-emerald-600 ${textSecondary}`}
            >
              Continue as Guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};