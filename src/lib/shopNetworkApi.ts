import { MarketplaceProduct } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface RegisteredShop {
  shopId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  latitude: number;
  longitude: number;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  isVerifiedPartner: boolean;
  subscriptionActive: boolean;
  updatedAt: string;
}

export interface ShopCatalogProduct {
  productId: string;
  shopId: string;
  name: string;
  brandName: string;
  category: 'chemical' | 'organic' | 'biofertilizer' | 'equipment';
  chemicalSalt?: string;
  dosagePer15L?: string;
  targetDiseases: string[];
  packSize: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  phiDays?: number;
  imageUrl?: string;
  updatedAt: string;
}

export interface NearbyShopGroup {
  shop: RegisteredShop;
  products: ShopCatalogProduct[];
}

export interface ShopSearchParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  diseaseQuery?: string;
  cropQuery?: string;
}

export type ShopSearchSource = 'live' | 'cached' | 'offline_demo' | 'error';

export interface ShopSearchResponse {
  source: ShopSearchSource;
  fetchedAt: number;
  groups: NearbyShopGroup[];
  errorMessage?: string;
}

const CACHE_KEY_PREFIX = 'dr_plant_shop_cache_';
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 3;

export function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function buildCacheKey(params: ShopSearchParams): string {
  const roundedLat = params.latitude.toFixed(2);
  const roundedLng = params.longitude.toFixed(2);
  const disease = (params.diseaseQuery || '').toLowerCase().trim();
  return `${CACHE_KEY_PREFIX}${roundedLat}_${roundedLng}_${disease}`;
}

function readCache(cacheKey: string): ShopSearchResponse | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShopSearchResponse;
    if (Date.now() - parsed.fetchedAt > CACHE_MAX_AGE_MS) return null;
    return { ...parsed, source: 'cached' };
  } catch {
    return null;
  }
}

function writeCache(cacheKey: string, response: ShopSearchResponse): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(response));
  } catch {
    return;
  }
}

interface NearbyProductRow {
  shop_id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  whatsapp: string | null;
  address: string;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number;
  longitude: number;
  is_verified_partner: boolean;
  distance_km: number;
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category: ShopCatalogProduct['category'];
  chemical_salt: string | null;
  dosage_per_15l: string | null;
  target_diseases: string[];
  pack_size: string | null;
  price: number;
  mrp: number | null;
  stock_quantity: number;
  phi_days: number | null;
  image_url: string | null;
}

function groupRowsByShop(rows: NearbyProductRow[]): NearbyShopGroup[] {
  const shopMap = new Map<string, NearbyShopGroup>();

  for (const row of rows) {
    if (!shopMap.has(row.shop_id)) {
      shopMap.set(row.shop_id, {
        shop: {
          shopId: row.shop_id,
          shopName: row.shop_name,
          ownerName: row.owner_name,
          phone: row.phone,
          whatsapp: row.whatsapp || undefined,
          latitude: row.latitude,
          longitude: row.longitude,
          address: row.address,
          village: row.village || '',
          district: row.district || '',
          state: row.state || '',
          pincode: row.pincode || '',
          isVerifiedPartner: row.is_verified_partner,
          subscriptionActive: true,
          updatedAt: new Date().toISOString(),
        },
        products: [],
      });
    }

    shopMap.get(row.shop_id)!.products.push({
      productId: row.product_id,
      shopId: row.shop_id,
      name: row.product_name,
      brandName: row.brand_name || '',
      category: row.category,
      chemicalSalt: row.chemical_salt || undefined,
      dosagePer15L: row.dosage_per_15l || undefined,
      targetDiseases: row.target_diseases || [],
      packSize: row.pack_size || '',
      price: row.price,
      mrp: row.mrp ?? row.price,
      stockQuantity: row.stock_quantity,
      phiDays: row.phi_days ?? undefined,
      imageUrl: row.image_url || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  return Array.from(shopMap.values());
}

export async function fetchNearbyShopProducts(params: ShopSearchParams): Promise<ShopSearchResponse> {
  const cacheKey = buildCacheKey(params);

  if (!isSupabaseConfigured || !supabase) {
    return { source: 'offline_demo', fetchedAt: Date.now(), groups: [] };
  }

  try {
    const { data, error } = await supabase.rpc('get_nearby_products', {
      p_lat: params.latitude,
      p_lng: params.longitude,
      p_radius_km: params.radiusKm ?? 15,
      p_disease: params.diseaseQuery || null,
      p_crop: params.cropQuery || null,
    });

    if (error) throw error;

    const groups = groupRowsByShop((data || []) as NearbyProductRow[]);
    const response: ShopSearchResponse = { source: 'live', fetchedAt: Date.now(), groups };
    writeCache(cacheKey, response);
    return response;
  } catch (err) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
    return {
      source: 'error',
      fetchedAt: Date.now(),
      groups: [],
      errorMessage: err instanceof Error ? err.message : 'Unable to reach the shop network',
    };
  }
}

export function mapShopGroupsToMarketplaceProducts(
  groups: NearbyShopGroup[],
  userLat: number,
  userLng: number
): MarketplaceProduct[] {
  const flattened: MarketplaceProduct[] = [];

  for (const group of groups) {
    const distanceKm = Math.round(computeDistanceKm(userLat, userLng, group.shop.latitude, group.shop.longitude) * 10) / 10;

    for (const product of group.products) {
      if (product.stockQuantity <= 0) continue;
      const mrp = product.mrp > 0 ? product.mrp : product.price;
      const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

      flattened.push({
        id: product.productId,
        shopId: group.shop.shopId,
        name: product.name,
        brandName: product.brandName,
        chemicalSalt: product.chemicalSalt || product.category,
        dosagePer15L: product.dosagePer15L || 'See product label',
        targetDiseases: product.targetDiseases,
        packSize: product.packSize,
        price: product.price,
        mrp,
        discountPercent,
        rating: 4.5,
        reviewCount: 0,
        storeName: `${group.shop.shopName}${group.shop.isVerifiedPartner ? ' (Verified Partner)' : ''}`,
        storeDistanceKm: distanceKm,
        inStock: true,
        deliveryEstimate: distanceKm <= 10 ? 'Same-day pickup / local delivery' : 'Delivery: 1-3 days',
        actionType: product.category === 'organic' ? 'bio' : 'systemic',
        phiDays: product.phiDays ?? 0,
        badge: group.shop.isVerifiedPartner ? 'Verified Partner Shop' : undefined,
        imageUrl: product.imageUrl,
      });
    }
  }

  return flattened.sort((a, b) => a.storeDistanceKm - b.storeDistanceKm);
}
