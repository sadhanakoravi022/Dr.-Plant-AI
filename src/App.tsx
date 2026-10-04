import React, { useState, useEffect } from 'react';
import {
  Camera,
  BookOpen,
  History,
  Home,
  User,
  Loader2
} from 'lucide-react';
import { LandingPageView } from './components/LandingPageView';
import { CameraViewfinder } from './components/CameraViewfinder';
import { TreatmentVaultView } from './components/TreatmentVaultView';
import { DiagnosisHistoryView } from './components/DiagnosisHistoryView';
import { AuthView } from './components/AuthView';
import { LoginGate } from './components/LoginGate';
import { DiagnosisResultModal } from './components/DiagnosisResultModal';
import { EdgeArchitectureModal } from './components/EdgeArchitectureModal';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { InferenceResult, LanguageCode, DiagnosisRecord } from './types';
import { watermelonDB } from './lib/watermelon-db';
import { getTranslation } from './data/translations';
import { registerNotificationTapHandler } from './lib/cropPlanNotifications';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { getAuthUserId, subscribeToAuthChanges } from './lib/authSession';

type AuthStatus = 'checking' | 'signedOut' | 'signedIn';

export default function App() {

  const [activeTab, setActiveTab] = useState<'home' | 'camera' | 'vault' | 'history' | 'account'>('home');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('dr_plant_lang') as LanguageCode) || 'en';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dr_plant_dark_mode');
    return saved !== null ? saved === 'true' : false;
  });
  const [activeResult, setActiveResult] = useState<InferenceResult | null>(null);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'checking' : 'signedIn');

  const [growTarget, setGrowTarget] = useState<{ cropId: string; day: number } | null>(null);

  const t = getTranslation(currentLanguage);

  useEffect(() => {
    const openFromHash = () => {
      const match = window.location.hash.match(/^#grow\/([a-z-]+)(?:\/(\d+))?$/);
      if (!match) return;
      setGrowTarget({ cropId: match[1], day: match[2] ? Number(match[2]) : 0 });
      setActiveTab('vault');
      history.replaceState(null, '', window.location.pathname + window.location.search);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    const unregister = registerNotificationTapHandler((target) => {
      setGrowTarget(target);
      setActiveTab('vault');
    });
    return () => {
      window.removeEventListener('hashchange', openFromHash);
      unregister();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('dr_plant_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('dr_plant_lang', lang);
  };

  useEffect(() => {
    const unsub = watermelonDB.subscribe((updatedRecords) => {
      setRecords(updatedRecords);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    getAuthUserId()
      .then((userId) => {
        if (!cancelled) setAuthStatus(userId ? 'signedIn' : 'signedOut');
      })
      .catch(() => {
        if (!cancelled) setAuthStatus('signedOut');
      });

    const unsubscribe = subscribeToAuthChanges((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthStatus('signedOut');
        setActiveTab('home');
        setActiveResult(null);
        setPendingUploadFile(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleDiagnosisComplete = (result: InferenceResult) => {
    setActiveResult(result);
  };

  const handleInspectHistoryRecord = (record: DiagnosisRecord) => {
    const reconstructedResult: InferenceResult = {
      id: record.id,
      timestamp: record.timestamp,
      label: `${record.crop} ${record.disease}`,
      crop: record.crop,
      disease: record.disease,
      pathogenType: record.pathogenType,
      confidence: record.confidence,
      latencyMs: record.latencyMs,
      tensorDimensions: [1, 224, 224, 3],
      topPredictions: [
        {
          label: `${record.crop} - ${record.disease}`,
          crop: record.crop,
          disease: record.disease,
          confidence: record.confidence,
        },
      ],
      severity: record.severity,
      isLowConfidence: record.confidence < 75,
      treatmentId: record.treatmentId,
      capturedImageUri: record.capturedImageUri,
    };

    setActiveResult(reconstructedResult);
  };

  const handleUploadFromLanding = (file: File) => {
    setPendingUploadFile(file);
    setActiveTab('camera');
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-0 sm:p-4 transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md h-[100dvh] sm:h-[840px] flex flex-col sm:rounded-3xl sm:shadow-2xl overflow-hidden relative border transition-colors ${
          darkMode
            ? 'bg-slate-950 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <OfflineStatusBanner
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onOpenArchitectureModal={() => setShowArchModal(true)}
        />

        <main
          className={`flex-1 flex flex-col overflow-hidden relative transition-colors ${
            darkMode ? 'bg-slate-950' : 'bg-white'
          }`}
        >
          {authStatus === 'checking' && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin opacity-40" />
            </div>
          )}

          {authStatus === 'signedOut' && (
            <LoginGate
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              onAuthenticated={() => {
                setActiveTab('home');
                setAuthStatus('signedIn');
              }}
              darkMode={darkMode}
            />
          )}

          {authStatus === 'signedIn' && activeTab === 'home' && (
            <LandingPageView
              onOpenCamera={() => {
                setPendingUploadFile(null);
                setActiveTab('camera');
              }}
              onUploadFile={handleUploadFromLanding}
              onNavigateTab={(tab) => setActiveTab(tab)}
              recentRecords={records}
              onInspectRecord={handleInspectHistoryRecord}
              currentLanguage={currentLanguage}
              darkMode={darkMode}
            />
          )}

          {authStatus === 'signedIn' && activeTab === 'camera' && (
            <CameraViewfinder
              onDiagnosisComplete={handleDiagnosisComplete}
              onCloseCamera={() => setActiveTab('home')}
              initialUploadFile={pendingUploadFile}
              currentLanguage={currentLanguage}
              darkMode={darkMode}
            />
          )}

          {authStatus === 'signedIn' && activeTab === 'vault' && (
            <TreatmentVaultView
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              darkMode={darkMode}
              growTarget={growTarget}
              onGrowTargetConsumed={() => setGrowTarget(null)}
            />
          )}

          {authStatus === 'signedIn' && activeTab === 'history' && (
            <DiagnosisHistoryView
              onInspectRecord={handleInspectHistoryRecord}
              currentLanguage={currentLanguage}
              darkMode={darkMode}
            />
          )}

          {authStatus === 'signedIn' && activeTab === 'account' && (
            <AuthView currentLanguage={currentLanguage} darkMode={darkMode} />
          )}
        </main>

        {authStatus === 'signedIn' && (
          <nav
            className={`h-16 border-t px-2 grid grid-cols-5 items-center shrink-0 select-none z-20 transition-colors ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-100 text-slate-500'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`w-full py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'home'
                  ? darkMode
                    ? 'text-emerald-400 font-black bg-emerald-950/40'
                    : 'text-[#14532D] font-black bg-[#14532D]/10'
                  : darkMode
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
              <span className="text-[11px] font-semibold">{t.navHome}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingUploadFile(null);
                setActiveTab('camera');
              }}
              className={`w-full py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? darkMode
                    ? 'text-emerald-400 font-black bg-emerald-950/40'
                    : 'text-[#14532D] font-black bg-[#14532D]/10'
                  : darkMode
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              <Camera className={`w-5 h-5 ${activeTab === 'camera' ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
              <span className="text-[11px] font-semibold">{t.navScan}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className={`w-full py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? darkMode
                    ? 'text-emerald-400 font-black bg-emerald-950/40'
                    : 'text-[#14532D] font-black bg-[#14532D]/10'
                  : darkMode
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className={`w-5 h-5 ${activeTab === 'vault' ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
              <span className="text-[11px] font-semibold">{t.navTreatments}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`w-full py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? darkMode
                    ? 'text-emerald-400 font-black bg-emerald-950/40'
                    : 'text-[#14532D] font-black bg-[#14532D]/10'
                  : darkMode
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
              <span className="text-[11px] font-semibold">
                {t.navHistory} {records.length > 0 ? `(${records.length})` : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`w-full py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'account'
                  ? darkMode
                    ? 'text-emerald-400 font-black bg-emerald-950/40'
                    : 'text-[#14532D] font-black bg-[#14532D]/10'
                  : darkMode
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              <User className={`w-5 h-5 ${activeTab === 'account' ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
              <span className="text-[11px] font-semibold">{t.navAccount}</span>
            </button>
          </nav>
        )}
      </div>

      {authStatus === 'signedIn' && activeResult && (
        <DiagnosisResultModal
          result={activeResult}
          onClose={() => setActiveResult(null)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          darkMode={darkMode}
        />
      )}

      {showArchModal && (
        <EdgeArchitectureModal
          onClose={() => setShowArchModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}