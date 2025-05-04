/*
  # Create favorites table

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key): お気に入りID
      - `user_id` (uuid): ユーザーID
      - `name` (text): アイテム名
      - `reason` (text): お気に入りの理由
      - `features` (text[]): 特徴
      - `image_url` (text): 画像URL
      - `official_url` (text): 公式URL
      - `created_at` (timestamp): 作成日時

  2. Security
    - Enable RLS on `favorites` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  reason text,
  features text[] DEFAULT '{}',
  image_url text,
  official_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のお気に入りのみ参照可能
CREATE POLICY "Users can view own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ユーザーは自分のお気に入りのみ作成可能
CREATE POLICY "Users can create own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のお気に入りのみ更新可能
CREATE POLICY "Users can update own favorites"
  ON favorites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ユーザーは自分のお気に入りのみ削除可能
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);