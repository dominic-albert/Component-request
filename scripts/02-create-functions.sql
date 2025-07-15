-- Function to generate next request ID
CREATE OR REPLACE FUNCTION generate_next_request_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    formatted_id TEXT;
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
$$ LANGUAGE plpgsql;

-- Function to create or get user
CREATE OR REPLACE FUNCTION create_or_get_user(
    p_email TEXT,
    p_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'Requester'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    final_name TEXT;
BEGIN
    -- Set default name if not provided
    final_name := COALESCE(p_name, SPLIT_PART(p_email, '@', 1));
    
    -- Try to get existing user
    SELECT id INTO user_id
    FROM users
    WHERE email = p_email;
    
    -- If user doesn't exist, create them
    IF user_id IS NULL THEN
        INSERT INTO users (email, name, role)
        VALUES (p_email, final_name, p_role)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.role
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = p_key_hash 
    AND ak.is_active = TRUE
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
    
    -- Update last_used_at
    UPDATE api_keys 
    SET last_used_at = NOW()
    WHERE key_hash = p_key_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS TABLE(
    total BIGINT,
    pending BIGINT,
    in_progress BIGINT,
    completed BIGINT,
    cancelled BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending,
        COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed,
        COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled
    FROM component_requests;
END;
$$ LANGUAGE plpgsql;
