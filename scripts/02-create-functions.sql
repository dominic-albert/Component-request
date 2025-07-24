-- Function to create or get user
CREATE OR REPLACE FUNCTION create_or_get_user(
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_role VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id FROM users WHERE email = p_email;
    
    -- If user doesn't exist, create new one
    IF user_id IS NULL THEN
        INSERT INTO users (email, name, role)
        VALUES (p_email, p_name, p_role)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next request ID
CREATE OR REPLACE FUNCTION generate_next_request_id()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_id VARCHAR(50);
    counter INTEGER;
BEGIN
    -- Get the current count of requests
    SELECT COUNT(*) + 1 INTO counter FROM component_requests;
    
    -- Generate ID in format REQ-YYYYMMDD-XXXX
    next_id := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM component_requests WHERE id = next_id) LOOP
        counter := counter + 1;
        next_id := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    END LOOP;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update request status
CREATE OR REPLACE FUNCTION update_request_status(
    p_request_id VARCHAR(50),
    p_status VARCHAR(20),
    p_denial_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE component_requests 
    SET 
        status = p_status,
        denial_reason = CASE WHEN p_status = 'Cancelled' THEN p_denial_reason ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash VARCHAR(255))
RETURNS TABLE(user_id UUID, email VARCHAR(255), name VARCHAR(255), role VARCHAR(50)) AS $$
BEGIN
    -- Update last_used_at
    UPDATE api_keys 
    SET last_used_at = NOW() 
    WHERE key_hash = p_key_hash AND is_active = TRUE;
    
    -- Return user info
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.role
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = p_key_hash AND ak.is_active = TRUE;
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
