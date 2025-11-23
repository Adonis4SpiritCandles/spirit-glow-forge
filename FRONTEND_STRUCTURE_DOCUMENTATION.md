# House of Venus - Frontend Structure & UI Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Design System](#design-system)
3. [Page Structure](#page-structure)
4. [Component Architecture](#component-architecture)
5. [Admin Dashboard](#admin-dashboard)
6. [User Dashboard](#user-dashboard)
7. [Checkout Flow](#checkout-flow)
8. [State Management](#state-management)
9. [Routing & Navigation](#routing--navigation)
10. [Styling Guidelines](#styling-guidelines)

---

## 1. Project Overview

**House of Venus** is a luxury fashion e-commerce platform that combines astrology with high fashion. The frontend is built with:

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Context API + TanStack Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (Radix UI primitives)

---

## 2. Design System

### 2.1 Color Palette

Located in `/src/index.css` under `:root` and `[data-theme="dark"]`.

#### Light Theme
```css
:root {
  /* Base Colors */
  --background: 60 33% 98%;      /* #FDFDF7 Ivory */
  --foreground: 0 0% 7%;         /* #121212 Ink */
  
  /* Brand Colors */
  --primary: 20 34% 50%;         /* #AB7757 Copper */
  --primary-foreground: 0 0% 98%; /* White text on copper */
  
  --secondary: 44 18% 94%;       /* #F5F3EE Pearl */
  --secondary-foreground: 0 0% 7%;
  
  --accent: 42 41% 55%;          /* #C4A953 Gold */
  --accent-foreground: 0 0% 7%;
  
  /* UI Elements */
  --muted: 44 18% 94%;           /* Pearl gray */
  --muted-foreground: 0 0% 45%;
  
  --card: 0 0% 100%;
  --card-foreground: 0 0% 7%;
  
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 20 34% 50%;            /* Copper focus ring */
  
  /* Element Colors (Astrology) */
  --fire: 14 68% 54%;            /* #E85A4F */
  --earth: 42 34% 35%;           /* #7A6A3C */
  --air: 217 27% 55%;            /* #6A86B6 */
  --water: 175 46% 33%;          /* #2F7D7B */
  
  /* Status Colors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
  --gradient-hero: linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  --background: 0 0% 10%;        /* #1A1A1A */
  --foreground: 0 0% 95%;        /* #F2F2F2 */
  
  --primary: 20 34% 50%;         /* Copper stays same */
  --primary-foreground: 0 0% 98%;
  
  --secondary: 0 0% 15%;         /* #262626 */
  --secondary-foreground: 0 0% 95%;
  
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 60%;
  
  --card: 0 0% 12%;
  --card-foreground: 0 0% 95%;
  
  --border: 0 0% 20%;
  --input: 0 0% 20%;
}
```

### 2.2 Typography

**Font Configuration** (`tailwind.config.ts`):
```typescript
fontFamily: {
  sans: ['"Inter"', 'system-ui', 'sans-serif'],
  serif: ['"Playfair Display"', 'Georgia', 'serif'],
  display: ['"Cormorant Garamond"', 'serif']
}
```

**Usage:**
- `font-serif`: Headlines, hero sections (Playfair Display)
- `font-display`: Special titles, featured text (Cormorant)
- `font-sans`: Body text, UI elements (Inter)

**Size Scale:**
```css
text-xs: 0.75rem      /* 12px */
text-sm: 0.875rem     /* 14px */
text-base: 1rem       /* 16px */
text-lg: 1.125rem     /* 18px */
text-xl: 1.25rem      /* 20px */
text-2xl: 1.5rem      /* 24px */
text-3xl: 1.875rem    /* 30px */
text-4xl: 2.25rem     /* 36px */
text-5xl: 3rem        /* 48px */
text-6xl: 3.75rem     /* 60px */
text-7xl: 4.5rem      /* 72px */
```

### 2.3 Spacing System

Follows Tailwind's default 4px base scale:
```css
0: 0px
px: 1px
0.5: 0.125rem  /* 2px */
1: 0.25rem     /* 4px */
2: 0.5rem      /* 8px */
3: 0.75rem     /* 12px */
4: 1rem        /* 16px */
6: 1.5rem      /* 24px */
8: 2rem        /* 32px */
12: 3rem       /* 48px */
16: 4rem       /* 64px */
20: 5rem       /* 80px */
24: 6rem       /* 96px */
```

### 2.4 Component Variants

Using `class-variance-authority` (cva) for variant management.

**Button Variants** (`/src/components/ui/button.tsx`):
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        copper: "bg-primary text-white hover:bg-primary/80 shadow-lg hover:shadow-primary/50",
        gold: "bg-accent text-foreground hover:bg-accent/80 shadow-lg hover:shadow-accent/50"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

---

## 3. Page Structure

### 3.1 Homepage (`/src/pages/Index.tsx`)

**Route:** `/`

**Sections:**
1. **Hero Section** (`HeroSection.tsx`)
   - Full-width background video/image
   - Animated headline with Framer Motion
   - Venus calculator mini form (inline)
   - CTA buttons

2. **Featured Products Carousel** (`ProductCarousel.tsx`)
   - Auto-play Embla carousel
   - 4 products visible (desktop), 1 (mobile)
   - Quick-add to cart functionality

3. **Featured Collections Grid**
   - 3-4 collection cards
   - Hover animations (scale + glow effect)
   - Links to `/collections/:slug`

4. **Trust Badges** (`TrustBadges.tsx`)
   - Icons for: Free Shipping, Secure Payment, Easy Returns
   - Responsive grid layout

5. **Testimonials Carousel** (`TestimonialsCarousel.tsx`)
   - Customer reviews
   - Star ratings
   - Auto-play slider

6. **Newsletter Signup** (`NewsletterSignup.tsx`)
   - Email input
   - Optional Venus sign selection
   - GDPR consent checkbox

**Layout:**
```tsx
<div className="min-h-screen bg-background">
  <HeroSection />
  
  <section className="py-16 px-4 max-w-7xl mx-auto">
    <ProductCarousel />
  </section>
  
  <section className="py-12 bg-secondary">
    <CollectionsGrid />
  </section>
  
  <section className="py-16">
    <TrustBadges />
  </section>
  
  <section className="py-16 bg-gradient-to-b from-secondary to-background">
    <TestimonialsCarousel />
  </section>
  
  <section className="py-16">
    <NewsletterSignup />
  </section>
</div>
```

---

### 3.2 Shop Page (`/src/pages/Shop.tsx`)

**Route:** `/shop`

**Features:**
- Product grid (4 columns desktop, 2 tablet, 1 mobile)
- Filters sidebar:
  - Categories
  - Venus signs
  - Price range
  - Sizes
  - Colors
  - Elements (Fire, Earth, Air, Water)
- Sort dropdown (Price, Newest, Popular)
- Pagination
- Search bar

**Component Structure:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="flex gap-8">
    {/* Filters Sidebar */}
    <aside className="w-64 hidden lg:block">
      <FiltersSidebar
        categories={categories}
        venusSign={filters.venusSign}
        priceRange={filters.priceRange}
        onFilterChange={handleFilterChange}
      />
    </aside>
    
    {/* Products Grid */}
    <main className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif">Shop All</h1>
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </main>
  </div>
</div>
```

---

### 3.3 Product Detail Page (`/src/pages/ProductDetail.tsx`)

**Route:** `/product/:slug`

**Sections:**
1. **Product Gallery** (left side)
   - Main image
   - Thumbnail gallery
   - Zoom functionality
   - 360° view (optional)

2. **Product Info** (right side)
   - Product name
   - Price (dual currency: PLN + EUR)
   - Venus sign badges
   - Stock status
   - Size/color selector
   - Quantity input
   - Add to Cart button
   - Add to Wishlist button
   - Product description tabs:
     - Description
     - Fabric Details
     - Care Instructions
     - Model Info
     - Style Keywords

3. **Reviews Section**
   - Star rating average
   - Review list with pagination
   - Write review button (for verified purchases)

4. **Related Products Carousel**

**Layout:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Gallery */}
    <div>
      <img src={product.main_image_url} alt={product.name_en} />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {product.gallery_images.map(img => (
          <img key={img} src={img} alt={`${product.name_en} thumbnail`} className="cursor-pointer" />
        ))}
      </div>
    </div>
    
    {/* Info */}
    <div>
      <h1 className="text-4xl font-serif mb-4">{product.name_en}</h1>
      <div className="flex gap-2 mb-4">
        {product.venus_signs.map(sign => (
          <Badge key={sign} variant="outline">{sign}</Badge>
        ))}
      </div>
      
      <div className="text-3xl font-bold mb-6">
        {formatPrice(product.price_pln, 'PLN')}
        <span className="text-lg text-muted-foreground ml-2">
          ({formatPrice(product.price_eur, 'EUR')})
        </span>
      </div>
      
      <VariantSelector
        sizes={product.available_sizes}
        colors={product.available_colors}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        onSizeChange={setSelectedSize}
        onColorChange={setSelectedColor}
      />
      
      <div className="flex gap-4 mt-6">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
        </Button>
      </div>
      
      <Tabs defaultValue="description" className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="fabric">Fabric</TabsTrigger>
          <TabsTrigger value="care">Care</TabsTrigger>
          <TabsTrigger value="model">Model Info</TabsTrigger>
          <TabsTrigger value="style">Style Keywords</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description">
          {product.description_en}
        </TabsContent>
        <TabsContent value="fabric">
          {product.fabric_details_en}
        </TabsContent>
        <TabsContent value="care">
          {product.care_instructions_en}
        </TabsContent>
        <TabsContent value="model">
          {product.model_info_en}
        </TabsContent>
        <TabsContent value="style">
          <ul>
            {product.style_keywords_en.map(keyword => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  </div>
  
  <section className="mt-16">
    <ProductReviews productId={product.id} />
  </section>
  
  <section className="mt-16">
    <RelatedProducts productId={product.id} />
  </section>
</div>
```

---

### 3.4 Collections Page (`/src/pages/Collections.tsx`)

**Route:** `/collections`

Displays all collections as cards with:
- Collection image
- Collection name
- Product count
- Featured badge (if applicable)

---

### 3.5 Collection Detail Page (`/src/pages/CollectionDetail.tsx`)

**Route:** `/collections/:slug`

Similar to Shop page but:
- Pre-filtered by collection
- Hero section with collection description
- No category filter (already in specific collection)

---

### 3.6 Venus Calculator Page (`/src/pages/VenusCalculator.tsx`)

**Route:** `/venus-calculator`

**Layout:** 2-column split (sticky left, scrollable right)

**Left Column (Sticky):**
- Calculator form:
  - Birth date (date picker)
  - Birth time (time picker)
  - Birth place (autocomplete with Geoapify)
  - Calculate button

**Right Column (Results):**
- Empty state (before calculation)
- After calculation:
  - Main card: Venus sign with description
  - 3-grid cards:
    - Recommended colors
    - Fabric preferences
    - Accessory styles
  - Compatibility section
  - CTA to browse products filtered by Venus sign

**Form Validation:**
```tsx
const formSchema = z.object({
  birthDate: z.date({
    required_error: "Birth date is required"
  }),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  birthPlace: z.object({
    city: z.string().min(2),
    country: z.string().min(2),
    lat: z.number(),
    lng: z.number()
  })
});
```

---

### 3.7 Checkout Page (`/src/pages/Checkout.tsx`)

**Route:** `/checkout`

**Multi-step Process:**

**Step 1: Shipping Address**
- Form with address autocomplete (Geoapify)
- Fields: Name, Email, Phone, Street, Number, City, Postal Code, Country
- Save address checkbox (for logged-in users)

**Step 2: Shipping Method**
- Fetches available shipping options via `calculate-shipping-price`
- Displays carrier logos, delivery time, price
- Radio selection

**Step 3: Review & Pay**
- Order summary:
  - Line items with images
  - Subtotal
  - Shipping cost
  - Coupon discount (if applied)
  - Total
- Coupon code input
- Terms & conditions checkbox
- "Proceed to Payment" button → redirects to Stripe

**Component Structure:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="max-w-4xl mx-auto">
    <CheckoutSteps currentStep={currentStep} />
    
    {currentStep === 1 && (
      <ShippingAddressForm
        onSubmit={handleAddressSubmit}
      />
    )}
    
    {currentStep === 2 && (
      <ShippingOptions
        address={shippingAddress}
        parcel={calculateParcelData(cartItems)}
        onSelect={handleShippingSelect}
      />
    )}
    
    {currentStep === 3 && (
      <OrderReview
        cartItems={cartItems}
        shippingAddress={shippingAddress}
        shippingCost={shippingCost}
        onCheckout={handleStripeCheckout}
      />
    )}
  </div>
  
  {/* Sticky Order Summary (desktop) */}
  <aside className="hidden lg:block fixed right-8 top-24 w-80">
    <OrderSummaryCard
      items={cartItems}
      subtotal={subtotal}
      shipping={shippingCost}
      discount={discountAmount}
      total={total}
    />
  </aside>
</div>
```

---

### 3.8 Cart Sidebar (`/src/components/CartSidebar.tsx`)

**Type:** Sheet (slide-in from right)

**Features:**
- List of cart items with:
  - Product image
  - Name
  - Size/color
  - Quantity controls (+/-)
  - Remove button
- Subtotal display
- Checkout button
- Continue shopping link

**State Management:**
```tsx
const { items, updateQuantity, removeItem, total } = useCart();
```

---

## 4. Component Architecture

### 4.1 Product Card (`/src/components/ProductCard.tsx`)

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
  showVenusSign?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}
```

**Features:**
- Product image with hover zoom
- Venus sign badges
- Price (dual currency)
- Quick add to cart button
- Wishlist heart icon
- Stock indicator
- Sale badge (if discounted)

**Animations:**
- Hover: Scale image 105%, show overlay
- Quick add: Slide up from bottom

---

### 4.2 Header (`/src/components/Header.tsx`)

**Sticky header with:**
- Logo (left)
- Navigation menu (center):
  - Shop
  - Collections
  - About
  - Contact
- Icons (right):
  - Search
  - Wishlist (with count badge)
  - Cart (with count badge)
  - User profile / Login
  - Language toggle (EN/PL)

**Mobile:** Hamburger menu

**Dynamic Behavior:**
- Transparent on hero scroll (optional)
- Background blur on scroll
- Hide on scroll down, show on scroll up

---

### 4.3 Footer (`/src/components/Footer.tsx`)

**4-column layout:**

1. **Company**
   - About
   - Contact
   - Careers

2. **Customer Service**
   - Shipping & Returns
   - Size Guide
   - FAQ

3. **Legal**
   - Privacy Policy
   - Terms of Sale
   - Cookie Policy

4. **Newsletter**
   - Email signup form
   - Social media icons

**Bottom Bar:**
- Copyright notice
- Payment method icons
- Language selector

---

### 4.4 Venus Sign Badge (`/src/components/VenusSignBadge.tsx`)

**Props:**
```typescript
interface VenusSignBadgeProps {
  sign: string; // 'aries' | 'taurus' | ...
  element?: 'fire' | 'earth' | 'air' | 'water';
  size?: 'sm' | 'md' | 'lg';
}
```

**Styling:**
- Background: Element color with opacity
- Border: Element color
- Icon: Zodiac symbol
- Tooltip: Sign description on hover

---

## 5. Admin Dashboard

### 5.1 Layout (`/src/pages/AdminDashboard.tsx`)

**Route:** `/admin`

**Auth Guard:** Redirects if `profile.role !== 'admin'`

**Sidebar Navigation:**
- Dashboard (Overview)
- Orders
- Products
- Collections
- Customers
- Coupons
- Analytics
- Site Settings
- Email Marketing

---

### 5.2 Orders Management

**Features:**
- Orders table with columns:
  - Order # (clickable)
  - Date
  - Customer
  - Total
  - Status badges
  - Payment status
  - Shipping status
  - Actions
- Filters:
  - Status (All, Pending, Processing, Shipped, Delivered, Cancelled)
  - Date range
  - Search by order # or email
- Bulk actions:
  - Export selected
  - Mark as processing
  - Cancel orders

**Order Detail Modal:**
- Customer info
- Line items
- Shipping address
- Tracking info
- Status timeline
- Actions:
  - Update status
  - Create Furgonetka shipment
  - Download invoice
  - Send tracking email
  - Add admin notes
  - Cancel order

**Create Furgonetka Shipment:**
1. Button: "Create Shipment"
2. Modal with optional weight/dimension overrides
3. On submit:
   - Calls `create-furgonetka-shipment` edge function
   - Shows success/error messages
   - If validation errors, displays them in alert
   - Updates order status to "awaiting_shipping"
   - Downloads shipping label PDF

---

### 5.3 Products Management

**Features:**
- Products table/grid view toggle
- Search & filters:
  - Category
  - Stock status
  - Active/inactive
  - Venus signs
- Add new product button
- Bulk actions:
  - Toggle active status
  - Update stock
  - Delete products

**Add/Edit Product Form:**
- Tabs:
  - Basic Info (names, descriptions, prices)
  - Media (images, video)
  - Inventory (stock, SKU, weight)
  - Variants (sizes, colors)
  - Astrology (Venus signs, elements)
  - SEO (meta title, description)
- Multilingual inputs (EN/PL toggle)
- Image uploader with drag & drop
- Rich text editor for descriptions

---

### 5.4 Collections Management

**Features:**
- Collections grid
- Add new collection
- Edit collection:
  - Name, description
  - Hero image
  - Gradient classes
  - Icon
  - Venus sign associations
- Assign products to collection (drag & drop or multi-select)

---

### 5.5 Coupons Management

**Features:**
- Coupons table
- Create coupon form:
  - Code
  - Discount type (percent or amount)
  - Validity dates
  - Usage limits (total & per-user)
  - Referral-only flag
- Deactivate/activate toggle
- View redemptions list

---

### 5.6 Site Settings

**Tabbed Interface:**

1. **General**
   - Maintenance mode toggle
   - Registration enable/disable
   - Notifications settings
   - Gradient overlay intensity

2. **Header**
   - Logo upload
   - Navigation items editor
   - Icon visibility toggles

3. **Footer**
   - Contact info
   - Social links
   - Legal documents upload

4. **Homepage**
   - Hero text editor
   - Hero video upload
   - Section toggles (enable/disable sections)
   - Featured collection selector

5. **Email Marketing**
   - Newsletter checkbox settings
   - Campaign manager

6. **SEO**
   - Default meta tags
   - Sitemap settings
   - Robots.txt editor

---

## 6. User Dashboard

### 6.1 Layout (`/src/pages/UserDashboard.tsx`)

**Route:** `/dashboard`

**Sidebar Navigation:**
- Overview
- Orders
- Wishlist
- Profile
- Addresses
- Loyalty Points
- Referrals

---

### 6.2 Orders Tab

**Features:**
- Orders list (card format):
  - Order # & date
  - Status badge
  - Tracking button (if available)
  - Reorder button
  - View details button
- Filter: All, Pending, Shipped, Delivered

**Order Detail Modal:**
- Line items
- Shipping address
- Tracking timeline (visual progress bar)
- Download invoice button
- Write review button (for delivered items)

---

### 6.3 Wishlist Tab

**Features:**
- Grid of wishlisted products
- Quick add to cart
- Remove from wishlist
- Share wishlist button

---

### 6.4 Profile Tab

**Sections:**
1. **Personal Info**
   - First/last name
   - Email
   - Username
   - Profile image upload
   - Cover image upload

2. **Venus Calculator Results**
   - Venus sign display
   - Birth chart info
   - Recalculate button

3. **Account Settings**
   - Change password
   - Language preference
   - Email preferences
   - Delete account button

---

### 6.5 Loyalty Points Tab

**Displays:**
- Current points balance
- Tier badge (Bronze/Silver/Gold/Platinum)
- Points history table:
  - Date
  - Action (Purchase, Review, Referral)
  - Points earned
- Rewards catalog (redeem points for discounts)

---

### 6.6 Referrals Tab

**Features:**
- User's referral code (big display with copy button)
- Share buttons (WhatsApp, Email, Copy link)
- Referral stats:
  - Total referrals
  - Completed referrals
  - Pending referrals
  - Total points earned
- Referral history table

---

## 7. Checkout Flow

### 7.1 Process Overview

```
Cart → Checkout Page (3 steps) → Stripe Payment → Payment Success → Order Created (via webhook)
```

---

### 7.2 Step-by-Step Implementation

#### Step 1: Shipping Address (`ShippingAddressForm.tsx`)

**Form Fields:**
```tsx
<Form {...form}>
  <FormField name="name" label="Full Name" />
  <FormField name="email" label="Email" />
  <FormField name="phone" label="Phone" />
  
  {/* Address Autocomplete */}
  <FormField name="address" label="Address">
    <Input
      value={address}
      onChange={(e) => {
        setAddress(e.target.value);
        if (e.target.value.length >= 3) {
          fetchAddressSuggestions(e.target.value);
        }
      }}
      autoComplete="off"
    />
    {showSuggestions && (
      <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            onClick={() => handleAddressSelect(suggestion)}
            className="px-4 py-2 hover:bg-accent cursor-pointer"
          >
            {suggestion.description}
          </div>
        ))}
      </div>
    )}
  </FormField>
  
  <div className="grid grid-cols-2 gap-4">
    <FormField name="streetNumber" label="Street Number" />
    <FormField name="apartmentNumber" label="Apt/Unit (optional)" />
  </div>
  
  <FormField name="city" label="City" />
  <div className="grid grid-cols-2 gap-4">
    <FormField name="postalCode" label="Postal Code" />
    <FormField name="country" label="Country">
      <Select>
        <SelectItem value="PL">Poland</SelectItem>
        <SelectItem value="DE">Germany</SelectItem>
        {/* ... more countries */}
      </Select>
    </FormField>
  </div>
  
  <Button type="submit">Continue to Shipping</Button>
</Form>
```

**Address Autocomplete:**
```tsx
const fetchAddressSuggestions = useCallback(
  debounce(async (query: string) => {
    if (query.length < 3) return;
    
    setIsLoadingSuggestions(true);
    
    const { data, error } = await supabase.functions.invoke('places-autocomplete', {
      body: {
        query,
        country: form.watch('country') || 'PL'
      }
    });
    
    if (!error && data?.suggestions) {
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    }
    
    setIsLoadingSuggestions(false);
  }, 300),
  []
);
```

---

#### Step 2: Shipping Options (`ShippingOptions.tsx`)

**Fetch Shipping Prices:**
```tsx
useEffect(() => {
  const fetchShipping = async () => {
    setIsLoading(true);
    
    // Calculate total parcel weight from cart items
    const totalWeight = cartItems.reduce((sum, item) => {
      return sum + (item.product.weight_kg || 0.3) * item.quantity;
    }, 0);
    
    // Determine parcel dimensions based on products
    const dimensions = calculateParcelDimensions(cartItems);
    
    const { data, error } = await supabase.functions.invoke('calculate-shipping-price', {
      body: {
        parcel: {
          weight: totalWeight,
          dimensions
        },
        receiver: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          address: shippingAddress
        }
      }
    });
    
    if (!error && data?.services) {
      setShippingOptions(data.services);
    }
    
    setIsLoading(false);
  };
  
  fetchShipping();
}, [cartItems, shippingAddress]);
```

**Display Options:**
```tsx
<RadioGroup value={selectedServiceId} onValueChange={setSelectedServiceId}>
  {shippingOptions.map(option => (
    <div key={option.serviceId} className="flex items-center space-x-4 p-4 border rounded-lg">
      <RadioGroupItem value={option.serviceId.toString()} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <img src={`/carriers/${option.carrier}.svg`} alt={option.carrier} className="h-6" />
          <span className="font-semibold">{option.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Estimated delivery: {option.estimatedDeliveryDays} days
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">{option.price.toFixed(2)} PLN</p>
      </div>
    </div>
  ))}
</RadioGroup>
```

---

#### Step 3: Review & Payment (`OrderReview.tsx`)

**Order Summary:**
```tsx
<div className="space-y-6">
  {/* Line Items */}
  <div className="space-y-4">
    {cartItems.map(item => (
      <div key={item.id} className="flex gap-4">
        <img src={item.product.main_image_url} alt={item.product.name_en} className="w-20 h-20 object-cover rounded" />
        <div className="flex-1">
          <h4 className="font-semibold">{item.product.name_en}</h4>
          {item.selectedSize && <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>}
          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
        </div>
        <p className="font-semibold">{(item.product.price_pln * item.quantity).toFixed(2)} PLN</p>
      </div>
    ))}
  </div>
  
  {/* Coupon Input */}
  <div className="flex gap-2">
    <Input
      placeholder="Coupon code"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
    />
    <Button onClick={handleApplyCoupon} variant="outline">Apply</Button>
  </div>
  
  {appliedCoupons.length > 0 && (
    <div className="space-y-2">
      {appliedCoupons.map(coupon => (
        <div key={coupon.code} className="flex justify-between items-center p-2 bg-accent/10 rounded">
          <span className="text-sm font-medium">{coupon.code}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600">
              -{coupon.discount_type === 'percent' 
                ? `${coupon.percent_off}%` 
                : `${coupon.amount_off_pln} PLN`}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveCoupon(coupon.code)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
  
  {/* Totals */}
  <div className="space-y-2 pt-4 border-t">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span>{subtotal.toFixed(2)} PLN</span>
    </div>
    <div className="flex justify-between">
      <span>Shipping</span>
      <span>{shippingCost.toFixed(2)} PLN</span>
    </div>
    {discountAmount > 0 && (
      <div className="flex justify-between text-green-600">
        <span>Discount</span>
        <span>-{discountAmount.toFixed(2)} PLN</span>
      </div>
    )}
    <div className="flex justify-between text-xl font-bold pt-2 border-t">
      <span>Total</span>
      <span>{total.toFixed(2)} PLN</span>
    </div>
  </div>
  
  {/* Terms Checkbox */}
  <div className="flex items-start gap-2">
    <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
    <label htmlFor="terms" className="text-sm">
      I agree to the <Link to="/terms-of-sale" className="underline">Terms of Sale</Link> and <Link to="/privacy-policy" className="underline">Privacy Policy</Link>
    </label>
  </div>
  
  {/* Checkout Button */}
  <Button
    size="lg"
    className="w-full"
    disabled={!acceptedTerms || isProcessing}
    onClick={handleCheckout}
  >
    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
  </Button>
</div>
```

**Checkout Handler:**
```tsx
const handleCheckout = async () => {
  setIsProcessing(true);
  
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        cartItems,
        shippingAddress,
        shippingServiceId: selectedShipping.serviceId,
        shippingCost: selectedShipping.price,
        carrierName: selectedShipping.carrier,
        couponCodes: appliedCoupons.map(c => c.code),
        parcelWeight: calculateTotalWeight(cartItems),
        parcelDimensions: calculateParcelDimensions(cartItems)
      }
    });
    
    if (error) throw error;
    
    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Failed to create checkout session');
    setIsProcessing(false);
  }
};
```

---

### 7.3 Payment Success Page (`/src/pages/PaymentSuccess.tsx`)

**Route:** `/payment-success?session_id={CHECKOUT_SESSION_ID}`

**Features:**
- Success animation (confetti or checkmark)
- Order confirmation message
- Order number display
- "View Order" button → `/dashboard` (orders tab)
- Continue shopping button

**Note:** Actual order creation happens in `stripe-webhook`, not on this page. This page just confirms payment was successful.

---

## 8. State Management

### 8.1 Context Providers

#### AuthContext (`/src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}
```

#### CartContext (`/src/contexts/CartContext.tsx`)
```typescript
interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number, options?: VariantOptions) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}
```

#### LanguageContext (`/src/contexts/LanguageContext.tsx`)
```typescript
interface LanguageContextType {
  language: 'en' | 'pl';
  setLanguage: (lang: 'en' | 'pl') => void;
  t: (key: string) => string; // Translation function
}
```

#### CurrencyContext (`/src/contexts/CurrencyContext.tsx`)
```typescript
interface CurrencyContextType {
  currency: 'PLN' | 'EUR';
  setCurrency: (currency: 'PLN' | 'EUR') => void;
  formatPrice: (amountPLN: number, amountEUR: number) => string;
}
```

---

### 8.2 Custom Hooks

#### `useAuth`
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

#### `useCart`
```typescript
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

#### `useWishlist`
```typescript
export function useWishlist() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wishlist_items')
        .select('*, products(*)');
      return data || [];
    },
    enabled: !!user
  });
  
  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      await supabase.from('wishlist_items').insert({
        user_id: user.id,
        product_id: productId
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['wishlist'])
  });
  
  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);
    },
    onSuccess: () => queryClient.invalidateQueries(['wishlist'])
  });
  
  return { items, isLoading, addToWishlist, removeFromWishlist };
}
```

---

## 9. Routing & Navigation

### 9.1 Route Configuration (`/src/App.tsx`)

```tsx
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/product/:slug" element={<ProductDetail />} />
    <Route path="/collections" element={<Collections />} />
    <Route path="/collections/:slug" element={<CollectionDetail />} />
    <Route path="/venus-calculator" element={<VenusCalculator />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    
    {/* Auth Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    
    {/* Checkout Flow */}
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/payment-success" element={<PaymentSuccess />} />
    
    {/* Protected Routes (User) */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    
    {/* Admin Routes */}
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminDashboard />} />
    </Route>
    
    {/* Legal Pages */}
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-sale" element={<TermsOfSale />} />
    <Route path="/shipping-returns" element={<ShippingReturns />} />
    <Route path="/cookie-policy" element={<CookiePolicy />} />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### 9.2 Route Guards

**ProtectedRoute (User Auth):**
```tsx
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
}
```

**AdminRoute:**
```tsx
function AdminRoute() {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}
```

---

## 10. Styling Guidelines

### 10.1 Component Styling Rules

1. **ALWAYS use semantic tokens from `index.css`:**
   ```tsx
   // ✅ CORRECT
   <div className="bg-background text-foreground border-border">
   
   // ❌ WRONG
   <div className="bg-white text-black border-gray-200">
   ```
   
2. **Use design system color variables:**
   ```tsx
   // ✅ CORRECT
   <Button variant="copper">Add to Cart</Button>
   
   // ❌ WRONG
   <Button className="bg-[#AB7757]">Add to Cart</Button>
   ```
   
3. **Responsive design with Tailwind breakpoints:**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
   ```
   
4. **Dark mode support:**
   ```tsx
   // Automatically handled by semantic tokens
   <div className="bg-card text-card-foreground">
     {/* Works in both light and dark mode */}
   </div>
   ```

### 10.2 Animation Guidelines

**Use Framer Motion for complex animations:**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <ProductCard product={product} />
</motion.div>
```

**Use Tailwind transitions for simple hover effects:**
```tsx
<button className="transition-colors hover:bg-accent hover:text-accent-foreground">
  Click me
</button>
```

### 10.3 Accessibility

1. **Always include alt text for images:**
   ```tsx
   <img src={product.image} alt={product.name_en} />
   ```
   
2. **Use semantic HTML:**
   ```tsx
   <nav>, <main>, <aside>, <article>, <section>
   ```
   
3. **Keyboard navigation:**
   ```tsx
   <button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
   ```
   
4. **ARIA labels for icon buttons:**
   ```tsx
   <button aria-label="Add to wishlist">
     <Heart className="h-5 w-5" />
   </button>
   ```

---

## End of Frontend Documentation

This document covers all frontend aspects, UI structure, admin/user dashboards, checkout flow, and styling guidelines for House of Venus. For backend/database/API details, see `BACKEND_TECHNICAL_DOCUMENTATION.md`.
