# Component Request System - Figma Plugin

This Figma plugin allows designers to create component requests directly from Figma frames and components.

## Features

- **API Key Authentication**: Secure connection to your dashboard
- **Smart Selection**: Only works with frames and components
- **Auto-fill**: Automatically fills component name and generates Figma links
- **Real-time Validation**: Instant feedback on selection and form validation
- **Beautiful UI**: Matches your dashboard's design system

## Installation

1. In Figma, go to Plugins → Development → Import plugin from manifest
2. Select the `manifest.json` file from this folder
3. The plugin will be available in your Plugins menu

## Usage

1. **Get API Key**: 
   - Go to your Component Request Dashboard
   - Click on your profile → API Settings
   - Generate and copy your API key

2. **Use Plugin**:
   - Open the plugin in Figma
   - Paste your API key and click "Save API Key"
   - Select a frame or component in Figma
   - Fill out the request form
   - Click "Create Request"

## API Integration

The plugin sends requests to your dashboard API endpoint:
\`\`\`
POST https://your-dashboard-domain.com/api/requests
\`\`\`

Make sure to update the domain in both `manifest.json` and `ui.html` to match your actual dashboard URL.

## Error Handling

- Shows clear error messages for invalid selections
- Validates API key format
- Handles network errors gracefully
- Provides user-friendly feedback

## Security

- API keys are stored locally in the plugin
- All requests are authenticated
- No sensitive data is logged
