-- Sample data for testing (optional)

-- Insert sample users
INSERT INTO users (email, name, role) VALUES
('john.doe@company.com', 'John Doe', 'Requester'),
('jane.smith@company.com', 'Jane Smith', 'Creator'),
('admin@company.com', 'Admin User', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample requests (optional - for testing)
INSERT INTO component_requests (
    id, request_name, justification, requester_name, requester_email,
    status, category, severity, project, figma_link
) VALUES
(
    'CR0001',
    'Advanced Data Table',
    'We need a sophisticated data table component with sorting, filtering, and pagination capabilities for our dashboard.',
    'John Doe',
    'john.doe@company.com',
    'Pending',
    'Display',
    'High',
    'Dashboard Project',
    'https://figma.com/file/example1'
),
(
    'CR0002',
    'Multi-step Form Wizard',
    'A form wizard component that guides users through complex multi-step processes with validation and progress indication.',
    'Jane Smith',
    'jane.smith@company.com',
    'In Progress',
    'Form',
    'Medium',
    'Onboarding Flow',
    'https://figma.com/file/example2'
)
ON CONFLICT (id) DO NOTHING;
