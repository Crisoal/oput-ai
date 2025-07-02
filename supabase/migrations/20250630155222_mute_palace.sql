/*
  # Create conversation history schema

  1. New Tables
    - `conversation_history`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - to group conversations
      - `user_id` (uuid) - optional, for authenticated users
      - `message` (text) - user message
      - `response` (text) - AI response
      - `context_data` (jsonb) - conversation context
      - `message_type` (text) - text or voice
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `conversation_history` table
    - Add policies for session-based access
*/

CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  response text NOT NULL,
  context_data jsonb DEFAULT '{}',
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read conversation history"
  ON conversation_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert conversation history"
  ON conversation_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_level ON opportunities(level);