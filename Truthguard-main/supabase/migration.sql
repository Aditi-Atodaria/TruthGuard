-- =============================================
-- TruthGuard Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create custom enum type for verdicts
CREATE TYPE verdict_type AS ENUM (
  'true', 
  'false', 
  'misleading', 
  'unverified', 
  'satire', 
  'too_recent'
);

-- Create custom enum type for input types
CREATE TYPE input_type AS ENUM (
  'url', 
  'text', 
  'social'
);

-- =============================================
-- Table: checks
-- Stores all verification results
-- =============================================
CREATE TABLE IF NOT EXISTS checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type input_type NOT NULL DEFAULT 'text',
  raw_input TEXT NOT NULL,
  extracted_claims JSONB DEFAULT '[]'::jsonb,
  verdict verdict_type NOT NULL DEFAULT 'unverified',
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  sources JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checks_user_id ON checks(user_id);
CREATE INDEX IF NOT EXISTS idx_checks_verdict ON checks(verdict);
CREATE INDEX IF NOT EXISTS idx_checks_created_at ON checks(created_at DESC);

-- =============================================
-- Table: cached_claims
-- 24-hour cache for previously verified claims
-- =============================================
CREATE TABLE IF NOT EXISTS cached_claims (
  claim_hash TEXT PRIMARY KEY,
  verdict verdict_type NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  sources JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cache expiry lookups
CREATE INDEX IF NOT EXISTS idx_cached_claims_expires ON cached_claims(expires_at);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_claims ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads on checks (for recent checks display)
CREATE POLICY "Allow public read on checks" ON checks
  FOR SELECT
  USING (true);

-- Allow service role full access on checks
CREATE POLICY "Allow service role insert on checks" ON checks
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access on cached_claims
CREATE POLICY "Allow public read on cached_claims" ON cached_claims
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role upsert on cached_claims" ON cached_claims
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role update on cached_claims" ON cached_claims
  FOR UPDATE
  USING (true);

-- =============================================
-- Cleanup function: auto-delete expired cache
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cached_claims WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run manually or via pg_cron if available)
-- SELECT cron.schedule('cleanup-cache', '0 */6 * * *', 'SELECT cleanup_expired_cache()');
