-- Insert sample users
INSERT INTO users (id, email, name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'john.doe@company.com', 'John Doe', 'Requester'),
    ('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@company.com', 'Jane Smith', 'Creator'),
    ('550e8400-e29b-41d4-a716-446655440003', 'admin@company.com', 'Admin User', 'Admin'),
    ('550e8400-e29b-41d4-a716-446655440004', 'designer@company.com', 'Sarah Designer', 'Requester'),
    ('550e8400-e29b-41d4-a716-446655440005', 'developer@company.com', 'Mike Developer', 'Creator')
ON CONFLICT (email) DO NOTHING;

-- Insert sample component requests
INSERT INTO component_requests (
    id, request_name, justification, requester_id, requester_name, requester_email,
    status, category, severity, project, figma_link, source, created_at
) VALUES
    ('CR0001', 'Advanced Data Table', 'Need a sortable, filterable data table with pagination for the admin dashboard. Should support bulk actions and export functionality.', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@company.com', 'Completed', 'Display', 'High', 'Admin Dashboard', 'https://figma.com/file/example1', 'manual', NOW() - INTERVAL '7 days'),
    
    ('CR0002', 'Multi-step Form Wizard', 'Complex onboarding form that needs to be broken into multiple steps with progress indicator and validation.', '550e8400-e29b-41d4-a716-446655440004', 'Sarah Designer', 'designer@company.com', 'In Progress', 'Form', 'Medium', 'User Onboarding', 'https://figma.com/file/example2', 'figma-plugin', NOW() - INTERVAL '3 days'),
    
    ('CR0003', 'Navigation Breadcrumbs', 'Breadcrumb navigation component for deep page hierarchies in the documentation site.', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@company.com', 'Pending', 'Navigation', 'Low', 'Documentation', NULL, 'manual', NOW() - INTERVAL '1 day'),
    
    ('CR0004', 'File Upload Dropzone', 'Drag and drop file upload component with progress bars, file type validation, and preview functionality.', '550e8400-e29b-41d4-a716-446655440004', 'Sarah Designer', 'designer@company.com', 'Pending', 'Input', 'High', 'Content Management', 'https://figma.com/file/example4', 'figma-plugin', NOW() - INTERVAL '2 hours'),
    
    ('CR0005', 'Dashboard Layout Grid', 'Responsive grid layout system for dashboard widgets that supports drag-and-drop reordering.', '550e8400-e29b-41d4-a716-446655440005', 'Mike Developer', 'developer@company.com', 'In Progress', 'Layout', 'Urgent', 'Analytics Dashboard', 'https://figma.com/file/example5', 'manual', NOW() - INTERVAL '5 days'),
    
    ('CR0006', 'Search Autocomplete', 'Smart search component with autocomplete, recent searches, and category filtering.', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@company.com', 'Completed', 'Input', 'Medium', 'Main Application', NULL, 'manual', NOW() - INTERVAL '10 days'),
    
    ('CR0007', 'Notification Toast System', 'Toast notification system with different types (success, error, warning, info) and positioning options.', '550e8400-e29b-41d4-a716-446655440004', 'Sarah Designer', 'designer@company.com', 'Pending', 'Display', 'Medium', 'Core Components', 'https://figma.com/file/example7', 'figma-plugin', NOW() - INTERVAL '6 hours'),
    
    ('CR0008', 'User Profile Card', 'Compact user profile card component with avatar, name, role, and quick actions menu.', '550e8400-e29b-41d4-a716-446655440005', 'Mike Developer', 'developer@company.com', 'Completed', 'Display', 'Low', 'User Management', NULL, 'manual', NOW() - INTERVAL '14 days'),
    
    ('CR0009', 'Calendar Date Picker', 'Advanced date picker with range selection, disabled dates, and custom styling options.', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@company.com', 'In Progress', 'Input', 'High', 'Booking System', 'https://figma.com/file/example9', 'figma-plugin', NOW() - INTERVAL '1 day'),
    
    ('CR0010', 'Mobile Navigation Menu', 'Responsive mobile navigation with hamburger menu, slide-out drawer, and nested menu support.', '550e8400-e29b-41d4-a716-446655440004', 'Sarah Designer', 'designer@company.com', 'Pending', 'Navigation', 'High', 'Mobile App', 'https://figma.com/file/example10', 'manual', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample API key (this is a hashed version of "test-api-key-123")
INSERT INTO api_keys (
    id, user_id, key_hash, key_prefix, name, created_at, is_active
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'crs_test',
    'Development API Key',
    NOW() - INTERVAL '1 day',
    true
) ON CONFLICT (id) DO NOTHING;
