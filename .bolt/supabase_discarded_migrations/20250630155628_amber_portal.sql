/*
  # Create conversation history table

  1. New Tables
    - `conversation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `message` (text, user input)
      - `response` (text, AI response)
      - `context_data` (jsonb, conversation context)
      - `message_type` (text, type of message)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `conversation_history` table
    - Add policies for users to manage their own conversations

  3. Performance
    - Add indexes for better query performance on opportunities table
*/

CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  response text NOT NULL,
  context_data jsonb DEFAULT '{}',
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint if users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE conversation_history 
    ADD CONSTRAINT conversation_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS policies for conversation history
CREATE POLICY "Users can manage their own conversations"
  ON conversation_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation_history(created_at);

-- Add indexes for opportunities table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
    CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
    CREATE INDEX IF NOT EXISTS idx_opportunities_level ON opportunities(level);
    CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities(country);
    CREATE INDEX IF NOT EXISTS idx_opportunities_field ON opportunities(field);
  END IF;
END $$;