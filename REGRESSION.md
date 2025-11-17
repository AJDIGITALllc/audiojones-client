# Regression Checklist

Fast sanity checks to run after making changes to the client portal.

## Authentication & Access

- [ ] Login works (email/password)
- [ ] Login redirects to /dashboard after success
- [ ] Logout redirects to login page
- [ ] Protected routes redirect to login when not authenticated

## Core Pages

- [ ] Dashboard loads without console errors
- [ ] Dashboard displays recent bookings correctly
- [ ] "Book a Session" page loads and shows available services
- [ ] Services are grouped by category correctly
- [ ] "My Bookings" page loads and displays bookings
- [ ] "My Files" page loads (if implemented)

## Booking Flow

- [ ] "Book a Session" flow completes without 500s
- [ ] Can select a service and proceed to booking wizard
- [ ] Booking wizard progresses through all steps
- [ ] Can attach files during booking (if enabled)
- [ ] Booking confirmation shows after submission
- [ ] New booking appears in "My Bookings" immediately

## System Health

- [ ] System Status page loads at `/system/status`
- [ ] System Status shows current environment correctly
- [ ] System Status shows Firebase project ID
- [ ] System Status shows current user email and UID
- [ ] System Status shows tenant ID
- [ ] System Status API health check shows "API: healthy"
- [ ] Health API endpoint returns 200 at `/api/health`

## API Routes

- [ ] No 500s from `/api/client/**` routes in Network tab
- [ ] Dashboard API returns booking data
- [ ] Services API returns available services
- [ ] Bookings POST creates new booking successfully
- [ ] Bookings GET returns user's bookings

## Payment Flow (if Whop-enabled)

- [ ] Whop-backed services show "Powered by Whop" badge
- [ ] Price displays correctly for Whop services
- [ ] Booking wizard shows payment step for Whop services
- [ ] Payment redirect works (external Whop checkout)
- [ ] "My Bookings" shows "Awaiting Payment" for pending payments

## File Operations

- [ ] Can upload files during booking creation
- [ ] Uploaded files appear in booking details
- [ ] "My Files" shows all uploaded assets
- [ ] Can download files from "My Files"

## Build & Deploy

- [ ] `npm run validate:env` passes
- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors in critical files

## Browser Console

- [ ] No unhandled promise rejections
- [ ] No React hydration errors
- [ ] No CORS errors when calling Firebase
- [ ] No missing environment variable warnings
- [ ] TenantContext loads user and tenantId correctly
