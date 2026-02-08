-- Supabase Database Schema for Journeyman Calculator
-- Run this in Supabase SQL Editor after creating your project

-- Create calculations table
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expression TEXT NOT NULL,
  result_inches NUMERIC,
  result_decimal TEXT,
  result_fraction TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own calculations
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own calculations
CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own calculations
CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_calculations_user_timestamp
  ON calculations(user_id, timestamp DESC);

-- Grant permissions (should be automatic but just in case)
GRANT ALL ON calculations TO authenticated;
GRANT ALL ON calculations TO service_role;
