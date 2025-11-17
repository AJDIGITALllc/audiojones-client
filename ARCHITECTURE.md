# Architecture Documentation

## Overview

The **Audio Jones Client Portal** is a Next.js-based booking and asset management interface for Audio Jones clients. It provides a streamlined experience for discovering services, creating bookings, managing sessions, and accessing delivered files within a multi-tenant environment.

## Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript
- **Runtime**: Node.js
- **Authentication**: Firebase Authentication (client-side)
- **Database**: Firebase Firestore (NoSQL document database)
- **Styling**: Tailwind CSS with dark theme and custom animations
- **Build Tool**: Turbopack
- **Deployment**: Vercel
- **UI Components**: Custom components with Lucide React icons

## Runtime Architecture

### Authentication & Tenant Flow

```
Firebase Auth → TenantContext → User Document (Firestore)
                      ↓
              tenantId, user data
                      ↓
              Protected Pages → API Routes → Firestore
```

**Pattern**:
1. User signs in via Firebase Authentication
2. `TenantContext` listens to auth state changes
3. On authentication, fetches user document from Firestore
4. Extracts `tenantId` and user data, makes available to entire app
5. Protected pages use `useTenant()` hook to access user/tenant context
6. API routes enforce tenant isolation

### Data Flow

```
UI Components → React State/Hooks → API Routes (/api/client/**) → Firestore
                                         ↓
                                  Tenant Validation
                                         ↓
                                  Return scoped data
```

**Key Patterns**:
- Pages call internal API routes (not Firestore directly)
- API routes filter data by `tenantId` automatically
- Booking wizard manages multi-step form state locally
- File uploads go through API → Firebase Storage

### Tenant Model

- **Client-scoped access**: Users can only see bookings/assets for their assigned `tenantId`
- **Tenant assignment**: User document contains `tenantId` field
- **Service discovery**: Services may be global (`tenantId: null`) or tenant-specific
- **Data isolation**: All queries include tenant filter on client-side API routes

## Important Directories

- **`src/app/`**: Next.js App Router pages and API routes
  - `(auth)/`: Unauthenticated pages (login, reset-password)
  - `(protected)/`: Authenticated client pages (dashboard, book, bookings, assets, system/status)
  - `api/client/`: Client-scoped API endpoints
    - `bookings/`: Create and list bookings
    - `services/`: Discover available services
    - `assets/`: Upload and retrieve files
    - `dashboard/`: Summary stats
  - `api/health/`: Health check endpoint

- **`src/lib/`**: Shared utilities and business logic
  - `firebase.ts`: Firebase client initialization
  - `types/firestore.ts`: TypeScript types matching Firestore schema
  - `types.ts`: Presentation layer types (summaries, API responses)
  - `cn.ts`: Tailwind class name utility

- **`src/components/`**: Reusable React components
  - `BookingWizard.tsx`: Multi-step booking creation flow
  - `ServiceCard.tsx`: Service display component
  - Various UI primitives

- **`src/contexts/`**: React context providers
  - `TenantContext.tsx`: Global auth + tenant state management

- **`scripts/`**: Build and maintenance scripts
  - `validate-env.ts`: Environment variable validation

## Key Features

### Booking Flow

1. **Service Discovery**: Browse services by category on `/book` page
2. **Booking Wizard**: Multi-step modal for creating bookings
   - Details step: Name, service selection, notes
   - Schedule step: Date/time selection (if required)
   - Files step: Upload assets for the booking
   - Review step: Confirm all details
   - Payment step: Redirect to Whop/Stripe (if configured)
   - Scheduling step: Link to external calendar (Cal.com, Calendly)
   - Confirmation step: Success message

3. **Status Tracking**: Bookings progress through statuses (pending, approved, in_progress, completed)

### Payment Integration

- **Whop Support**: Services can be linked to Whop products
- **Payment-aware flow**: Bookings with `billingProvider: "whop"` enter `pending_payment` status
- **External checkout**: Wizard redirects to Whop checkout URL after booking creation

### File Management

- **Upload during booking**: Attach files in booking wizard
- **My Files page**: View all uploaded assets across all bookings
- **Download**: Direct download links for delivered files

## External Integrations

### Firebase (Required)

- **Purpose**: Authentication and Firestore database
- **Environment Variables**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Documentation**: See `.env.schema.json` for full schema

### Whop (Optional)

- **Purpose**: Payment processing for certain services
- **Environment Variables**: Managed in admin portal sync scripts
- **Client Integration**: 
  - Services include `billingProvider` and `whop.productId`
  - Checkout URLs provided by admin sync
  - Client portal displays Whop badges and redirects to checkout

### Scheduling Providers (Optional)

- **Supported**: Cal.com, Calendly, custom
- **Integration**: External links provided per service
- **Flow**: Booking wizard opens scheduling link in new tab after booking creation

## Data Model Summary

### Client-Visible Collections

- **services**: Filterable service catalog
  - Global services (`tenantId: null`) visible to all
  - Tenant-specific services filtered by user's tenantId
  
- **bookings**: User's session bookings
  - Scoped to `userId` and `tenantId`
  - Contains status history, payment info, scheduling links
  
- **assets**: Uploaded files
  - Linked to `bookingId`
  - Scoped to user's bookings

### Key Types

Defined in `src/lib/types/firestore.ts` and `src/lib/types.ts`:
- `User`: uid, email, role, tenantId
- `Service`: id, name, category, pricing, billing config, scheduling config
- `Booking`: id, userId, serviceId, status, scheduledAt, payment fields
- `Asset`: id, bookingId, fileName, storageUrl

## Security Model

- **Authentication**: Required for all protected routes
- **Tenant Isolation**: All API routes filter by user's tenantId
- **User Scope**: Bookings and assets queries limited to current user's UID
- **Client-side SDK**: Uses Firebase client SDK (no admin privileges)
- **Secrets Management**: Environment variables validated at build time
