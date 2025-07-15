-- Insert sample users
INSERT INTO users (email, name, role) VALUES
('john.doe@company.com', 'John Doe', 'Requester'),
('jane.smith@company.com', 'Jane Smith', 'Creator'),
('admin@company.com', 'Admin User', 'Admin'),
('designer@company.com', 'UI Designer', 'Requester'),
('developer@company.com', 'Frontend Dev', 'Creator')
ON CONFLICT (email) DO NOTHING;

-- Insert sample component requests
INSERT INTO component_requests (
    id, request_name, justification, requester_name, requester_email, 
    status, category, severity, project, figma_link, source
) VALUES
('CR0001', 'Advanced Data Table', 'Need a sortable, filterable data table with pagination for the admin dashboard. Should support bulk actions and export functionality.', 'John Doe', 'john.doe@company.com', 'Completed', 'Display', 'High', 'Admin Dashboard', 'https://figma.com/file/sample1', 'manual'),

('CR0002', 'Multi-step Form Wizard', 'Complex onboarding form that needs to be broken into multiple steps with progress indicator and validation.', 'Jane Smith', 'jane.smith@company.com', 'In Progress', 'Form', 'Medium', 'User Onboarding', 'https://figma.com/file/sample2', 'figma-plugin'),

('CR0003', 'Navigation Breadcrumbs', 'Breadcrumb navigation component for better user orientation in deep page hierarchies.', 'UI Designer', 'designer@company.com', 'Pending', 'Navigation', 'Low', 'Main Website', NULL, 'manual'),

('CR0004', 'File Upload Dropzone', 'Drag and drop file upload component with progress indicators and file type validation.', 'Frontend Dev', 'developer@company.com', 'Pending', 'Input', 'Medium', 'Document Manager', 'https://figma.com/file/sample4', 'manual'),

('CR0005', 'Dashboard Widget Grid', 'Responsive grid layout for dashboard widgets that can be rearranged and resized by users.', 'Admin User', 'admin@company.com', 'In Progress', 'Layout', 'High', 'Analytics Dashboard', 'https://figma.com/file/sample5', 'figma-plugin'),

('CR0006', 'Search Autocomplete', 'Smart search input with autocomplete suggestions and recent searches.', 'John Doe', 'john.doe@company.com', 'Pending', 'Input', 'Medium', 'Main Website', NULL, 'manual'),

('CR0007', 'Notification Toast System', 'Global notification system for success, error, and info messages with different positions and animations.', 'Jane Smith', 'jane.smith@company.com', 'Completed', 'Display', 'High', 'Core Components', NULL, 'manual'),

('CR0008', 'Mobile Menu Drawer', 'Responsive mobile navigation drawer with smooth animations and gesture support.', 'UI Designer', 'designer@company.com', 'Pending', 'Navigation', 'Medium', 'Mobile App', 'https://figma.com/file/sample8', 'figma-plugin')
ON CONFLICT (id) DO NOTHING;

-- Update requester_id based on email
UPDATE component_requests 
SET requester_id = users.id 
FROM users 
WHERE component_requests.requester_email = users.email;
