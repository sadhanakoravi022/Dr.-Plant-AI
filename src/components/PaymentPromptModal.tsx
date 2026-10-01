import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  ShieldCheck,
  Leaf,
  Loader2,
  BadgePercent,
  Phone,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { generateUpiQrDataUrl, getUpiPaymentConfig, submitPremiumPaymentClaim } from '../lib/upiPayment';

interface PaymentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  cropName?: string;
  darkMode?: boolean;
}

export const PaymentPromptModal: React.FC<PaymentPromptModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  cropName = 'All Crops',
  darkMode = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'lifetime'>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [utrReference, setUtrReference] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);

  const amount = selectedPlan === 'lifetime' ? 99 : 49;
  const upiConfig = getUpiPaymentConfig();

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    generateUpiQrDataUrl(amount, `Dr Plant AI ${selectedPlan} plan`).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, amount, selectedPlan]);

  if (!isOpen) return null;

  const handleConfirmPayment = async () => {
    setClaimError(null);
    setIsProcessing(true);

    const result = await submitPremiumPaymentClaim({
      plan: selectedPlan,
      amountPaid: amount,
      utrReference,
      phone: phoneNumber,
    });

    setIsProcessing(false);

    if (!result.success) {
      setClaimError(result.errorMessage || 'Could not save your payment details. Please try again.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onUnlockSuccess();
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          darkMode
            ? 'bg-slate-900 border-amber-500/30 text-white'
            : 'bg-white border-amber-500/30 text-slate-900'
        }`}
      >
        {/* Header with Gold/Emerald Gradient */}
        <div className="relative bg-linear-to-r from-emerald-800 via-[#14532D] to-amber-700 p-5 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PREMIUM ORGANIC</span>
            </span>
            <span className="text-[11px] font-bold text-amber-200 bg-black/30 px-2 py-0.5 rounded-full">
              0-Day PHI Certified
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight leading-snug">
            Unlock Masterclass Organic Guides
          </h3>
          <p className="text-xs text-emerald-100 opacity-90 mt-0.5">
            100% Residue-free Vedic recipes, fermentation timelines & knapsack formulas
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Success Screen */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                Reference Received!
              </h4>
              <p className="text-xs opacity-75 max-w-xs mx-auto">
                UTR: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{utrReference.trim()}</span>
              </p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                Unlocking all Masterclass Organic Guides on this device now...
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                  darkMode ? 'bg-slate-850 border-slate-750' : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      Step-by-Step Bio-Dynamic Fermentations
                    </span>
                    <span className="text-[11px] opacity-75">
                      Exact earthen pot procedures, copper plate infusions, and cow urine extracts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      Zero-Chemical & Pollinator-Safe
                    </span>
                    <span className="text-[11px] opacity-75">
                      0-Day Pre-Harvest Interval (PHI). Safe for bees, soil earthworms, and export crops.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      Permanent Offline Storage
                    </span>
                    <span className="text-[11px] opacity-75">
                      Stored on your device. Access anytime in rural fields without cell network.
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-60">
                  Select Access Plan
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Single Crop */}
                  <div
                    onClick={() => setSelectedPlan('single')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedPlan === 'single'
                        ? darkMode
                          ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30'
                          : 'border-[#14532D] bg-emerald-50 ring-2 ring-[#14532D]/20'
                        : darkMode
                        ? 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-60 block">
                      Single Crop
                    </span>
                    <span className="text-xs font-bold block truncate">{cropName} Only</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        ₹49
                      </span>
                      <span className="text-[10px] opacity-60">($0.99)</span>
                    </div>
                  </div>

                  {/* All Crops Lifetime */}
                  <div
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedPlan === 'lifetime'
                        ? darkMode
                          ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40'
                          : 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : darkMode
                        ? 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-2 bg-linear-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                      <BadgePercent className="w-2.5 h-2.5" />
                      <span>BEST VALUE</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
                      Lifetime Pass
                    </span>
                    <span className="text-xs font-bold block">All Crops & Diseases</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        ₹99
                      </span>
                      <span className="text-[10px] opacity-60">($1.99)</span>
                      <span className="text-[10px] line-through opacity-40 ml-1">₹299</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan & Pay */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-60">
                  Scan & Pay via Any UPI App
                </label>
                <div
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${
                    darkMode ? 'bg-slate-850 border-slate-750' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="UPI QR Code" className="w-40 h-40 rounded-xl bg-white p-1.5" />
                  ) : upiConfig ? (
                    <div className="w-40 h-40 rounded-xl flex items-center justify-center bg-white/40">
                      <Loader2 className="w-6 h-6 animate-spin opacity-60" />
                    </div>
                  ) : (
                    <div className="w-full flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] font-bold py-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>UPI ID not configured yet. Set VITE_UPI_VPA to enable the QR code.</span>
                    </div>
                  )}
                  {upiConfig && (
                    <span className="text-[11px] font-bold opacity-75">Pay to: {upiConfig.vpa}</span>
                  )}
                  <span className="text-xs font-black">₹{amount}</span>
                </div>
              </div>

              {/* Confirm Payment Reference */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-60">
                  After Paying, Confirm Here
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    value={utrReference}
                    onChange={(e) => setUtrReference(e.target.value)}
                    placeholder="UPI Transaction / UTR Reference No."
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Your Mobile Number"
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>
                {claimError && (
                  <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{claimError}</span>
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-emerald-600 via-[#14532D] to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Your Payment Reference...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-amber-300" />
                      <span>I've Paid — Confirm & Unlock</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] opacity-60 mt-2 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Unlocks instantly on this device. We spot-check UTRs and may contact you to verify.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
