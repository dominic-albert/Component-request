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
    ) + 1 
    INTO next_id
    FROM component_requests 
    WHERE id ~ '^CR[0-9]+$';
    
    -- Format as CR0001, CR0002, etc.
    formatted_id := 'CR' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN formatted_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or get user by email
CREATE OR REPLACE FUNCTION create_or_get_user(
    user_email TEXT,
    user_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    final_name TEXT;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id
    FROM users
    WHERE email = user_email;
    
    -- If user doesn't exist, create one
    IF user_id IS NULL THEN
        -- Generate name from email if not provided
        IF user_name IS NULL OR user_name = '' THEN
            final_name := INITCAP(
                REPLACE(
                    REPLACE(SPLIT_PART(user_email, '@', 1), '.', ' '),
                    '_', ' '
                )
            );
        ELSE
            final_name := user_name;
        END IF;
        
        INSERT INTO users (email, name, role)
        VALUES (user_email, final_name, 'Requester')
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(api_key_hash TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_name TEXT, user_role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = validate_api_key.api_key_hash
      AND ak.is_active = true
      AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
      
    -- Update last_used_at
    UPDATE api_keys 
    SET last_used_at = NOW()
    WHERE key_hash = validate_api_key.api_key_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS TABLE(
    total_requests BIGINT,
    pending_requests BIGINT,
    in_progress_requests BIGINT,
    completed_requests BIGINT,
    denied_requests BIGINT
) AS $$
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
$$ LANGUAGE plpgsql;
