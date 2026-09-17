# Kruti Dev 010 font setup (administrator step)

TypeGuru Pro's legacy Hindi mode renders text using the Kruti Dev 010 font.
This is a licensed, non-Unicode font - it is NOT bundled with this project,
and it is never downloaded automatically.

To enable the legacy Kruti Dev typing mode:

1. Obtain a legally licensed Kruti Dev 010 font file (TTF or WOFF2) from
   its rightful distributor/license holder.
2. Convert to WOFF2 if needed (e.g. with `npx woff2-cli` or an online
   converter you trust).
3. Place the file here as:
   `public/fonts/krutidev010.woff2`
4. Rebuild the app. The `@font-face` rule in `src/index.css` already
   points at this exact path.

Until this file is present, the app shows a setup notice instead of
silently rendering Kruti Dev text in the wrong font.
