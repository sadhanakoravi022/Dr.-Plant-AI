import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Phone,
  Lock,
  User,
  MapPin,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  WifiOff,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/treatmentVaultData';
import { signUpFarmer, signInFarmer } from '../lib/authSession';

interface LoginGateProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;

  onAuthenticated: () => void;
  darkMode?: boolean;
}

const en = {
  title: 'Welcome to Dr. Plant AI',
  subtitleLogin: 'Log in to scan your crops and keep your history and premium unlock on every device.',
  subtitleSignup: 'Create a free account to scan your crops and keep your history and premium unlock safe.',
  tabLogin: 'Log In',
  tabSignup: 'Create Account',
  fullName: 'Full name',
  fullNamePh: 'Your name',
  mobile: 'Mobile number',
  mobilePh: '10-digit mobile number',
  password: 'Password',
  passwordPh: 'At least 6 characters',
  passwordLoginPh: 'Your password',
  confirmPassword: 'Confirm password',
  confirmPasswordPh: 'Type the password again',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  moreToggle: 'Add village & language (optional)',
  village: 'Village',
  district: 'District',
  state: 'State',
  pincode: 'Pincode',
  language: 'Preferred language',
  btnLogin: 'Log In',
  btnSignup: 'Create Account',
  newHere: 'New to Dr. Plant AI?',
  createLink: 'Create an account',
  haveAccount: 'Already have an account?',
  loginLink: 'Log in',
  offline: "You're offline. Connect to the internet to log in or create an account.",
  errMobile: 'Enter a valid 10-digit mobile number.',
  errName: 'Enter your name.',
  errPassword: 'Password must be at least 6 characters.',
  errMismatch: 'The two passwords do not match.',
  errBadLogin: 'Incorrect mobile number or password.',
  noAccountHint: "Don't have an account yet?",
  noAccountAction: 'Create one now',
  footer: 'Your mobile number is only used to sign you in.',
};

type Copy = typeof en;

const hi: Copy = {
  title: 'Dr. Plant AI में आपका स्वागत है',
  subtitleLogin: 'अपनी फ़सल स्कैन करने और इतिहास व प्रीमियम को हर डिवाइस पर पाने के लिए लॉग इन करें।',
  subtitleSignup: 'अपनी फ़सल स्कैन करने और इतिहास व प्रीमियम को सुरक्षित रखने के लिए मुफ़्त खाता बनाएँ।',
  tabLogin: 'लॉग इन',
  tabSignup: 'खाता बनाएँ',
  fullName: 'पूरा नाम',
  fullNamePh: 'आपका नाम',
  mobile: 'मोबाइल नंबर',
  mobilePh: '10 अंकों का मोबाइल नंबर',
  password: 'पासवर्ड',
  passwordPh: 'कम से कम 6 अक्षर',
  passwordLoginPh: 'आपका पासवर्ड',
  confirmPassword: 'पासवर्ड दोबारा लिखें',
  confirmPasswordPh: 'वही पासवर्ड फिर से लिखें',
  showPassword: 'पासवर्ड दिखाएँ',
  hidePassword: 'पासवर्ड छिपाएँ',
  moreToggle: 'गाँव और भाषा जोड़ें (वैकल्पिक)',
  village: 'गाँव',
  district: 'ज़िला',
  state: 'राज्य',
  pincode: 'पिनकोड',
  language: 'पसंदीदा भाषा',
  btnLogin: 'लॉग इन करें',
  btnSignup: 'खाता बनाएँ',
  newHere: 'Dr. Plant AI पर नए हैं?',
  createLink: 'खाता बनाएँ',
  haveAccount: 'पहले से खाता है?',
  loginLink: 'लॉग इन करें',
  offline: 'आप ऑफ़लाइन हैं। लॉग इन करने या खाता बनाने के लिए इंटरनेट से जुड़ें।',
  errMobile: '10 अंकों का सही मोबाइल नंबर लिखें।',
  errName: 'अपना नाम लिखें।',
  errPassword: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।',
  errMismatch: 'दोनों पासवर्ड एक जैसे नहीं हैं।',
  errBadLogin: 'मोबाइल नंबर या पासवर्ड गलत है।',
  noAccountHint: 'अभी खाता नहीं है?',
  noAccountAction: 'अभी बनाएँ',
  footer: 'आपका मोबाइल नंबर केवल साइन इन के लिए इस्तेमाल होता है।',
};

const COPY: Partial<Record<LanguageCode, Copy>> = { en, hi };

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return online;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  currentLanguage,
  onLanguageChange,
  onAuthenticated,
  darkMode = false,
}) => {
  const c: Copy = COPY[currentLanguage] || en;
  const online = useOnlineStatus();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateHint, setShowCreateHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(currentLanguage);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setErrorMessage(null);
    setShowCreateHint(false);
    setPassword('');
    setConfirmPassword('');
  };

  const validate = (): string | null => {
    if (mode === 'signup' && !fullName.trim()) return c.errName;
    if (phone.length !== 10) return c.errMobile;
    if (password.length < 6) return c.errPassword;
    if (mode === 'signup' && password !== confirmPassword) return c.errMismatch;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      setShowCreateHint(false);
      return;
    }

    setErrorMessage(null);
    setShowCreateHint(false);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = await signUpFarmer({
          fullName,
          phone,
          password,
          village,
          district,
          state: stateName,
          pincode,
          preferredLanguage,
        });
        if (!result.success) {
          setErrorMessage(result.errorMessage || c.errBadLogin);
          return;
        }
        if (preferredLanguage !== currentLanguage) onLanguageChange(preferredLanguage);
        onAuthenticated();
      } else {
        const result = await signInFarmer({ phone, password });
        if (!result.success) {

          const isCredentialError = (result.errorMessage || '').toLowerCase().startsWith('incorrect');
          setErrorMessage(isCredentialError ? c.errBadLogin : result.errorMessage || c.errBadLogin);
          setShowCreateHint(isCredentialError);
          return;
        }
        const saved = result.profile?.preferredLanguage;
        if (saved && saved !== currentLanguage) onLanguageChange(saved);
        onAuthenticated();
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message || c.errBadLogin);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dark = darkMode;
  const surface = dark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const border = dark ? 'border-slate-800' : 'border-slate-200';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full rounded-xl border text-sm py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 ${
    dark ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;
  const label = `block text-[11px] font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-600'}`;
  const isSignup = mode === 'signup';

  return (
    <div className={`flex-1 overflow-y-auto ${surface}`}>
      <div className="px-5 pt-7 pb-8 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#14532D] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
            <Sprout className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="mt-4 text-xl font-black tracking-tight">{c.title}</h2>
          <p className={`mt-1.5 text-xs leading-relaxed ${muted}`}>{isSignup ? c.subtitleSignup : c.subtitleLogin}</p>
        </div>

        <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl ${dark ? 'bg-slate-900' : 'bg-slate-100'}`} role="tablist">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === m
                  ? 'bg-[#14532D] text-white shadow-sm'
                  : dark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m === 'login' ? c.tabLogin : c.tabSignup}
            </button>
          ))}
        </div>

        {!online && (
          <div className={`p-3 rounded-xl flex items-start gap-2 ${dark ? 'bg-amber-950/40 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">{c.offline}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {isSignup && (
            <div>
              <label htmlFor="auth-name" className={label}>{c.fullName}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={c.fullNamePh}
                  className={`${input} pl-10 pr-3`}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-phone" className={label}>{c.mobile}</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
              <span className={`absolute left-10 top-1/2 -translate-y-1/2 text-sm font-bold ${muted} pointer-events-none`}>+91</span>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                placeholder={c.mobilePh}
                className={`${input} pl-[4.5rem] pr-3`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className={label}>{c.password}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? c.passwordPh : c.passwordLoginPh}
                className={`${input} pl-10 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? c.hidePassword : c.showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-55 hover:opacity-100 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignup && (
            <>
              <div>
                <label htmlFor="auth-confirm" className={label}>{c.confirmPassword}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={c.confirmPasswordPh}
                    className={`${input} pl-10 pr-3`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                className={`flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold cursor-pointer ${border} ${
                  dark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {c.moreToggle}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>

              {showMore && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="auth-village" className={label}>{c.village}</label>
                      <input id="auth-village" type="text" autoComplete="address-level3" value={village} onChange={(e) => setVillage(e.target.value)} className={`${input} px-3`} />
                    </div>
                    <div>
                      <label htmlFor="auth-district" className={label}>{c.district}</label>
                      <input id="auth-district" type="text" autoComplete="address-level2" value={district} onChange={(e) => setDistrict(e.target.value)} className={`${input} px-3`} />
                    </div>
                    <div>
                      <label htmlFor="auth-state" className={label}>{c.state}</label>
                      <input id="auth-state" type="text" autoComplete="address-level1" value={stateName} onChange={(e) => setStateName(e.target.value)} className={`${input} px-3`} />
                    </div>
                    <div>
                      <label htmlFor="auth-pincode" className={label}>{c.pincode}</label>
                      <input id="auth-pincode" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} className={`${input} px-3`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="auth-lang" className={label}>{c.language}</label>
                    <select
                      id="auth-lang"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                      className={`${input} px-3`}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.nativeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <div role="alert" className={`p-3 rounded-xl flex items-start gap-2 ${dark ? 'bg-red-950/40 text-red-300' : 'bg-red-50 text-red-700'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold">{errorMessage}</p>
                {showCreateHint && (
                  <p className="mt-1">
                    {c.noAccountHint}{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="font-black underline cursor-pointer">
                      {c.noAccountAction}
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !online}
            className="w-full py-3.5 rounded-2xl bg-[#14532D] hover:bg-[#166534] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSignup ? c.btnSignup : c.btnLogin}</span>
          </button>
        </form>

        <p className={`text-center text-xs ${muted}`}>
          {isSignup ? c.haveAccount : c.newHere}{' '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            className="font-black text-emerald-600 hover:underline cursor-pointer"
          >
            {isSignup ? c.loginLink : c.createLink}
          </button>
        </p>

        <p className={`text-center text-[11px] ${muted} opacity-80`}>{c.footer}</p>
      </div>
    </div>
  );
};