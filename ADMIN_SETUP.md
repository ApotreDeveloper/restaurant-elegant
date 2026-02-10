
# Admin Setup Guide

Follow these steps to configure the backend and create your first admin user.

## 1. Supabase Setup

1. **Create a Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Database Schema**:
   - Go to the **SQL Editor**.
   - Copy the content of `supabase/migrations/001_initial_schema.sql` and run it.
   - This creates all necessary tables (restaurants, menu, orders, etc.) and sets up Row Level Security (RLS).

3. **Seed Data**:
   - Run the content of `supabase/seed.sql` to populate the database with initial data.

4. **Storage Buckets**:
   - The migration script should create buckets: `menu-images`, `gallery-images`, `blog-images`, `restaurant-assets`.
   - Verify in the **Storage** section that these exist and are set to Public.

## 2. Create Admin User

There are two ways to create an admin user.

### Option A: Via Dashboard (Easiest)
1. Go to **Authentication** > **Users**.
2. Click **Add User**.
3. Enter email (e.g., `admin@legourmet.fr`) and a strong password.
4. Click **Create User**.
5. (Optional) By default, the RLS policies in the migration allow any authenticated user to access admin tables. For production, you should restrict this.

### Option B: Via SQL (Advanced)
If you want to enforce strict admin roles:

1. Create a specific admin table:
   ```sql
   CREATE TABLE admin_users (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id uuid REFERENCES auth.users(id) NOT NULL,
     email text NOT NULL
   );
   ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
   ```

2. Insert your user after signing up via Option A:
   ```sql
   INSERT INTO admin_users (user_id, email)
   SELECT id, email FROM auth.users WHERE email = 'admin@legourmet.fr';
   ```

3. Update RLS policies to check this table:
   ```sql
   CREATE POLICY "Admins only" ON menu_items
   FOR ALL USING (
     auth.uid() IN (SELECT user_id FROM admin_users)
   );
   ```

## 3. Realtime Features

To enable live updates on the Dashboard:
1. Go to **Database** > **Replication**.
2. Enable replication for the following tables:
   - `orders`
   - `reservations`
   - `reviews`

## 4. Troubleshooting

- **Images not loading**: Check CORS settings in Supabase Storage or ensure buckets are Public.
- **Login fails**: Check the browser console. If "Invalid login credentials", verify the user exists in Auth.
- **RLS Errors**: If you see "permission denied" in the console network tab, check your RLS policies in the Table Editor.
