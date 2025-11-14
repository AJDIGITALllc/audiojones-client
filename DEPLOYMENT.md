# Audio Jones – Vercel Deployment Guide

This repo is a **Next.js (App Router)** project deployed on **Vercel**.

- Framework: Next.js (App Router, `src/app`)
- Hosting: Vercel
- Deployment: from `main` branch
- Environments: Local dev → Vercel preview (per commit) → Production

---

## 1. Local development

```bash
# install deps (first time)
npm install

# run dev server
npm run dev

# visit:
# http://localhost:3000/
```

You should see the portal shell loading without errors.

Before pushing to `main`, always verify a production build locally:

```bash
npm run build
npm run start
# then visit http://localhost:3000/
```

If `npm run build` fails locally, Vercel will fail too.

---

## 2. Vercel project mapping

This repo is deployed as the Vercel project:

* **Project name:** `audiojones-client`
* **Git branch → Environment:**

  * `main` → **Production**

Custom domains:

* **Client portal**

  * Vercel URL: `https://audiojones-client-xxxxx.vercel.app`
  * Custom domain: `https://client.audiojones.com`

Check in Vercel:

* *Settings → Domains*
* You should see a ✅ **Valid Configuration** badge next to the custom domain.

---

## 3. `vercel.json` – force correct Next.js detection

This repo includes a `vercel.json` at the project root.

**Purpose:**

* Ensure Vercel treats this as a **Next.js** project
* Ensure `next build` is executed on each deployment
* Avoid "static 404" deployments where no routes are generated

> Do **not** delete or rename `vercel.json` without updating this guide.

If Vercel ever mis-detects the framework (or you see a 404 from Vercel with a big white page and an error ID), check:

1. `vercel.json` exists at repo root
2. Vercel project settings show **Framework preset: Next.js**
3. Build logs show `npm run build` and `next build`

---

## 4. Standard deployment flow

**From local → production:**

```bash
# 1. Make changes
# 2. Ensure tests / build pass
npm run build

# 3. Commit and push
git add .
git commit -m "feat: <description>"
git push origin main
```

Vercel then:

1. Receives the push on `main`
2. Runs `npm install`, `npm run build`
3. Promotes the new deployment to **Production** if the build succeeds

You can monitor progress on:

* Vercel → Project → **Deployments** → latest entry → **Build Logs**

---

## 5. Troubleshooting 404s (the important part)

### Case A: 404 from Vercel (white page, error code, error ID)

This is Vercel's own 404 – your deployment either:

* Has no route for `/`, or
* Failed in some way that prevented Next.js from serving your app

**Fix checklist:**

1. **Check build logs**

   * Go to the project in Vercel
   * Open the latest deployment
   * Inspect **Build Logs**

   You should see:

   * `Running "npm run build"`
   * `next build`
   * `Compiled successfully` / `Creating an optimized production build`

   If there is **no `next build`**, fix `vercel.json` / framework preset.

2. **Confirm `src/app/page.tsx` exists**

   This is an **App Router** project. We expect:

   ```text
   /src
     /app
       page.tsx   # must exist, default export
   ```

   There should be **no `pages/` directory**. If both `app` and `pages` exist, Next.js will error or route unpredictably.

3. **Test locally**

   ```bash
   npm run build
   npm run start
   # visit http://localhost:3000/
   ```

   If local `/` works but Vercel does not:

   * You are probably looking at an older deployment URL
   * Always click **"Visit"** from the latest deployment card in Vercel

---

### Case B: DNS / domain problems

If the raw Vercel URL works but `client.audiojones.com` does not:

1. In Vercel → *Settings → Domains*:

   * Domain should show **Valid Configuration**
   * It must be attached to the correct project

2. In the DNS provider:

   * Root domain (e.g. `audiojones.com`) typically has `ALIAS` or `A` pointed at Vercel
   * Subdomains (`admin`, `client`) typically point as `CNAME` to `cname.vercel-dns.com` **or** to the specific values Vercel gave you for verification

3. DNS changes can take time to propagate; don't debug app code until DNS is confirmed.

---

## 6. Quick verification checklist

When something feels off, run this list:

* [ ] `npm run build` passes locally
* [ ] `src/app/page.tsx` exists and exports a default component
* [ ] No `pages/` directory (App Router only)
* [ ] `vercel.json` exists at repo root
* [ ] Vercel project preset is **Next.js**
* [ ] Latest deployment build logs show `next build`
* [ ] Raw `*.vercel.app` URL for the latest deployment works
* [ ] Custom domain shows the same content as the Vercel URL
