-- Component Request System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Requester', 'Creator', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create component_requests table
CREATE TABLE IF NOT EXISTS component_requests (
  id VARCHAR(20) PRIMARY KEY, -- CR0001, CR0002, etc.
  request_name VARCHAR(255) NOT NULL,
  justification TEXT NOT NULL,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name VARCHAR(255) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Denied')),
  denial_reason TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Form', 'Navigation', 'Display', 'Input', 'Layout')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Urgent')),
  project VARCHAR(255) DEFAULT 'Manual',
  figma_link TEXT,
  figma_file_key VARCHAR(255),
  figma_file_name VARCHAR(255),
  figma_node_id VARCHAR(255),
  image_data TEXT, -- Base64 encoded image
  selection_data JSONB, -- Figma selection data
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'figma-plugin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create request_comments table (for future use)
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id VARCHAR(20) REFERENCES component_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_component_requests_status ON component_requests(status);
CREATE INDEX IF NOT EXISTS idx_component_requests_category ON component_requests(category);
CREATE INDEX IF NOT EXISTS idx_component_requests_severity ON component_requests(severity);
CREATE INDEX IF NOT EXISTS idx_component_requests_created_at ON component_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_component_requests_requester_id ON component_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON request_comments(request_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_component_requests_updated_at BEFORE UPDATE ON component_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
