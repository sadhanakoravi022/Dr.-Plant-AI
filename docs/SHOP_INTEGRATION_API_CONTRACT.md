# Dr. Plant AI - App & Web Portals Supabase Integration Contract

This document explains how the **Mobile/PWA App** and the **Web Portals (Shop Owner Partner Portal & Admin Dashboard)** interact with the unified Supabase PostgreSQL database.

---

## 1. Architecture Overview

- **No Custom Backend Required**: Both the mobile app and the website portals connect directly to the same Supabase project via the Supabase Client SDK (`@supabase/supabase-js`).
- **Data Isolation & Security**: Supabase Row-Level Security (RLS) protects tables so shop owners can only read and modify their own shop's products/orders, farmers can only access their own profiles and subscriptions, and platform admins have global access.
- **Automated User Routing**: The PostgreSQL `handle_new_user()` trigger automatically routes signups to `public.profiles` for `shop_owner` / `admin` / `agronomist` roles, or to `public.application_users` for farmers.

---

## 2. Web Portal Capabilities (Website Side)

### A. Shop Owner Partner Portal
1. **Shop Registration & Profile**:
   - Authenticates via Supabase Auth with metadata `{ role: 'shop_owner' }`.
   - Inserts and updates row in `public.shops` with latitude, longitude, and contact details.
   - PostGIS automatically computes the `location` point geography for geospatial discovery.
2. **Product Catalog & Stock Management**:
   - CRUD operations on `public.shop_products` for pesticides, biofertilizers, seeds, organic remedies, and equipment.
   - Bulk upload via CSV/Excel using `public.product_bulk_uploads`.
3. **Order Fulfillment**:
   - Reads incoming orders in `public.orders` filtered by `shop_id`.
   - Updates order status (`confirmed` -> `dispatched` -> `delivered` -> `cancelled`).
   - Adding delivery tracking and farmer contact notes.
4. **Shop Analytics**:
   - Calls `supabase.rpc('get_shop_dashboard_stats', { p_shop_id: '...' })` for live metrics on active products, low stock items, pending orders, and total revenue.

### B. Platform Admin Dashboard
1. **Shop Partner Approvals**:
   - Updates `shops.is_verified_partner = true` and `shops.subscription_active = true`.
2. **Premium Subscription Verification (UPI Payments)**:
   - Queries `premium_subscriptions` where `status = 'pending_verification'`.
   - Calls `supabase.rpc('verify_premium_subscription', { p_subscription_id: '...', p_status: 'verified' })` which automatically updates subscription validity and flips `application_users.is_premium = true`.
3. **Global Marketplace Telemetry**:
   - Calls `supabase.rpc('get_admin_dashboard_stats')` for total farmers, partner shops, diagnosis scans, and gross merchandise value (GMV).
4. **Publish Regional Advisories**:
   - Writes to `public.advisories` with weather/pest warnings targeted at specific districts and crops.

---

## 3. Mobile / PWA App Capabilities (App Side)

1. **Nearby Product Discovery (Geospatial RPC)**:
   ```ts
   const { data } = await supabase.rpc('get_nearby_products', {
     p_lat: coords.latitude,
     p_lng: coords.longitude,
     p_radius_km: 15,
     p_disease: 'Late Blight', // optional
     p_crop: 'Tomato',        // optional
   });
   ```
2. **Nearby Shop Directory (Geospatial RPC)**:
   ```ts
   const { data } = await supabase.rpc('get_nearby_shops', {
     p_lat: coords.latitude,
     p_lng: coords.longitude,
     p_radius_km: 25,
   });
   ```
3. **Placing Farmer Orders**:
   - Inserts directly into `public.orders`.
   - Triggers automatic stock decrement via PostgreSQL trigger `on_order_created_reduce_stock`.
4. **Submitting UPI Premium Claims**:
   - Inserts into `public.premium_subscriptions` with `status = 'pending_verification'` and the UPI UTR number.
5. **Crop Calendar & Task Sync**:
   - Synchronizes farm schedule progress in `public.farmer_crop_plans`.
