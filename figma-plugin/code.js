// Figma Plugin Main Code - Fixed version

// Declare figma and __html__ variables
const figma = window.figma
const __html__ = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma Plugin UI</title>
    <style>
      /* Add your UI styles here */
    </style>
  </head>
  <body>
    <!-- Add your UI elements here -->
  </body>
  </html>
`

// Initialize plugin state
const pluginState = {
  currentSelection: [],
  currentFigmaLink: null,
}

// Show UI
figma.showUI(__html__, {
  width: 420,
  height: 720,
  themeColors: true,
})

// Initialize plugin
function initializePlugin() {
  updateSelectionState()
  figma.on("selectionchange", updateSelectionState)
}

function updateSelectionState() {
  const selection = figma.currentPage.selection

  // Reset state
  pluginState.currentSelection = []
  pluginState.currentFigmaLink = null

  // Check if selection is valid
  if (selection.length === 0) {
    sendToUI({
      type: "selection-updated",
      data: null,
      link: null,
      error: "Please select a Frame or Component to create a request",
    })
    return
  }

  if (selection.length > 1) {
    sendToUI({
      type: "selection-updated",
      data: null,
      link: null,
      error: "Please select only one Frame or Component at a time",
    })
    return
  }

  const selectedNode = selection[0]

  // Validate node type
  if (selectedNode.type !== "FRAME" && selectedNode.type !== "COMPONENT" && selectedNode.type !== "COMPONENT_SET") {
    sendToUI({
      type: "selection-updated",
      data: null,
      link: null,
      error: `Invalid selection: "${selectedNode.name}" is a ${selectedNode.type}. Please select a Frame or Component.`,
    })
    return
  }

  // Create selection data
  const selectionData = {
    id: selectedNode.id,
    name: selectedNode.name,
    type: selectedNode.type,
    width: selectedNode.width,
    height: selectedNode.height,
    fills: selectedNode.fills || [],
    effects: selectedNode.effects || [],
  }

  // Generate Figma link
  const figmaLink = createFigmaLink(selectedNode)

  // Update state
  pluginState.currentSelection = [selectionData]
  pluginState.currentFigmaLink = figmaLink

  // Send valid selection to UI
  sendToUI({
    type: "selection-updated",
    data: pluginState.currentSelection,
    link: pluginState.currentFigmaLink,
    error: null,
  })
}

function createFigmaLink(node) {
  try {
    const fileKey = figma.fileKey
    if (!fileKey) {
      console.warn("No file key available")
      return null
    }

    return `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(node.id)}`
  } catch (error) {
    console.error("Failed to generate Figma link:", error)
    return null
  }
}

async function exportNodeImage(node) {
  try {
    const imageBytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 },
    })

    const base64 = figma.base64Encode(imageBytes)
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error("Failed to export image:", error)
    return null
  }
}

async function handleCreateRequest(requestData) {
  try {
    const {
      apiKey,
      apiEndpoint,
      category,
      priority,
      componentName,
      requesterName,
      requesterEmail,
      description,
      selection,
      figmaLink,
    } = requestData

    // Validate required fields
    if (!apiKey || !apiEndpoint) {
      throw new Error("API key and endpoint are required")
    }

    // Get the selected node for image export
    const selectedNode = figma.currentPage.selection[0]
    if (!selectedNode) {
      throw new Error("No node selected")
    }

    // Export selection as image
    const imageData = await exportNodeImage(selectedNode)

    // Get current file info
    const fileKey = figma.fileKey || "unknown"
    const fileName = figma.root.name || "Untitled"

    // Prepare request payload
    const payload = {
      requestName: componentName,
      justification: description,
      requesterName,
      requesterEmail,
      category,
      severity: priority,
      figmaLink: figmaLink || "",
      figmaFileKey: fileKey,
      figmaFileName: fileName,
      figmaNodeId: selection.id,
      selectionData: selection,
      imageData,
      source: "figma-plugin",
      project: "Figma Plugin",
    }

    // Make API request
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Figma-Plugin": "component-request-system",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // Send success message
    sendToUI({
      type: "request-success",
      data: result,
    })

    // Show notification
    figma.notify(`✅ Component request "${componentName}" created successfully!`, {
      timeout: 4000,
    })
  } catch (error) {
    console.error("Failed to create request:", error)

    // Send error message
    sendToUI({
      type: "request-error",
      error: error.message,
    })

    // Show error notification
    figma.notify(`❌ Failed to create request: ${error.message}`, {
      timeout: 5000,
      error: true,
    })
  }
}

function sendToUI(message) {
  figma.ui.postMessage(message)
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "get-selection":
      updateSelectionState()
      break

    case "create-request":
      await handleCreateRequest(msg.data)
      break

    case "close-plugin":
      figma.closePlugin()
      break
  }
}

// Initialize the plugin
initializePlugin()
