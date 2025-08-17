-- SQL script to create analytics table in Supabase
-- Run this in your Supabase SQL editor to enable analytics

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  algorithm TEXT,
  expression_length INTEGER,
  success BOOLEAN,
  error_type TEXT,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for analytics)
CREATE POLICY "Enable insert for analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Create policy to restrict reads (optional - adjust based on your needs)
CREATE POLICY "Enable read for analytics" ON analytics_events
  FOR SELECT USING (true);

-- Example queries for analytics:

-- Most popular algorithms
-- SELECT algorithm, COUNT(*) as usage_count 
-- FROM analytics_events 
-- WHERE event_type = 'algorithm_changed' 
-- GROUP BY algorithm 
-- ORDER BY usage_count DESC;

-- Inference success rate by algorithm  
-- SELECT 
--   algorithm,
--   COUNT(*) as total_attempts,
--   SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_attempts,
--   (SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) as success_rate
-- FROM analytics_events 
-- WHERE event_type = 'inference_completed' 
-- GROUP BY algorithm
-- ORDER BY success_rate DESC;

-- Daily active sessions
-- SELECT 
--   DATE(created_at) as date,
--   COUNT(DISTINCT session_id) as unique_sessions
-- FROM analytics_events 
-- GROUP BY DATE(created_at)
-- ORDER BY date DESC;