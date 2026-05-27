/*
  # Create profiles and saved_meals tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `display_name` (text, default '')
      - `created_at` (timestamptz, default now())
    - `saved_meals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null, references profiles)
      - `meal_name` (text, default '')
      - `selection` (jsonb, not null)
      - `calories` (integer, default 0)
      - `protein` (integer, default 0)
      - `carbs` (integer, default 0)
      - `fat` (integer, default 0)
      - `prep_time` (integer, default 0)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - profiles: users can read/update only their own profile, inserted on signup via trigger
    - saved_meals: users can CRUD only their own meals

  3. Important Notes
    - A trigger automatically creates a profile row when a new user signs up
    - Email confirmation is disabled by default per Supabase auth requirements
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS saved_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_name text DEFAULT '',
  selection jsonb NOT NULL DEFAULT '{}',
  calories integer DEFAULT 0,
  protein integer DEFAULT 0,
  carbs integer DEFAULT 0,
  fat integer DEFAULT 0,
  prep_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own meals"
  ON saved_meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON saved_meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON saved_meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON saved_meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_meals_user_id ON saved_meals(user_id);
