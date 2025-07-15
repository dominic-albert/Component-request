-- Function to create or get user
CREATE OR REPLACE FUNCTION create_or_get_user(
    p_email VARCHAR(255),
    p_name VARCHAR(255) DEFAULT NULL,
    p_role VARCHAR(50) DEFAULT 'Requester'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id FROM users WHERE email = p_email;
    
    -- If user doesn't exist, create one
    IF user_id IS NULL THEN
        INSERT INTO users (email, name, role)
        VALUES (p_email, COALESCE(p_name, split_part(p_email, '@', 1)), p_role)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$;

-- Function to generate next request ID
CREATE OR REPLACE FUNCTION generate_next_request_id()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    next_id INTEGER;
    formatted_id VARCHAR(20);
BEGIN
    -- Get the highest existing ID number
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(id FROM 3) AS INTEGER)), 
        0
    ) + 1 INTO next_id
    FROM component_requests 
    WHERE id ~ '^CR[0-9]+$';
    
    -- Format as CR0001, CR0002, etc.
    formatted_id := 'CR' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN formatted_id;
END;
$$;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash VARCHAR(64))
RETURNS TABLE(
    user_id UUID,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    key_id UUID,
    key_name VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update last_used_at and return user info
    UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = p_key_hash AND is_active = true;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        ak.id,
        ak.name
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = p_key_hash 
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
END;
$$;

-- Function to clean up expired API keys
CREATE OR REPLACE FUNCTION cleanup_expired_api_keys()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM api_keys 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS TABLE(
    total_requests BIGINT,
    pending_requests BIGINT,
    in_progress_requests BIGINT,
    completed_requests BIGINT,
    denied_requests BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_requests,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_requests,
        COUNT(*) FILTER (WHERE status = 'Denied') as denied_requests
    FROM component_requests;
END;
$$;
