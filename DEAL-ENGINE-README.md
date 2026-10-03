# ShikaDeal Deal Engine — built on 1 October 2026 site

This package uses the uploaded **1 October 2026** ShikaDeal project as its source of truth. Existing Products, Blog, Guides and 3D Prints functionality was preserved.

## Added
- `data/deals.json` — Deal database
- `deals.html` — public Deal Desk
- `deal.html` — individual deal page (`deal.html?slug=...`)
- Admin Deals CRUD/editor
- Deal image upload to `images/deals/`
- Cloudflare Worker `/api/deals`
- Cloudflare Worker `/api/upload-deal-image`
- Homepage Deal Desk now reads from `data/deals.json`

## Deal workflow
Find → Check → Get

The first version is intentionally manual. You publish verified finds through Admin. Automated eBay discovery can be added after the data model and publishing workflow have been tested with real deals.

## Deployment
1. Deploy the included Cloudflare Worker code, preserving the existing environment variables/secrets.
2. Push the site files to GitHub Pages.
3. Open `/admin/`, enter your Admin Key when saving a Deal.
4. Create a test deal.
5. Confirm `data/deals.json` changes in GitHub.
6. Confirm it appears on `deals.html` and opens on `deal.html?slug=...`.

`data/deals.json` is intentionally empty in this package; no fake deal has been added.
