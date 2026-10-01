import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  Star,
  ShieldAlert,
  Droplet,
  ExternalLink,
  CheckCircle2,
  X,
  Truck,
  MessageCircle,
  Tag,
  BadgePercent,
  Plus,
  Minus,
  Sparkles,
  Info,
  Navigation,
  Loader2,
  WifiOff
} from 'lucide-react';
import { MarketplaceProduct, FarmerOrder } from '../types';
import { useGeolocation } from '../lib/useGeolocation';
import { fetchNearbyShopProducts, mapShopGroupsToMarketplaceProducts, ShopSearchSource } from '../lib/shopNetworkApi';
import { submitFarmerOrder } from '../lib/orderSubmission';

interface ChemicalShopComponentProps {
  disease: string;
  crop?: string;
  darkMode?: boolean;
  onBuyNow?: (product: MarketplaceProduct) => void;
  className?: string;
}

export const ChemicalShopComponent: React.FC<ChemicalShopComponentProps> = ({
  disease,
  crop = 'Crop',
  darkMode = false,
  onBuyNow,
  className = '',
}) => {
  const { status: geoStatus, requestLocation } = useGeolocation();
  const [liveProducts, setLiveProducts] = useState<MarketplaceProduct[]>([]);
  const [searchSource, setSearchSource] = useState<ShopSearchSource | null>(null);
  const [isSearchingShops, setIsSearchingShops] = useState<boolean>(false);
  const products = liveProducts;

  const handleFindShopsNearMe = async () => {
    setIsSearchingShops(true);
    const coords = await requestLocation();
    if (!coords) {
      setIsSearchingShops(false);
      return;
    }
    const response = await fetchNearbyShopProducts({
      latitude: coords.latitude,
      longitude: coords.longitude,
      diseaseQuery: disease,
      cropQuery: crop,
    });
    setSearchSource(response.source);
    if (response.groups.length > 0) {
      setLiveProducts(mapShopGroupsToMarketplaceProducts(response.groups, coords.latitude, coords.longitude));
    }
    setIsSearchingShops(false);
  };

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'systemic' | 'contact' | 'combo'>('all');

  // Checkout modal state
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [farmerName, setFarmerName] = useState<string>('');
  const [villageAddress, setVillageAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<FarmerOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const filteredProducts = products.filter((prod) => {
    if (filterType === 'all') return true;
    return prod.actionType === filterType;
  });

  const handleOpenCheckout = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setPlacedOrder(null);
    onBuyNow?.(product);
  };

  const handleConfirmOrder = async () => {
    if (!selectedProduct) return;

    if (!farmerName.trim() || !villageAddress.trim() || phoneNumber.trim().length < 10) {
      setOrderError('Enter your name, farm address, and a valid mobile number.');
      return;
    }

    setOrderError(null);
    setIsPlacingOrder(true);

    const newOrder: FarmerOrder = {
      orderId: 'ORD-AGRI-' + Math.floor(10000 + Math.random() * 90000),
      productId: selectedProduct.id,
      shopId: selectedProduct.shopId,
      productName: selectedProduct.name,
      farmerName: farmerName.trim(),
      villageAddress: villageAddress.trim(),
      phone: phoneNumber.trim(),
      quantity,
      totalAmount: selectedProduct.price * quantity,
      paymentMethod,
      timestamp: Date.now(),
      status: 'confirmed',
    };

    const result = await submitFarmerOrder(newOrder, selectedProduct);
    setIsPlacingOrder(false);

    if (!result.success) {
      setOrderError(result.errorMessage || 'Could not place the order. Please try again.');
      return;
    }

    setPlacedOrder(newOrder);
  };

  const generateWhatsAppUrl = (product: MarketplaceProduct) => {
    const text = `Hello ${product.storeName}, I want to order ${product.name} (${product.packSize}) at ₹${product.price} for treating ${crop} ${disease}. Please confirm dispatch!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      <button
        type="button"
        onClick={handleFindShopsNearMe}
        disabled={isSearchingShops}
        className={`w-full p-2.5 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 ${
          darkMode
            ? 'bg-slate-900 border-emerald-500/30 text-emerald-300 hover:bg-slate-850'
            : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
        }`}
      >
        {isSearchingShops ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Finding verified shops near you...</span>
          </>
        ) : geoStatus === 'granted' && searchSource ? (
          <>
            {searchSource === 'live' && <Navigation className="w-3.5 h-3.5" />}
            {searchSource === 'cached' && <Clock className="w-3.5 h-3.5" />}
            {(searchSource === 'offline_demo' || searchSource === 'error') && <WifiOff className="w-3.5 h-3.5" />}
            <span>
              {searchSource === 'live' && 'Showing live verified shops near your location'}
              {searchSource === 'cached' && 'Showing last-known nearby shops (offline)'}
              {searchSource === 'offline_demo' && 'Shop network not connected yet — no shops to show'}
              {searchSource === 'error' && 'Could not reach the shop network — try again shortly'}
            </span>
          </>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5" />
            <span>Use my location to find real shops near me</span>
          </>
        )}
      </button>

      {/* Header with Marketplace Badge */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
          darkMode
            ? 'bg-slate-900 border-amber-500/30'
            : 'bg-linear-to-r from-amber-50 via-orange-50/40 to-amber-50 border-amber-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs">Nearby Krishi Kendra Marketplace</h4>
              <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                Direct Buy
              </span>
            </div>
            <p className="text-[11px] opacity-75">
              Authorized chemical treatments available for {crop} &bull; {disease}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 hidden sm:inline-block">
          ⚡ Same-Day / 24h Dispatch
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#14532D] text-white shadow-xs'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Solutions ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('systemic')}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'systemic'
              ? 'bg-[#14532D] text-white shadow-xs'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Systemic Cures
        </button>

        <button
          type="button"
          onClick={() => setFilterType('contact')}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'contact'
              ? 'bg-[#14532D] text-white shadow-xs'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Contact Sprays
        </button>

        <button
          type="button"
          onClick={() => setFilterType('combo')}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'combo'
              ? 'bg-[#14532D] text-white shadow-xs'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Combo Kits
        </button>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div
          className={`p-6 rounded-2xl border text-center space-y-1.5 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <Store className="w-6 h-6 mx-auto opacity-40" />
          <p className="text-xs font-bold opacity-70">
            {isSearchingShops
              ? 'Searching for shops near you...'
              : 'No shops found yet. Tap "Use my location" above to search nearby.'}
          </p>
        </div>
      )}

      {/* Product List Cards */}
      <div className="space-y-3">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className={`p-3.5 rounded-2xl border transition-all hover:shadow-md ${
              darkMode
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-amber-400'
            }`}
          >
            {/* Top Bar: Brand, Action Type, Badge */}
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  {prod.brandName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                  {prod.actionType} Action
                </span>
              </div>

              {prod.badge && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{prod.badge}</span>
                </span>
              )}
            </div>

            {/* Product Title & Chemical Formulation */}
            <div className="mb-2">
              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {prod.name}
              </h5>
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                Salt: {prod.chemicalSalt}
              </p>
            </div>

            {/* Dosage & PHI Banner */}
            <div
              className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between mb-2.5 ${
                darkMode ? 'bg-slate-850 border-slate-750' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-bold">{prod.dosagePer15L}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-bold opacity-75">
                <span>PHI:</span>
                <span className="text-amber-600 dark:text-amber-400">{prod.phiDays} Days</span>
              </div>
            </div>

            {/* Store & Proximity Info */}
            <div className="flex items-center justify-between text-[11px] opacity-80 mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-semibold truncate max-w-[200px]">{prod.storeName}</span>
                <span className="text-[10px] opacity-60">({prod.storeDistanceKm} km)</span>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold text-[11px]">{prod.rating}</span>
                <span className="text-[10px] opacity-60">({prod.reviewCount})</span>
              </div>
            </div>

            {/* Price & Purchase Row */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {/* Pricing Section */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    ₹{prod.price}
                  </span>
                  <span className="text-xs line-through opacity-50">₹{prod.mrp}</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    {prod.discountPercent}% OFF
                  </span>
                </div>
                <span className="text-[10px] opacity-60 block">{prod.packSize}</span>
              </div>

              {/* Action Buttons: WhatsApp & Buy Now */}
              <div className="flex items-center gap-1.5">
                <a
                  href={generateWhatsAppUrl(prod)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Order via WhatsApp"
                  className="p-2.5 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenCheckout(prod)}
                  className="py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout / Order Placement Drawer Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Instant Agri-Checkout</h4>
                  <span className="text-[10px] opacity-60">Verified Krishi Kendra Partner</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {placedOrder ? (
                /* Order Confirmation Screen */
                <div className="py-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    Order Placed Successfully!
                  </h4>
                  <p className="text-xs opacity-75">
                    Order Tracking ID: <span className="font-mono font-bold">{placedOrder.orderId}</span>
                  </p>

                  <div
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 ${
                      darkMode ? 'bg-slate-850 border-slate-750' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Item:</span>
                      <span>{placedOrder.productName} (x{placedOrder.quantity})</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{placedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-[11px] opacity-75">
                      <span>Payment:</span>
                      <span className="uppercase">{placedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Online'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] opacity-75">
                      <span>Delivery To:</span>
                      <span className="truncate max-w-[200px]">{placedOrder.villageAddress}</span>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-70">
                    The local dealer will call you at <span className="font-bold">{placedOrder.phone}</span> for delivery confirmation.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-2.5 rounded-xl bg-[#14532D] text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 transition-all"
                  >
                    Done & Return to Diagnosis
                  </button>
                </div>
              ) : (
                /* Order Configuration Form */
                <>
                  {/* Selected Item Summary */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      darkMode ? 'bg-slate-850 border-slate-750' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase block">
                        {selectedProduct.brandName}
                      </span>
                      <h5 className="font-extrabold text-xs">{selectedProduct.name}</h5>
                      <span className="text-[10px] opacity-75">{selectedProduct.packSize}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-xs px-1">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address & Contact */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-75 block">
                      Farmer Name & Village Address
                    </label>
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="Farmer Full Name"
                      className={`w-full px-3 py-2 rounded-xl border text-xs ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    />
                    <textarea
                      rows={2}
                      value={villageAddress}
                      onChange={(e) => setVillageAddress(e.target.value)}
                      placeholder="Village, Taluka, Farm Plot Landmark"
                      className={`w-full px-3 py-2 rounded-xl border text-xs resize-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Mobile Phone Number"
                      className={`w-full px-3 py-2 rounded-xl border text-xs ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold opacity-75 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Cash on Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <BadgePercent className="w-4 h-4" />
                        <span>UPI / QR Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between opacity-75">
                      <span>Item Subtotal ({quantity} pack):</span>
                      <span>₹{selectedProduct.price * quantity}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Delivery Fee to Farm:</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Total Payable:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ₹{selectedProduct.price * quantity}
                      </span>
                    </div>
                  </div>

                  {orderError && (
                    <p className="text-[11px] font-bold text-red-500">{orderError}</p>
                  )}

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <span>Placing Order with Store...</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Confirm Order (₹{selectedProduct.price * quantity})</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
