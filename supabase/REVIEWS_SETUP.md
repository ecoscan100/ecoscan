# EcoScan reviews setup

1. For a fresh project, run the complete `supabase/setup.sql` in the Supabase **SQL Editor**. It includes the reviews table and permissions as well as the other EcoScan tables.
2. The script adds `ecoscan_reviews` to Supabase Realtime. If the SQL reports that the `supabase_realtime` publication cannot be altered, enable Realtime for `public.ecoscan_reviews` in the Supabase Database Replication settings, then rerun the script.
3. Publish the site. Visitors can post and read reviews immediately. The Reviews page receives live insert and delete events; deleting a row from the Supabase Table Editor removes it from the page for connected visitors without a manual refresh.

Row-level security allows public reads and inserts. It does not grant delete permission to public site visitors; manage review deletion in Supabase Table Editor as the project owner.
