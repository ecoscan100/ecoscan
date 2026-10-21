# EcoScan Supabase setup

The app is configured to use the new EcoScan Supabase project. Its Project URL and publishable key are set in `result.html`, `dashboard.html`, `map.html`, and `reviews.html`.

For a fresh project, open **SQL Editor**, paste the complete contents of `setup.sql`, and click **Run**. It creates or repairs the tables used by result saving, the community impact map, AI correction submissions, and public reviews. It also configures the row-level security policies the public website needs and refreshes the API schema. It does not delete existing rows.

This creates the database structure, not a copy of data from your friend’s project. Existing scans, map actions, and feedback on the old Supabase account will need a separate export/import if you want to preserve them.

The browser app must use the project's **Project URL** and **publishable (or legacy anon) key**. Never place a `service_role` or secret key in frontend code.
