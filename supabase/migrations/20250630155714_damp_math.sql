/*
  # Fix conversation history table migration

  1. New Tables
    - `conversation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `message` (text, required)
      - `response` (text, required)
      - `context_data` (jsonb, default empty object)
      - `message_type` (text, default 'user', constrained values)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `conversation_history` table
    - Add policy for authenticated users to manage their own conversations

  3. Performance
    - Add indexes for user_id and created_at on conversation_history
    - Add indexes for opportunities table if it exists
*/

-- Create conversation_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  response text NOT NULL,
  context_data jsonb DEFAULT '{}',
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint only if it doesn't exist and users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'conversation_history_user_id_fkey' 
       AND table_name = 'conversation_history'
     ) THEN
    ALTER TABLE conversation_history 
    ADD CONSTRAINT conversation_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create RLS policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversation_history' 
    AND policyname = 'Users can manage their own conversations'
  ) THEN
    CREATE POLICY "Users can manage their own conversations"
      ON conversation_history
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for conversation_history if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'conversation_history' 
    AND indexname = 'idx_conversation_user_id'
  ) THEN
    CREATE INDEX idx_conversation_user_id ON conversation_history(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'conversation_history' 
    AND indexname = 'idx_conversation_created_at'
  ) THEN
    CREATE INDEX idx_conversation_created_at ON conversation_history(created_at);
  END IF;
END $$;

-- Add indexes for opportunities table if it exists and indexes don't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'opportunities' 
      AND indexname = 'idx_opportunities_deadline'
    ) THEN
      CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'opportunities' 
      AND indexname = 'idx_opportunities_type'
    ) THEN
      CREATE INDEX idx_opportunities_type ON opportunities(type);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'opportunities' 
      AND indexname = 'idx_opportunities_level'
    ) THEN
      CREATE INDEX idx_opportunities_level ON opportunities(level);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'opportunities' 
      AND indexname = 'idx_opportunities_country'
    ) THEN
      CREATE INDEX idx_opportunities_country ON opportunities(country);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'opportunities' 
      AND indexname = 'idx_opportunities_field'
    ) THEN
      CREATE INDEX idx_opportunities_field ON opportunities(field);
    END IF;

  END IF;
END $$;