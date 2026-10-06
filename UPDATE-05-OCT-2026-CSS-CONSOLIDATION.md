# ShikaDeal — 5 Oct 2026 CSS & Public UI Consolidation

Built from:
**ShikaDeal-5-Oct-2026-UI-Admin-Update.zip**

This update consolidates the public site's styling while preserving the Deal Engine/Worker and Admin area.

## Changes

### 1. Central public CSS
- Added `css/style.css`.
- All public pages now load this single stylesheet.
- The homepage's visual system is the base for the shared public style.
- Removed public inline `<style>` blocks.

### 2. Standard navigation
Public navigation is now:
**Deals | Shop | Guides | Prints | Bench**

- Removed Home from the navigation menu.
- The ShikaDeal logo links to `index.html` and acts as the Home button.
- Logo sizing, padding, navigation typography and spacing are standardized.

### 3. Standard public image sizing
- Public listing/card images use the 3D-print image height as the common baseline.
- Deal, Shop, Guide, Print and Bench listing images are standardized.
- Admin image styling was not changed.

### 4. Individual deal pages
- Standardized deal-detail image size and cropping.
- Reduced and standardized deal title sizing.
- Standardized detail typography, spacing and hierarchy so different deals use the same visual template.

### 5. From the Bench article page
- Removed the old dark article theme.
- Article pages now use the same light ShikaDeal visual system.
- Standardized article typography, image sizing, buttons and spacing.

### 6. Redundancy cleanup
- Removed duplicated public page CSS.
- Kept page-specific rules only where they are genuinely required for a page's content structure.
- Admin remains on its separate stylesheet.

## Preserved

- `Cloudflare_worker_5_oct_2026.js` was not modified.
- Admin HTML/CSS/JS was not modified.
- All JSON data files were preserved unchanged.
- Existing public content and JavaScript functionality were preserved.
