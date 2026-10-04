import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Leaf,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Languages,
  Sparkles,
  Droplet,
  Lock,
  Unlock,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  BadgeAlert,
  ShoppingBag,
  Store,
  Bell,
  Bookmark,
  Lightbulb,
  Share2,
  Square,
  CheckSquare,
  RotateCcw,
  Sprout
} from 'lucide-react';
import { TreatmentVaultItem, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, FARM_CANOPY_IMG } from '../data/treatmentVaultData';
import { watermelonDB } from '../lib/watermelon-db';
import { getTranslation } from '../data/translations';
import { getDetailedOrganicGuide } from '../data/organicMasterclassData';
import { PaymentPromptModal } from './PaymentPromptModal';
import { GrowMyCropView } from './GrowMyCropView';
import { ChemicalShopComponent } from './ChemicalShopComponent';
import { OrganicReminderSetupModal } from './OrganicReminderSetupModal';
import { OrganicReminderBanner } from './OrganicReminderBanner';
import { getReminders, getDueReminders, OrganicCareReminder } from '../lib/organicReminders';
import {
  getFavoriteIds,
  toggleFavorite,
  getChecklistState,
  toggleChecklistItem,
  resetChecklist,
  getTodaysTip,
  buildRecipeShareText,
  shareOrCopyRecipe,
} from '../lib/organicVaultExtras';

interface TreatmentVaultViewProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectForInspection?: (item: TreatmentVaultItem) => void;
  darkMode?: boolean;
  growTarget?: { cropId: string; day: number } | null;
  onGrowTargetConsumed?: () => void;
}

type VaultSection = 'treatments' | 'grow';

type TierFilter = 'all' | 'standard' | 'organic_premium';

export const TreatmentVaultView: React.FC<TreatmentVaultViewProps> = ({
  currentLanguage,
  onLanguageChange,
  darkMode = false,
  growTarget = null,
  onGrowTargetConsumed,
}) => {
  const [section, setSection] = useState<VaultSection>(growTarget ? 'grow' : 'treatments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<TierFilter>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('tomato_early_blight');
  const [activeCardTab, setActiveCardTab] = useState<Record<string, 'standard' | 'organic_premium'>>({});
  const [tankSize, setTankSize] = useState<number>(15);

  // Premium Unlock State (stored locally)
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('dr_plant_premium_unlocked') === 'true';
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePayCrop, setActivePayCrop] = useState('All Crops');
  const [openShopItemId, setOpenShopItemId] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteIds());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [checklistVersion, setChecklistVersion] = useState(0);
  const [shareFeedbackId, setShareFeedbackId] = useState<string | null>(null);

  const [reminders, setReminders] = useState<OrganicCareReminder[]>(() => getReminders());
  const [dueReminders, setDueReminders] = useState<OrganicCareReminder[]>(() => getDueReminders());
  const [reminderModalItemId, setReminderModalItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!growTarget) return;
    setSection('grow');
    if (onGrowTargetConsumed) onGrowTargetConsumed();
  }, [growTarget]);

  const refreshReminders = () => {
    setReminders(getReminders());
    setDueReminders(getDueReminders());
  };

  useEffect(() => {
    const interval = setInterval(refreshReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const t = getTranslation(currentLanguage);
  const vaultItems = watermelonDB.searchVault(searchQuery);
  const crops = ['All', ...Array.from(new Set(watermelonDB.getVaultItems().map((v) => v.crop)))];

  const filteredItems = vaultItems.filter((item) => {
    if (selectedCrop !== 'All' && item.crop !== selectedCrop) {
      return false;
    }
    // Tier filter filtering
    if (selectedTier === 'organic_premium') {
      // All items have organic guides, but we highlight items in this mode
      return true;
    }
    return true;
  }).filter((item) => {
    if (showFavoritesOnly && !favoriteIds.includes(item.id)) {
      return false;
    }
    if (ingredientQuery.trim().length > 0) {
      const guide = getDetailedOrganicGuide(item);
      const query = ingredientQuery.trim().toLowerCase();
      const hasIngredient = guide.ingredients.some((ing) => ing.toLowerCase().includes(query));
      if (!hasIngredient) return false;
    }
    return true;
  });

  const handleUnlockSuccess = () => {
    setIsPremiumUnlocked(true);
    localStorage.setItem('dr_plant_premium_unlocked', 'true');
  };

  const handleToggleDemoLock = () => {
    const newState = !isPremiumUnlocked;
    setIsPremiumUnlocked(newState);
    if (newState) {
      localStorage.setItem('dr_plant_premium_unlocked', 'true');
    } else {
      localStorage.removeItem('dr_plant_premium_unlocked');
    }
  };

  const openUnlockModal = (crop: string) => {
    setActivePayCrop(crop);
    setIsPaymentModalOpen(true);
  };

  const getPathogenBadge = (type: string) => {
    switch (type) {
      case 'fungus':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Fungal
          </span>
        );
      case 'bacteria':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
            Bacterial
          </span>
        );
      case 'virus':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Viral
          </span>
        );
      case 'healthy':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Optimal Vitality
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Pathology
          </span>
        );
    }
  };

  if (section === 'grow') {
    return (
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3.5 select-none transition-colors ${
          darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
        }`}
      >
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setSection('treatments')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            section === 'treatments'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Treatments</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('grow')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            section === 'grow'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Grow My Crop</span>
        </button>
      </div>

        <GrowMyCropView
          isPremiumUnlocked={isPremiumUnlocked}
          onRequestUnlock={() => openUnlockModal('Grow My Crop')}
          initialCropId={growTarget ? growTarget.cropId : null}
          initialDay={growTarget && growTarget.day > 0 ? growTarget.day : null}
          darkMode={darkMode}
        />

        <PaymentPromptModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onUnlockSuccess={handleUnlockSuccess}
          cropName={activePayCrop}
          darkMode={darkMode}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 space-y-3.5 select-none transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <OrganicReminderBanner dueReminders={dueReminders} onChanged={refreshReminders} darkMode={darkMode} />

      {/* Tip of the Day */}
      <div
        className={`p-3.5 rounded-2xl border-l-4 border flex items-start gap-2.5 ${
          darkMode
            ? 'bg-slate-900 border-slate-800 border-l-emerald-600'
            : 'bg-slate-50 border-slate-200 border-l-emerald-600'
        }`}
      >
        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-black uppercase tracking-wide text-emerald-600 block">
            Tip of the Day
          </span>
          <p className="text-xs opacity-80 leading-relaxed mt-0.5">{getTodaysTip()}</p>
        </div>
      </div>

      {/* Visual Header Banner with Farm Canopy */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
        <img
          src={FARM_CANOPY_IMG}
          alt="Agricultural crop field canopy"
          className="w-full h-24 object-cover brightness-95"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-3.5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#14532D] text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight">{t.vaultTitle}</h2>
                <span className="text-[10px] text-emerald-300 font-semibold">
                  Standard & Organic/Premium Agronomy Tiers
                </span>
              </div>
            </div>

            {/* In-Vault Language Picker */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-2 py-1">
              <Languages className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-900">
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setSection('treatments')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            section === 'treatments'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Treatments</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('grow')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            section === 'grow'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Grow My Crop</span>
        </button>
      </div>

      {/* Premium Tier Status & Unlock Callout Banner */}
      <div
        className={`p-3.5 rounded-3xl border transition-all ${
          isPremiumUnlocked
            ? darkMode
              ? 'bg-linear-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-linear-to-r from-emerald-50 via-amber-50/50 to-emerald-50 border-amber-400 text-slate-800'
            : darkMode
            ? 'bg-linear-to-r from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/30 text-white'
            : 'bg-linear-to-r from-amber-50 via-orange-50/40 to-emerald-50 border-amber-300 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isPremiumUnlocked
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-linear-to-br from-amber-500 to-orange-500 text-white'
              }`}
            >
              {isPremiumUnlocked ? (
                <Crown className="w-5 h-5 fill-current" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs tracking-tight">
                  {isPremiumUnlocked
                    ? '👑 Premium Organic Pass Active'
                    : 'Gated Organic / Premium Tier'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {isPremiumUnlocked ? 'Unlocked' : '₹49 / ₹99'}
                </span>
              </div>
              <p className="text-[11px] opacity-80 truncate mt-0.5">
                {isPremiumUnlocked
                  ? 'All masterclass bio-dynamic protocols, copper broths & 0-day PHI recipes revealed.'
                  : 'Unlock Vedic fermentations, earthen pot timelines & residue-free guides.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isPremiumUnlocked ? (
              <button
                type="button"
                onClick={handleToggleDemoLock}
                title="Toggle lock to test paywall state"
                className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all hover:opacity-80 bg-white/10 dark:bg-black/30 border-amber-500/30"
              >
                Test Lock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openUnlockModal(selectedCrop === 'All' ? 'All Crops' : selectedCrop)}
                className="px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock Premium</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tier Filter Selector (Standard vs Organic/Premium) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setSelectedTier('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            selectedTier === 'all'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Tiers
        </button>

        <button
          type="button"
          onClick={() => setSelectedTier('standard')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            selectedTier === 'standard'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Standard Tier</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTier('organic_premium')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            selectedTier === 'organic_premium'
              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-xs'
              : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
          }`}
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>Organic / Premium</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all shadow-xs ${
            darkMode
              ? 'bg-slate-900 border-slate-800 text-white focus:bg-slate-850'
              : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
          }`}
        />
      </div>

      {/* Ingredient-Have Search + Favorites Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Leaf className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ingredientQuery}
            onChange={(e) => setIngredientQuery(e.target.value)}
            placeholder="I have this ingredient... (e.g. neem, garlic)"
            className={`w-full pl-8 pr-3 py-2 rounded-xl border text-[11px] placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFavoritesOnly((v) => !v)}
          className={`shrink-0 px-3 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            showFavoritesOnly
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : darkMode
              ? 'bg-slate-900 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Crop Filter Horizontal Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {crops.map((crop) => (
          <button
            key={crop}
            type="button"
            onClick={() => setSelectedCrop(crop)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCrop === crop
                ? 'bg-[#14532D] text-white shadow-xs'
                : darkMode
                ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {crop === 'All' ? t.allCropsFilter : crop}
          </button>
        ))}
      </div>

      {/* Vault Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const trans = item.translations[currentLanguage] || item.translations.en;
          const isExpanded = expandedItemId === item.id;
          const activeTab = activeCardTab[item.id] || (selectedTier === 'organic_premium' ? 'organic_premium' : 'standard');
          const activeReminderForItem = reminders.find((r) => r.treatmentItemId === item.id && r.enabled);
          const detailedOrganic = getDetailedOrganicGuide(item);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border transition-all overflow-hidden shadow-xs ${
                isExpanded
                  ? darkMode
                    ? 'border-emerald-500/50 bg-slate-900 ring-1 ring-emerald-500/20'
                    : 'border-[#14532D]/40 bg-white ring-1 ring-[#14532D]/15'
                  : darkMode
                  ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Item Card Header */}
              <div
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Crop Leaf Photo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.disease}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FARM_CANOPY_IMG;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                        <Leaf className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {item.crop}
                      </span>
                      {getPathogenBadge(item.pathogenType)}

                      {/* Tier Badges */}
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Standard
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                        <span>Organic</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xs truncate">
                      {trans.title || item.disease}
                    </h3>
                    <p className="text-[11px] opacity-60 italic truncate">
                      {item.pathogenScientificName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFavoriteIds(toggleFavorite(item.id));
                    }}
                    className="p-1 cursor-pointer"
                    title="Toggle favorite"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        favoriteIds.includes(item.id) ? 'text-emerald-600 fill-current' : 'opacity-40'
                      }`}
                    />
                  </button>
                  <div className="p-1 opacity-50">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div
                  className={`p-4 pt-0 border-t space-y-3.5 text-xs transition-colors ${
                    darkMode ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  {/* Field Specimen Image Banner */}
                  {item.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden mt-3 border border-slate-200 dark:border-slate-700">
                      <img
                        src={item.imageUrl}
                        alt={item.disease}
                        className="w-full h-36 object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FARM_CANOPY_IMG;
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Field Specimen Photo</span>
                      </div>
                    </div>
                  )}

                  {/* Card Level Tier Switch: Standard vs Organic/Premium */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setActiveCardTab((prev) => ({ ...prev, [item.id]: 'standard' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'standard'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Standard Tier (Free)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCardTab((prev) => ({ ...prev, [item.id]: 'organic_premium' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'organic_premium'
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                      }`}
                    >
                      {isPremiumUnlocked ? (
                        <Crown className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span>Organic / Premium Tier</span>
                      {!isPremiumUnlocked && (
                        <span className="text-[9px] bg-black/20 px-1 rounded">Locked</span>
                      )}
                    </button>
                  </div>

                  {/* ===================== TAB 1: STANDARD TIER ===================== */}
                  {activeTab === 'standard' && (
                    <div className="space-y-3 animate-fadeIn">
                      {/* Pathology Summary */}
                      <div
                        className={`p-3 rounded-2xl border ${
                          darkMode
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                            : 'bg-[#14532D]/5 border-[#14532D]/15 text-slate-800'
                        }`}
                      >
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                          {trans.title}
                        </span>
                        <p className="leading-relaxed opacity-90">{trans.summary}</p>
                      </div>

                      {/* Knapsack Sprayer Dosage Calculator */}
                      <div
                        className={`p-3.5 rounded-2xl border ${
                          darkMode
                            ? 'bg-slate-850 border-slate-750'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-xs">
                            <Droplet className="w-4 h-4 text-blue-500" />
                            <span>{t.knapsackCalculatorTitle}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {[10, 15, 20].map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setTankSize(size)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                  tankSize === size
                                    ? 'bg-[#14532D] text-white shadow-xs'
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                              >
                                {size}L
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750">
                            <span className="opacity-60 block font-medium">{t.waterLabel}</span>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                              {tankSize} Liters
                            </span>
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750">
                            <span className="opacity-60 block font-medium">{t.dosageLabel}</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                              {((tankSize / 15) * 35).toFixed(0)} - {((tankSize / 15) * 45).toFixed(0)} ml/g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Basic Home Remedy (Free Standard Tier) */}
                      <div className="space-y-2">
                        <span className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Leaf className="w-3.5 h-3.5" />
                          <span>Standard Organic Home Remedy</span>
                        </span>

                        <div className="space-y-2">
                          {item.organicRemedies.slice(0, 2).map((rem, rIdx) => (
                            <div
                              key={rIdx}
                              className={`p-3 rounded-2xl border space-y-1.5 ${
                                darkMode
                                  ? 'bg-slate-900 border-slate-750'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs">
                                <span>{rem.name}</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                  {rem.costEstimate}
                                </span>
                              </div>

                              <div className="text-[11px] space-y-1 opacity-90 leading-relaxed">
                                <p>
                                  <strong>Recipe:</strong> {rem.recipe}
                                </p>
                                <p>
                                  <strong>Application:</strong> {rem.applicationMethod}
                                </p>
                                <div className="flex gap-4 pt-0.5 opacity-60 text-[10px]">
                                  <span>⏱ Prep: {rem.prepTime}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chemical Treatments Table (Standard Tier) */}
                      <div className="space-y-2 pt-1">
                        <span className="font-extrabold text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Standard Chemical Control</span>
                        </span>

                        <div className="space-y-2">
                          {item.chemicalTreatments.map((chem, cIdx) => (
                            <div
                              key={cIdx}
                              className={`p-3 rounded-2xl border space-y-1 text-xs ${
                                darkMode
                                  ? 'bg-slate-900 border-slate-750'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>{chem.activeIngredient}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                  {chem.toxicityLevel}
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Tank Dose (15L): {chem.dosagePer15LKnapsack}
                              </p>
                              <div className="flex items-center justify-between text-[10px] opacity-70 pt-0.5">
                                <span>Trade Names: {chem.tradeNames.join(', ')}</span>
                                <span className="font-bold">PHI: {chem.safetyIntervalDays} Days</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Marketplace Shop Direct Buy Integration */}
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => setOpenShopItemId(openShopItemId === item.id ? null : item.id)}
                            className={`w-full py-2.5 px-3.5 rounded-2xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                              openShopItemId === item.id
                                ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : darkMode
                                ? 'border-slate-800 bg-slate-850 text-slate-200 hover:border-slate-700'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>
                                {openShopItemId === item.id
                                  ? 'Hide Nearby Krishi Kendra Products'
                                  : `Buy Authorized Chemicals for ${item.disease}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                              {openShopItemId === item.id ? 'Close' : 'View Stores & Prices'}
                            </span>
                          </button>

                          {openShopItemId === item.id && (
                            <div className="mt-3">
                              <ChemicalShopComponent
                                disease={item.disease}
                                crop={item.crop}
                                darkMode={darkMode}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Teaser CTA to Upgrade to Premium Organic */}
                      {!isPremiumUnlocked && (
                        <div
                          onClick={() => openUnlockModal(item.crop)}
                          className={`p-3 rounded-2xl border border-dashed border-amber-400 cursor-pointer flex items-center justify-between transition-all hover:bg-amber-500/10 ${
                            darkMode ? 'bg-amber-950/20' : 'bg-amber-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <div className="text-[11px]">
                              <span className="font-bold text-amber-600 dark:text-amber-400 block">
                                Need Certified Organic Fermentation Recipes?
                              </span>
                              <span className="opacity-75">
                                Switch to Organic / Premium tier for copper broths & 0-day PHI protocols.
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 underline shrink-0 ml-2">
                            Unlock
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===================== TAB 2: ORGANIC / PREMIUM TIER ===================== */}
                  {activeTab === 'organic_premium' && (
                    <div className="space-y-3 animate-fadeIn">
                      {isPremiumUnlocked ? (
                        /* UNLOCKED DETAILED ORGANIC GUIDE */
                        <div className="space-y-3">
                          {/* Premium Verified Banner */}
                          <div className="p-3 rounded-2xl bg-linear-to-r from-emerald-950/40 via-slate-900 to-amber-950/40 border border-amber-400/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-400 fill-current" />
                              <span className="font-black text-xs text-amber-300">
                                Certified Masterclass Bio-Protocol
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              0-Day PHI Certified
                            </span>
                          </div>

                          {/* Guide Title & Subtitle */}
                          <div
                            className={`p-3.5 rounded-2xl border space-y-1.5 ${
                              darkMode
                                ? 'bg-slate-850 border-amber-500/30'
                                : 'bg-amber-50/60 border-amber-200'
                            }`}
                          >
                            <h4 className="font-black text-sm text-amber-700 dark:text-amber-300">
                              {detailedOrganic.title}
                            </h4>
                            <p className="text-xs opacity-80 leading-relaxed">
                              {detailedOrganic.subtitle}
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Target: {detailedOrganic.targetPathogen}</span>
                            </div>
                          </div>

                          {/* Metric Ingredients */}
                          <div
                            className={`p-3.5 rounded-2xl border space-y-2 ${
                              darkMode
                                ? 'bg-slate-900 border-slate-750'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ingredient Checklist (100L Bio-Batch):</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  resetChecklist(item.id);
                                  setChecklistVersion((v) => v + 1);
                                }}
                                className="p-1 opacity-50 hover:opacity-100 cursor-pointer"
                                title="Reset checklist"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <ul className="space-y-1.5 pl-1" key={checklistVersion}>
                              {detailedOrganic.ingredients.map((ing, idx) => {
                                const checked = !!getChecklistState(item.id)[idx];
                                return (
                                  <li key={idx}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        toggleChecklistItem(item.id, idx);
                                        setChecklistVersion((v) => v + 1);
                                      }}
                                      className="w-full text-xs flex items-start gap-2 leading-snug text-left cursor-pointer"
                                    >
                                      {checked ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 opacity-40 shrink-0 mt-0.5" />
                                      )}
                                      <span className={checked ? 'line-through opacity-50' : ''}>{ing}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Step-by-Step Fermentation Schedule */}
                          <div
                            className={`p-3.5 rounded-2xl border space-y-2 ${
                              darkMode
                                ? 'bg-slate-900 border-slate-750'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <span className="font-black text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Step-by-Step Bio-Dynamic Preparation:</span>
                            </span>
                            <div className="space-y-2 text-xs opacity-90 leading-relaxed">
                              {detailedOrganic.preparationSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <p>{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Application Rate, Knapsack Dilution, Shelf Life & Cost */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div
                              className={`p-3 rounded-2xl border ${
                                darkMode
                                  ? 'bg-slate-850 border-slate-750'
                                  : 'bg-emerald-50/70 border-emerald-200'
                              }`}
                            >
                              <span className="opacity-60 block font-bold">Knapsack Tank Rate</span>
                              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">
                                {detailedOrganic.applicationRate}
                              </span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl border ${
                                darkMode
                                  ? 'bg-slate-850 border-slate-750'
                                  : 'bg-amber-50/70 border-amber-200'
                              }`}
                            >
                              <span className="opacity-60 block font-bold">Estimated Cost</span>
                              <span className="font-black text-xs text-amber-600 dark:text-amber-400 block mt-0.5">
                                {detailedOrganic.costPerAcre}
                              </span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl border ${
                                darkMode
                                  ? 'bg-slate-850 border-slate-750'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span className="opacity-60 block font-bold">Fermentation Timeline</span>
                              <span className="font-black text-xs block mt-0.5">
                                {detailedOrganic.fermentationTime}
                              </span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl border ${
                                darkMode
                                  ? 'bg-slate-850 border-slate-750'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span className="opacity-60 block font-bold">Shelf Life & Storage</span>
                              <span className="font-black text-xs block mt-0.5">
                                {detailedOrganic.shelfLife}
                              </span>
                            </div>
                          </div>

                          {/* Ecological & Pollinator Badge */}
                          <div
                            className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                              darkMode
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            }`}
                          >
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="text-[11px] leading-tight">
                              <span className="font-black block">Ecological Safety Verified:</span>
                              <span className="opacity-80">{detailedOrganic.ecologicalSafety}</span>
                            </div>
                          </div>

                          {/* Care Reminder Setup */}
                          <button
                            type="button"
                            onClick={() => setReminderModalItemId(item.id)}
                            className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                              activeReminderForItem
                                ? darkMode
                                  ? 'bg-emerald-950/30 border-emerald-500/40'
                                  : 'bg-emerald-50 border-emerald-300'
                                : darkMode
                                ? 'bg-slate-900 border-slate-750 hover:border-slate-700'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-xs font-bold">
                                {activeReminderForItem
                                  ? `Reminder set: every ${activeReminderForItem.intervalDays} day(s) at ${String(activeReminderForItem.hour).padStart(2, '0')}:${String(activeReminderForItem.minute).padStart(2, '0')}`
                                  : 'Set a Care Reminder for this recipe'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 underline shrink-0">
                              {activeReminderForItem ? 'Edit' : 'Set Up'}
                            </span>
                          </button>

                          {/* Share Recipe */}
                          <button
                            type="button"
                            onClick={async () => {
                              const text = buildRecipeShareText(detailedOrganic, `${item.crop} - ${item.disease}`);
                              const result = await shareOrCopyRecipe(text);
                              if (result !== 'failed') {
                                setShareFeedbackId(item.id);
                                setTimeout(() => setShareFeedbackId(null), 2500);
                              }
                            }}
                            className={`w-full p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              darkMode ? 'bg-slate-900 border-slate-750 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold">
                              {shareFeedbackId === item.id ? 'Copied / Shared!' : 'Share this Recipe as Text'}
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* GATED / LOCKED STATE */
                        <div className="space-y-3">
                          {/* Locked Teaser Card */}
                          <div
                            className={`p-4 rounded-3xl border border-amber-400/60 relative overflow-hidden text-center space-y-3 ${
                              darkMode ? 'bg-slate-900/90' : 'bg-amber-50/50'
                            }`}
                          >
                            {/* Frosted/Blurred Mock Preview in Background */}
                            <div className="space-y-2 opacity-35 filter blur-[2px] select-none pointer-events-none text-left">
                              <div className="h-4 bg-amber-500/40 rounded w-3/4" />
                              <div className="h-3 bg-slate-400/30 rounded w-full" />
                              <div className="h-3 bg-slate-400/30 rounded w-5/6" />
                              <div className="h-3 bg-emerald-500/30 rounded w-2/3" />
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <div className="h-10 bg-slate-400/20 rounded-xl" />
                                <div className="h-10 bg-slate-400/20 rounded-xl" />
                              </div>
                            </div>

                            {/* Centered Lock Overlay */}
                            <div className="relative z-10 py-2">
                              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white mx-auto flex items-center justify-center shadow-lg mb-2.5">
                                <Lock className="w-6 h-6" />
                              </div>

                              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 inline-block mb-1">
                                Gated Organic Protocol
                              </span>

                              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                                {detailedOrganic.title}
                              </h4>
                              <p className="text-xs opacity-75 max-w-xs mx-auto leading-relaxed mt-1">
                                Detailed earthen pot fermentation timelines, copper infusions, 0-day PHI certifications, and metric ingredient ratios are reserved for Premium Organic members.
                              </p>

                              {/* Gated Unlock Button */}
                              <div className="pt-3">
                                <button
                                  type="button"
                                  onClick={() => openUnlockModal(item.crop)}
                                  className="py-2.5 px-5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                                >
                                  <Unlock className="w-4 h-4 text-amber-200" />
                                  <span>Unlock Premium Guide (₹49 / ₹99)</span>
                                </button>
                                <span className="text-[10px] opacity-60 block mt-1.5">
                                  Simulated payment • Instant permanent access
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulated Payment Prompt Modal */}
      <PaymentPromptModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
        cropName={activePayCrop}
        darkMode={darkMode}
      />

      {reminderModalItemId &&
        (() => {
          const reminderItem = vaultItems.find((i) => i.id === reminderModalItemId);
          if (!reminderItem) return null;
          const guide = getDetailedOrganicGuide(reminderItem);
          const existing = reminders.find((r) => r.treatmentItemId === reminderModalItemId && r.enabled);
          return (
            <OrganicReminderSetupModal
              isOpen={true}
              onClose={() => setReminderModalItemId(null)}
              onSaved={refreshReminders}
              treatmentItemId={reminderModalItemId}
              cropDiseaseLabel={`${reminderItem.crop} - ${reminderItem.disease}`}
              recipeIntervalDays={guide.reminderIntervalDays}
              existingReminder={existing}
              darkMode={darkMode}
            />
          );
        })()}
    </div>
  );
};