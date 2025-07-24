-- These functions are optional and can be added later if needed
-- The application now works without them using direct table operations

-- Function to create or get user (optional)
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

-- Function to generate next request ID (optional)
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
