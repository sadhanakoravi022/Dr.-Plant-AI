# How the App and the Website Share Data (Supabase)

There is no custom backend server. Both the app and the website talk directly to the same Supabase project. The full table definitions, indexes and security rules are in `supabase/schema.sql` — this file explains how the two sides use them.

## App side (already built)

The app calls one Postgres function, `get_nearby_products`, directly through the Supabase client:

```ts
const { data } = await supabase.rpc('get_nearby_products', {
  p_lat: coords.latitude,
  p_lng: coords.longitude,
  p_radius_km: 15,
  p_disease: 'Late Blight',
  p_crop: 'Tomato',
});
```

This returns one row per shop+product pair, already filtered to shops with `subscription_active = true` and products with `is_active = true` and `stock_quantity > 0`, sorted by distance. `src/lib/shopNetworkApi.ts` groups those rows back into shops with their product lists.

When the farmer places an order, the app inserts a row directly into `orders` (see `src/lib/orderSubmission.ts`).

## Website side (not built yet)

The shop-owner portal needs to:

1. Use Supabase Auth for shop-owner login/signup, and insert a matching row into `profiles` (`role = 'shop_owner'`).
2. Let an owner create/edit their row in `shops` — this is where the shop's `latitude`/`longitude` get set. Geocode the shop's typed address into coordinates at this step (any geocoding API works; Supabase does not do this for you).
3. Let an owner add products to `shop_products`, either one at a time or by parsing a CSV/Excel upload into rows with this shape:

```
shop_id, product_name, brand_name, category, chemical_salt, dosage_per_15l,
target_diseases (semicolon-separated), pack_size, price, mrp, stock_quantity,
phi_days, image_url
```

4. Let an owner see and update their own `orders` (dispatched/delivered).
5. Let an admin flip `premium_subscriptions.status` from `pending_verification` to `verified` after checking the UTR the farmer submitted, and flip `shops.subscription_active` once an owner has paid for a listing.

None of this is app-repository work — Row Level Security in `supabase/schema.sql` already restricts each owner to their own `shops`/`shop_products`/`orders` rows using `auth.uid()`, so the website can be built independently without touching the app.

## What "nearby" actually means right now

`get_nearby_products` is a radius search (`p_radius_km`, default 15 km) around the farmer's GPS coordinates — not a strict "same village name" match. A shop shows up for a farmer whenever it falls inside that radius, regardless of whether the address text says the same village, town or district. If you want it to be stricter (e.g. only the same `district` column value), that's a one-line change to the `where` clause in the function, not an app change.
