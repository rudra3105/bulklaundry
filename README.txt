BULK LAUNDRY - static website (HTML, CSS, JS)

CLEAN URLS
Every page is a folder with an index.html (e.g. /pricing/index.html), so it is served at /pricing/ with no ".html".
Upload the contents of this folder to your web root. Works as-is on Apache (.htaccess included), Netlify,
Cloudflare Pages, Vercel and most static hosts. Preview locally with:  python3 -m http.server  (do not open files with file://)

THINGS TO CONFIRM / EDIT
- Booking link: every "Book Pickup" button goes to https://tophatcleaner.smrtapp.com/custx/login
- assets/js/main.js (top): phone, email (info@bulklaundry.com is a placeholder), contact form endpoint
- assets/js/reviews.js: paste real customer reviews here; they appear on Home, About and /reviews/
- Colors: navy #00142d, blue #2e7de1, pink #ff3eb3 (from the logo); edit the :root variables at the top of assets/css/style.css
- Prices, store addresses and hours are taken from the reference site - confirm for Bulk Laundry
