# Operations Manual

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- `.env.local` file with required environment variables (see `.env.schema.json`)

### Setup Commands

```bash
# Install dependencies
npm install

# Validate environment variables
npm run validate:env

# Start development server (http://localhost:3000)
npm run dev

# Run type checking
npm run lint
```

### Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_APP_ENV=development
```

**Required variables** are validated against `.env.schema.json` during build.

## Deployment

### Vercel Deployment

The client portal is deployed to Vercel and automatically builds on push to the main branch.

**Build Process**:
1. Vercel detects push to `main` branch
2. Runs `npm run build` which includes:
   - Environment validation (`npm run validate:env`)
   - TypeScript compilation
   - Next.js production build with Turbopack
3. Deploys to production URL

**Environment Variables**:
- Set in Vercel dashboard under **Settings → Environment Variables**
- Same keys as `.env.local` (see `.env.schema.json`)
- Environment variables are **not** committed to the repository

**Build Command**: `npm run build`  
**Output Directory**: `.next`  
**Install Command**: `npm install`

## Environments

### Local Development

- **URL**: http://localhost:3000
- **Firebase**: Development project (or shared staging)
- **Purpose**: Feature development and testing
- **User Access**: Test accounts created in Firebase Console

### Vercel Preview

- **URL**: Auto-generated per PR (e.g., `*.vercel.app`)
- **Firebase**: Same as production or dedicated preview project
- **Purpose**: Review deployments for pull requests
- **Data**: Shares production database (use caution with test data)

### Vercel Production

- **URL**: Custom domain (e.g., client.audiojones.com or portal.audiojones.com)
- **Firebase**: Production project
- **Purpose**: Live client portal for Audio Jones customers
- **Data**: Real production bookings and assets

**Note**: Currently all environments share the same Firebase project. Consider separating development/staging/production projects for better isolation.

## Routine Checks

### Before Shipping (Pre-Deployment Checklist)

Reference [REGRESSION.md](./REGRESSION.md) for a full sanity checklist. Quick checks:

- [ ] `npm run validate:env` passes locally
- [ ] `npm run build` completes without errors
- [ ] Login/logout works
- [ ] System Status page shows "API: healthy"
- [ ] No console errors on dashboard or key pages
- [ ] Booking creation flow completes successfully
- [ ] New booking appears in "My Bookings"

### Post-Deployment Verification

1. Visit production URL
2. Log in with a client test account
3. Navigate to **System Status** page (`/system/status`)
4. Verify:
   - Environment shows "production"
   - Firebase project ID is correct
   - API health check returns 200
   - User email, UID, and tenant ID display correctly
5. Spot-check critical flows:
   - Dashboard loads with user's bookings
   - "Book a Session" shows available services
   - Booking creation completes without errors
   - "My Bookings" displays the new booking

### Monitoring & Health

- **Health Endpoint**: `GET /api/health`
  - Returns 200 with `{ status: "ok", timestamp, env, project }`
  - Use for uptime monitoring (Vercel, UptimeRobot, etc.)
- **System Status Page**: `/system/status` (authenticated, client-only)
  - Internal debug panel showing environment, user, tenant, and API health
  - Check here first if issues are reported

### Logs & Debugging

- **Vercel Logs**: View in Vercel dashboard under **Deployments → [Build] → Function Logs**
- **Browser Console**: Check for client-side errors in dev tools
- **Firestore Console**: Inspect user data, bookings, and assets directly
- **TenantContext**: Logs warnings if user document not found

## Common Tasks

### Adding a New Service Category

1. Update `ServiceCategory` type in `src/lib/types/firestore.ts`
2. Add new category option to service discovery page
3. Update category filtering logic in `/api/client/services`
4. Test locally and add to REGRESSION.md

### Updating the Booking Wizard

1. Locate `src/components/BookingWizard.tsx`
2. Add new step to `WizardStep` type
3. Implement step component (e.g., `StepCustom`)
4. Update step navigation logic in wizard footer
5. Adjust `handleSubmit` to include new data fields
6. Test full booking flow end-to-end

### Configuring Whop for a Service

**Note**: Whop configuration is managed in the **admin portal**, not client portal.

1. Admin configures service with `billingProvider: "whop"`
2. Admin sets `whop.productId` and enables `whop.syncEnabled`
3. Admin runs `npm run sync:whop` (in admin repo) to fetch pricing
4. Client portal automatically detects Whop config and adjusts booking flow
5. Verify "Powered by Whop" badge appears on service card
6. Test payment redirect during booking creation

### Adding a New API Route

1. Create file: `src/app/api/client/[resource]/route.ts`
2. Import tenant context utilities if needed
3. Implement handler with proper tenant/user filtering:
   ```ts
   // Example: filter by userId and tenantId
   const q = query(
     collection(db, 'bookings'),
     where('userId', '==', currentUserId),
     where('tenantId', '==', currentTenantId)
   );
   ```
4. Test locally and add to REGRESSION.md

### Updating Environment Variables

1. Update `.env.schema.json` if adding new required variable
2. Add variable to `.env.local` for local dev
3. Update Vercel environment variables in dashboard
4. Redeploy to apply changes

## Troubleshooting

### Build Fails with "Module not found"

- Check import paths use `@/` alias correctly
- Verify file exists at expected location
- Clear `.next` cache: `rm -rf .next && npm run build`

### "User document not found" Warning

- Ensure user document exists in Firestore `users` collection
- Check that user's UID matches Firestore document ID
- Verify user document has required fields: `email`, `role`, `tenantId`
- Create user document manually in Firebase Console if needed

### TenantContext Not Loading

- Check Firebase Auth is initialized in `src/lib/firebase.ts`
- Verify `TenantProvider` wraps the entire app in layout
- Check browser console for Firestore permission errors
- Ensure Firestore security rules allow read access to `users/{uid}`

### Booking Creation Fails

- Check `/api/client/bookings` endpoint in Network tab
- Verify all required fields are present in request body
- Check Firestore security rules allow write to `bookings` collection
- Ensure user has valid `tenantId` in context

### Files Not Uploading

- Verify Firebase Storage is configured and accessible
- Check storage security rules allow authenticated writes
- Ensure `uploadBookingAsset` API route is working
- Check file size limits (default: 10MB in most configs)

### Environment Validation Fails

- Compare `.env.local` against `.env.schema.json`
- Ensure all required variables are set
- Check for typos in variable names or values
- Verify Firebase config values from Firebase Console

### Payment Redirect Not Working

- Check that service has `billingProvider: "whop"` set
- Verify `whop.url` is populated (requires admin sync)
- Check browser console for redirect errors
- Test with a different browser (check popup blockers)
