# ShikaDeal Deal Engine — October 2026

## Homepage architecture

The homepage is a curated storefront, not a full catalogue.

- The hero remains at the top.
- Five compact directory cards show current inventory counts: Deals, Shop, Guides, 3D Prints and From the Bench.
- Each section shows only items manually marked **Featured on homepage** in Admin.
- Maximum homepage featured items per section: **4**.
- The layout is responsive: 4 cards on wide screens, 3 on narrower desktop/tablet, 2 on smaller screens, 1 on mobile.
- A `VIEW ALL` link appears only when the section contains more inventory than the homepage is displaying.
- Full inventories live on dedicated pages: `deals.html`, `shop.html`, `guides.html`, `prints.html`, and `bench.html`.

## Deal retention

`data/deals.json` is intentionally kept small.

- Maximum total deal records: **30**.
- Active/current records are retained first.
- Ended records are retained only as recent context, up to the remaining space in the 30-record limit (maximum 5 ended records when there are at least 25 current records).
- Older expired/sold-out records are automatically removed by the Worker during scheduled monitoring or when Deals are saved from Admin.
- This keeps the JSON light and prevents the Deal Desk becoming a historical archive.

## eBay workflow

Admin now supports:

1. Paste an eBay listing URL.
2. Click **FETCH FROM EBAY**.
3. The Worker retrieves the eBay Browse API item data using the server-side credentials.
4. eBay facts are populated into the Deal Editor.
5. Ahmed adds the ShikaDeal editorial fields: summary, why we noticed it, what we checked, the catch, our take, featured status, guide and buying assistance.
6. Save the deal.

The eBay Client Secret is **never stored in the public website or Admin JavaScript**.

## Required Cloudflare Worker variables/secrets

Configure these in the Worker settings:

- `ADMIN_KEY` — existing admin key
- `GITHUB_TOKEN` — existing GitHub token
- `GITHUB_OWNER` — existing GitHub owner
- `GITHUB_REPO` — existing repository name
- `GITHUB_BRANCH` — optional; defaults to `main`
- `EBAY_CLIENT_ID` — eBay Production App ID / Client ID
- `EBAY_CLIENT_SECRET` — eBay Production Cert ID / Client Secret

Do **not** put the eBay Client Secret in GitHub, `admin.js`, HTML, or this README.

## eBay monitoring

The Worker contains a `scheduled()` handler. Configure a Cloudflare Cron Trigger to run it every **30 minutes UTC**.

The Worker does not call eBay for every deal on every run. It checks only eBay deals whose `ebay.nextCheckAt` has arrived.

Suggested check frequency:

- More than 48 hours remaining: every 24 hours
- 24–48 hours remaining: every 6 hours
- 4–24 hours remaining: every 2 hours
- Under 4 hours remaining: every 30 minutes

The website itself can determine that a listing has passed its known end date without making an eBay API call.

Routine Worker checks use the Browse API compact item response. A temporary API failure does **not** mark a deal as sold or expired; the Worker retries later. A confirmed 404/unavailable response marks the eBay deal unavailable/sold-out, while a passed end date marks it expired.

## eBay monitoring data

A monitored deal can contain an `ebay` object similar to:

```json
{
  "itemId": "v1|...",
  "legacyItemId": "307203398896",
  "endDate": "2026-10-05T11:10:00.000Z",
  "availability": "AVAILABLE",
  "quantity": 1,
  "buyingOptions": "AUCTION, BEST_OFFER",
  "priceType": "CURRENT BID",
  "lastChecked": "2026-10-04T...",
  "nextCheckAt": "2026-10-04T..."
}
```

## Important deployment step

The `scheduled()` handler only runs after the Cloudflare Worker has a Cron Trigger configured. Uploading the Worker code alone does not create the schedule.

The first production test should be:

1. Configure `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` in Worker secrets.
2. Deploy the Worker.
3. Configure the 30-minute Cron Trigger.
4. Open ShikaDeal Admin.
5. Add a Deal and paste an eBay URL.
6. Click **FETCH FROM EBAY**.
7. Verify the fields populate.
8. Add the editorial judgement and save.
9. Confirm the deal appears in `data/deals.json` and on the Deal Desk.
