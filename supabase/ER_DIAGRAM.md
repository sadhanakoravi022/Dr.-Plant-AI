# Dr. Plant AI - Unified Database Architecture & ER Diagram

This database schema serves as the single source of truth for both:
1. **The Mobile / PWA App**: Used by farmers for real-time disease diagnosis, local agro-shop product discovery, ordering, and crop management.
2. **The Web Portals**:
   - **Shop Partner Portal**: For verified agro-input shops to manage store details, product inventory, bulk uploads, and fulfill customer orders.
   - **Admin Web Dashboard**: For platform administrators to approve partner shops, review UPI payments / premium subscriptions, publish crop advisories, and analyze marketplace telemetry.
   - **Agronomist Portal**: For agricultural experts to publish regional advisories and disease management advisories.

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : has_web_role
    AUTH_USERS ||--|| APPLICATION_USERS : has_farmer_profile
    PROFILES ||--o{ SHOPS : owns
    PROFILES ||--o{ ADVISORIES : authors
    PROFILES ||--o{ PREMIUM_SUBSCRIPTIONS : verifies
    SHOPS ||--o{ SHOP_PRODUCTS : lists
    SHOPS ||--o{ PRODUCT_BULK_UPLOADS : uploads
    SHOPS ||--o{ ORDERS : receives
    SHOP_PRODUCTS ||--o{ ORDERS : ordered_in
    APPLICATION_USERS ||--o{ ORDERS : places
    APPLICATION_USERS ||--o{ PREMIUM_SUBSCRIPTIONS : subscribes
    APPLICATION_USERS ||--o{ DIAGNOSIS_HISTORY : scans
    APPLICATION_USERS ||--o{ FARMER_CROP_PLANS : tracks
    APPLICATION_USERS ||--o{ USER_FEEDBACK : submits

    PROFILES {
        uuid id PK "references auth.users"
        text role "shop_owner | admin | agronomist"
        text full_name
        text phone
        text email
        text avatar_url
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    APPLICATION_USERS {
        uuid id PK "references auth.users"
        text full_name
        text phone "unique"
        text village
        text district
        text state
        text pincode
        text preferred_language
        text avatar_url
        boolean is_premium
        timestamptz premium_expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    SHOPS {
        uuid id PK
        uuid owner_id FK "references profiles.id"
        text shop_name
        text owner_name
        text phone
        text whatsapp
        text email
        text address
        text village
        text district
        text state
        text pincode
        double latitude
        double longitude
        geography location "PostGIS Point (4326)"
        boolean is_verified_partner
        boolean subscription_active
        timestamptz subscription_expires_at
        text opening_hours
        text banner_image_url
        numeric rating
        timestamptz created_at
        timestamptz updated_at
    }

    SHOP_PRODUCTS {
        uuid id PK
        uuid shop_id FK "references shops.id"
        text name
        text brand_name
        text category "chemical | organic | biofertilizer | equipment | seeds | fertilizer"
        text chemical_salt
        text dosage_per_15l
        text_array target_diseases
        text_array target_crops
        text pack_size
        numeric price
        numeric mrp
        integer stock_quantity
        integer phi_days
        text image_url
        text description
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCT_BULK_UPLOADS {
        uuid id PK
        uuid shop_id FK "references shops.id"
        text file_path
        text status "pending | processing | completed | failed"
        integer row_count
        integer success_count
        jsonb error_log
        timestamptz created_at
    }

    ORDERS {
        uuid id PK
        text order_code "unique"
        uuid product_id FK "references shop_products.id"
        uuid shop_id FK "references shops.id"
        uuid farmer_id FK "references application_users.id"
        text farmer_name
        text village_address
        text phone
        integer quantity
        numeric unit_price
        numeric total_amount
        text payment_method "cod | upi | online"
        text status "pending | confirmed | dispatched | delivered | cancelled"
        text delivery_notes
        timestamptz created_at
        timestamptz updated_at
    }

    PREMIUM_SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK "references application_users.id"
        text device_id
        text phone
        text plan "single | lifetime | monthly | yearly"
        numeric amount_paid
        text utr_reference "unique when verified"
        text status "pending_verification | verified | rejected"
        timestamptz verified_at
        uuid verified_by FK "references profiles.id"
        text rejection_reason
        timestamptz activated_at
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    DIAGNOSIS_HISTORY {
        uuid id PK
        uuid user_id FK "references application_users.id"
        text device_id
        text crop
        text disease
        text pathogen_type
        numeric confidence
        text severity
        integer latency_ms
        text captured_image_url
        text treatment_id
        text language_used
        timestamptz created_at
    }

    FARMER_CROP_PLANS {
        uuid id PK
        uuid user_id FK "references application_users.id"
        text device_id
        text crop_id
        text crop_name
        date start_date
        integer current_day
        jsonb completed_tasks
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    ADVISORIES {
        uuid id PK
        uuid author_id FK "references profiles.id"
        text title
        text content
        text crop
        text severity "info | warning | critical"
        text district
        text state
        timestamptz valid_until
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    USER_FEEDBACK {
        uuid id PK
        uuid user_id FK "references application_users.id"
        text device_id
        text phone
        integer rating
        text category "accuracy | app_issue | shop_issue | treatment | other"
        text message
        text status "new | in_progress | resolved"
        timestamptz created_at
    }
```
