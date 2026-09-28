# Architecture decisions

- Keep the store-style catalog presentation isolated in `src/components/catalog`; shared app cards serve other pages and should not change when the catalog layout changes.
- Select featured apps randomly once per catalog visit from the loaded apps; this keeps them varied on entry without changing during browsing or requiring a database column.
- Keep catalog card colors in semantic theme tokens and classify readable logo colors into that palette; external logos may not permit pixel reads, so use a subtle logo image wash over the themed card surface, with a token fallback for absent logos.