-- Function to generate unique request ID
CREATE OR REPLACE FUNCTION generate_request_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'CR' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM component_requests WHERE id = new_id) THEN
            RETURN new_id;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Unable to generate unique request ID';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create user
CREATE OR REPLACE FUNCTION get_or_create_user(
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_role VARCHAR(50) DEFAULT 'Requester'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to find existing user
    SELECT id INTO user_id FROM users WHERE email = p_email;
    
    -- If user doesn't exist, create them
    IF user_id IS NULL THEN
        INSERT INTO users (email, name, role)
        VALUES (p_email, p_name, p_role)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create component request with auto-generated ID
CREATE OR REPLACE FUNCTION create_component_request(
    p_request_name VARCHAR(255),
    p_justification TEXT,
    p_requester_name VARCHAR(255),
    p_requester_email VARCHAR(255),
    p_category VARCHAR(100) DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'Medium',
    p_project VARCHAR(255) DEFAULT NULL,
    p_figma_link TEXT DEFAULT NULL,
    p_source VARCHAR(50) DEFAULT 'manual'
)
RETURNS VARCHAR(20) AS $$
DECLARE
    new_request_id VARCHAR(20);
    user_id UUID;
BEGIN
    -- Generate unique request ID
    new_request_id := generate_request_id();
    
    -- Get or create user
    user_id := get_or_create_user(p_requester_email, p_requester_name, 'Requester');
    
    -- Insert the request
    INSERT INTO component_requests (
        id, request_name, justification, requester_id, requester_name, 
        requester_email, category, severity, project, figma_link, source
    ) VALUES (
        new_request_id, p_request_name, p_justification, user_id, p_requester_name,
        p_requester_email, p_category, p_severity, p_project, p_figma_link, p_source
    );
    
    RETURN new_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update request status
CREATE OR REPLACE FUNCTION update_request_status(
    p_request_id VARCHAR(20),
    p_status VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE component_requests 
    SET status = p_status, updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'Pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'In Progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'Completed'),
        'cancelled', COUNT(*) FILTER (WHERE status = 'Cancelled')
    ) INTO result
    FROM component_requests;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
