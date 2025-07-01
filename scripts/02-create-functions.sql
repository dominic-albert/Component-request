-- Utility functions for the Component Request System

-- Function to generate next request ID
CREATE OR REPLACE FUNCTION generate_next_request_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
    next_id VARCHAR(20);
BEGIN
    -- Get the highest existing ID number
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(id FROM 3) AS INTEGER)), 
        0
    ) + 1 INTO next_num
    FROM component_requests 
    WHERE id ~ '^CR[0-9]+$';
    
    -- Format as CR0001, CR0002, etc.
    next_id := 'CR' || LPAD(next_num::TEXT, 4, '0');
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or get user
CREATE OR REPLACE FUNCTION create_or_get_user(
    p_email VARCHAR(255),
    p_name VARCHAR(255) DEFAULT NULL,
    p_role VARCHAR(50) DEFAULT 'Requester'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id FROM users WHERE email = p_email;
    
    -- If user doesn't exist, create them
    IF user_id IS NULL THEN
        INSERT INTO users (email, name, role)
        VALUES (p_email, COALESCE(p_name, SPLIT_PART(p_email, '@', 1)), p_role)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash VARCHAR(255))
RETURNS TABLE(user_id UUID, user_email VARCHAR(255), user_role VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.role
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = p_key_hash
      AND ak.is_active = true
      AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
    
    -- Update last_used_at
    UPDATE api_keys 
    SET last_used_at = NOW() 
    WHERE key_hash = p_key_hash;
END;
$$ LANGUAGE plpgsql;
