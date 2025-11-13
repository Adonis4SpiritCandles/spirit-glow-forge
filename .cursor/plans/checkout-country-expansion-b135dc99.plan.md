<!-- b135dc99-e66b-469d-ba51-62aad789d608 c1548eab-af51-4801-b526-38595c321fd6 -->
# Checkout Country Selection & Field Validation Enhancement

## Changes Overview

This plan modifies the shipping address form in checkout to:

1. Expand country selection from 6 to ~30 EU/EEA countries
2. Reorder fields: Country selector moved before Street Address input
3. Add character counters and validation for Furgonetka API limits

## Implementation Details

### 1. Expand Country List (EU/EEA ~30 Countries)

**File:** `src/components/ShippingAddressForm.tsx`

Replace the current `countries` array (lines 122-129) with all EU/EEA countries:

```typescript
const countries = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
];
```

### 2. Reorder Form Fields - Country Before Street Address

**File:** `src/components/ShippingAddressForm.tsx`

Move the Country selector block (currently lines 243-257) to appear AFTER Full Name and BEFORE Street Address.

**New field order:**

1. Full Name
2. **Country** (moved here)
3. Street Address (with autocomplete)
4. Street Number + Apartment Number
5. City + Postal Code
6. Email
7. Phone

### 3. Add Character Counters with Furgonetka Limits

**File:** `src/components/ShippingAddressForm.tsx`

Add state for field length limits:

```typescript
const FURGONETKA_LIMITS = {
  name: 35,
  street: 35,
  city: 35,
  postalCode: 10,
  phone: 20,
  email: 100,
};
```

For each field with a limit, add:

- `maxLength` attribute (soft limit - allows typing but shows warning)
- Character counter below input: `{value.length}/{limit}`
- Visual warning when approaching/exceeding limit (yellow at 90%, red at 100%)
- Validation error on submit if any field exceeds limit

**Example for Full Name field (lines 138-162):**

```tsx
<div className="space-y-2">
  <Label htmlFor="name">
    {t('fullName') || 'Full Name'}
    <span className="text-xs text-muted-foreground ml-2">
      ({address.name.length}/{FURGONETKA_LIMITS.name})
    </span>
  </Label>
  <Input
    id="name"
    required
    value={address.name}
    onChange={(e) => {
      const value = e.target.value;
      const cleanedValue = value.replace(/[0-9]/g, '');
      setAddress({ ...address, name: cleanedValue });
    }}
    className={address.name.length > FURGONETKA_LIMITS.name ? 'border-red-500' : 
               address.name.length > FURGONETKA_LIMITS.name * 0.9 ? 'border-yellow-500' : ''}
    placeholder="John Doe"
  />
  {address.name.length > FURGONETKA_LIMITS.name && (
    <p className="text-xs text-red-500">
      {t('fieldTooLong') || 'This field is too long. Maximum 35 characters.'}
    </p>
  )}
</div>
```

Apply similar pattern to:

- Street Address (combined field, max 35 chars)
- City (max 35 chars)
- Postal Code (max 10 chars)
- Phone (combined prefix + number, max 20 chars)
- Email (max 100 chars)

### 4. Add Submit Validation

**File:** `src/components/ShippingAddressForm.tsx`

In `handleSubmit` function (line 92), add validation before calling `onSubmit`:

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Build full street first
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const baseStreet = address.street.trim();
  const num = address.streetNumber.trim();
  const apt = address.apartmentNumber.trim();
  const hasNumInStreet = num ? new RegExp(`\\b${escapeRegExp(num)}\\b`).test(baseStreet) : false;
  let fullStreet = hasNumInStreet || !num ? baseStreet : `${baseStreet} ${num}`;
  if (apt) {
    fullStreet = /\d$/.test(fullStreet) ? `${fullStreet}/${apt}` : `${fullStreet} ${apt}`;
  }
  
  const normalizedPrefix = phonePrefix.trim().startsWith('+')
    ? phonePrefix.trim()
    : (phonePrefix.trim() ? `+${phonePrefix.trim()}` : '');
  const combinedPhone = [normalizedPrefix, phoneNumber.trim()].filter(Boolean).join(' ');
  
  // Validate Furgonetka limits
  const errors = [];
  if (address.name.length > FURGONETKA_LIMITS.name) {
    errors.push(`Name: max ${FURGONETKA_LIMITS.name} characters`);
  }
  if (fullStreet.length > FURGONETKA_LIMITS.street) {
    errors.push(`Street: max ${FURGONETKA_LIMITS.street} characters`);
  }
  if (address.city.length > FURGONETKA_LIMITS.city) {
    errors.push(`City: max ${FURGONETKA_LIMITS.city} characters`);
  }
  if (address.postalCode.length > FURGONETKA_LIMITS.postalCode) {
    errors.push(`Postal Code: max ${FURGONETKA_LIMITS.postalCode} characters`);
  }
  if (combinedPhone.length > FURGONETKA_LIMITS.phone) {
    errors.push(`Phone: max ${FURGONETKA_LIMITS.phone} characters`);
  }
  if (address.email.length > FURGONETKA_LIMITS.email) {
    errors.push(`Email: max ${FURGONETKA_LIMITS.email} characters`);
  }
  
  if (errors.length > 0) {
    toast({
      title: t('validationError') || 'Validation Error',
      description: errors.join(', '),
      variant: 'destructive'
    });
    return;
  }
  
  onSubmit({
    ...address,
    street: fullStreet,
    phone: combinedPhone,
  });
};
```

## Files Modified

- `src/components/ShippingAddressForm.tsx` (main changes)

## Testing Checklist

- [ ] Country dropdown shows all 30+ EU/EEA countries
- [ ] Country selector appears before Street Address field
- [ ] Address autocomplete works for all selected countries
- [ ] Character counters display correctly for all fields
- [ ] Yellow border appears at 90% of limit
- [ ] Red border and error message appear when exceeding limit
- [ ] Form submit blocked if any field exceeds Furgonetka limits
- [ ] Toast error shows which fields are too long
- [ ] Mobile/Tablet/Desktop responsive (form layout intact)
- [ ] EN/PL translations work (test both languages)

## Notes

- Address autocomplete (`places-autocomplete` Edge Function) already supports dynamic country selection via `country: address.country` parameter
- Furgonetka limits are enforced to prevent API errors during shipment creation
- Character counters provide real-time feedback to users
- Validation is "soft" - users can type beyond limit to see content, but cannot submit

### To-dos

- [ ] Replace country list with all EU/EEA countries (~30) in ShippingAddressForm.tsx
- [ ] Move Country selector field before Street Address in form layout
- [ ] Add character counters and visual warnings (yellow/red borders) for all fields with Furgonetka limits
- [ ] Add submit validation to block form if any field exceeds Furgonetka limits