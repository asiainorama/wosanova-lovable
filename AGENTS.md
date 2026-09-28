# Architecture decisions

- Keep the store-style catalog presentation isolated in `src/components/catalog`; shared app cards serve other pages and should not change when the catalog layout changes.
- Select featured apps from the existing `created_at` field with a stable alphabetical tie-breaker; the catalog needs no new database column or editorial workflow.