# Component Request System

A comprehensive dashboard and Figma plugin for managing component requests in design systems.

## Features

### Dashboard
- **User Authentication**: Simple email-based login with role selection
- **Request Management**: Create, view, edit, and update component requests
- **Advanced Filtering**: Filter by status, category, priority, and search
- **Pagination**: Configurable results per page (10, 20, 30)
- **API Key Management**: Generate and manage API keys for Figma plugin integration
- **Real-time Updates**: See requests update in real-time
- **Professional UI**: Dark blue gradient theme with glassmorphism effects

### Figma Plugin
- **Smart Selection**: Only works with Frames and Components
- **Auto Figma Links**: Automatically generates proper Figma URLs
- **Form Validation**: Real-time validation and error handling
- **API Integration**: Secure connection to dashboard via API keys
- **Image Export**: Exports high-quality previews of selected components

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Plugin**: Figma Plugin API

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Figma account (for plugin development)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd component-request-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Figma Plugin Setup

1. Open Figma Desktop App
2. Go to Plugins → Development → Import plugin from manifest
3. Select the `figma-plugin/manifest.json` file
4. The plugin will be available in your Figma plugins

## Usage

### Dashboard

1. **Login**: Enter your email and select your role (Requester/Creator)
2. **Generate API Key**: Go to Account → API Settings to generate your API key
3. **Create Requests**: Use the "Create request" button to manually add requests
4. **Manage Requests**: View, edit, update status, and delete requests
5. **Filter & Search**: Use the filters to find specific requests

### Figma Plugin

1. **Install Plugin**: Import the plugin manifest in Figma
2. **Enter API Key**: Copy your API key from the dashboard
3. **Select Component**: Choose a Frame or Component in Figma
4. **Fill Form**: Complete the request details
5. **Submit**: Create the request and see it appear in your dashboard

## API Integration

The system is designed to work with a REST API. To connect to your backend:

1. Update the API endpoint in `figma-plugin/code.js`:
\`\`\`javascript
const response = await fetch("https://your-api-domain.com/api/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
})
\`\`\`

2. Update the API calls in `components/component-request-dashboard.tsx`:
\`\`\`javascript
// Load requests
const response = await fetch('/api/requests')
const data = await response.json()
setRequests(data)

// Create request
await fetch('/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newRequest)
})

// Update request
await fetch(`/api/requests/${requestId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
})

// Delete request
await fetch(`/api/requests/${requestId}`, {
  method: 'DELETE'
})
\`\`\`

3. Implement the API endpoints to handle:
   - GET `/api/requests`: Retrieve requests
   - POST `/api/requests`: Create new requests
   - PUT `/api/requests/:id`: Update requests
   - DELETE `/api/requests/:id`: Remove requests

## Data Structure

### Component Request
\`\`\`typescript
interface ComponentRequest {
  id: string
  requestName: string
  justification: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  status: "Pending" | "In Progress" | "Completed"
  denialReason: string
  requestedAt: string
  updatedAt: string
  frameData: {
    fileId: string
    nodeId: string
    thumbnailUrl: string
  }
  project: string
  severity: "Low" | "Medium" | "High" | "Urgent"
  category: "Form" | "Navigation" | "Display" | "Input" | "Layout"
  figmaLink: string
}
\`\`\`

## Customization

### Styling
- Colors and themes can be modified in the Tailwind classes
- The gradient background can be customized in the CSS
- Component styling follows the shadcn/ui design system

### Features
- Add new categories in the select options
- Modify priority levels
- Add custom fields to the request form
- Implement additional filters

## Security

- API keys are generated with a secure format: `crs_username_timestamp_random`
- Keys are stored locally in the browser
- All API communications should use HTTPS
- Validate API keys on the server side

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Roadmap

- [ ] Backend API implementation
- [ ] Database integration
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Role-based permissions
- [ ] Email notifications
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Advanced search
- [ ] Comment system
- [ ] File attachments
\`\`\`

Perfect! The Component Request System is now ready for you to create your own backend. Here's what I've prepared:

## 🎯 **Clean Frontend-Only System**

### **What's Ready:**
- ✅ **Complete Dashboard** with all UI functionality
- ✅ **Figma Plugin** with full integration points
- ✅ **Empty State Handling** for when you start fresh
- ✅ **Loading States** for API calls
- ✅ **Error Handling** throughout
- ✅ **API Integration Points** clearly marked with comments

### **What You Need to Build:**

1. **Backend API** with these endpoints:
   - `GET /api/requests` - Load all requests
   - `POST /api/requests` - Create new request
   - `PUT /api/requests/:id` - Update request
   - `DELETE /api/requests/:id` - Delete request

2. **Database** to store:
   - Component requests
   - User sessions (optional)
   - API keys

### **API Integration Points:**

All the API calls are commented out and ready for you to uncomment once your backend is ready:

- **Dashboard**: `loadRequests()`, `handleStatusUpdate()`, `handleManualRequestSubmit()`, `handleDeleteRequest()`
- **Figma Plugin**: `createComponentRequest()` function

### **Next Steps:**

1. **Choose Your Backend**: Node.js/Express, Python/FastAPI, etc.
2. **Set Up Database**: PostgreSQL, MongoDB, Firebase, etc.
3. **Implement API Endpoints**: Follow the data structure in README.md
4. **Uncomment API Calls**: Replace the commented fetch calls
5. **Test Integration**: Use the Figma plugin to create requests

The system will start with an empty state and guide users to create their first request. Once you have your backend ready, just uncomment the API calls and you're good to go! 🚀
