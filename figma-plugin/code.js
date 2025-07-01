// Figma Plugin Main Code
const figma = window.figma // Declare figma variable
const __html__ = "<div>Your UI HTML here</div>" // Declare __html__ variable

figma.showUI(__html__, {
  width: 420,
  height: 680,
  themeColors: true,
})

// Store current selection
let currentSelection = []

// Initialize plugin
async function init() {
  updateSelection()

  // Listen for selection changes
  figma.on("selectionchange", updateSelection)
}

function updateSelection() {
  currentSelection = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    width: "width" in node ? node.width : null,
    height: "height" in node ? node.height : null,
    fills: "fills" in node ? node.fills : null,
    effects: "effects" in node ? node.effects : null,
  }))

  // Send selection to UI
  figma.ui.postMessage({
    type: "selection-updated",
    data: currentSelection,
  })
}

async function exportSelectionAsImage(selection) {
  if (!selection || selection.length === 0) {
    return null
  }

  try {
    // Get the first selected node for image export
    const node = figma.currentPage.selection[0]
    if (!node) return null

    // Export as PNG
    const imageBytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 },
    })

    // Convert to base64
    const base64 = figma.base64Encode(imageBytes)
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error("Failed to export image:", error)
    return null
  }
}

async function createComponentRequest(requestData) {
  try {
    const { apiKey, category, priority, componentName, requesterName, requesterEmail, description, selection } =
      requestData

    // Export selection as image if available
    const imageData = await exportSelectionAsImage(selection)

    // Get current file info
    const fileKey = figma.fileKey
    const fileName = figma.root.name

    // Prepare request payload
    const payload = {
      requestName: componentName,
      justification: description,
      requesterName,
      requesterEmail,
      category,
      severity: priority,
      figmaFileKey: fileKey,
      figmaFileName: fileName,
      selectionData: selection,
      imageData,
      source: "figma-plugin",
    }

    // Make API request to your dashboard
    const response = await fetch("https://your-dashboard-api.com/api/requests", {
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

    // Send success message to UI
    figma.ui.postMessage({
      type: "request-success",
      data: result,
    })

    // Show notification in Figma
    figma.notify("✅ Component request created successfully!", { timeout: 3000 })
  } catch (error) {
    console.error("Failed to create request:", error)

    // Send error message to UI
    figma.ui.postMessage({
      type: "request-error",
      error: error.message,
    })

    // Show error notification in Figma
    figma.notify(`❌ Failed to create request: ${error.message}`, {
      timeout: 5000,
      error: true,
    })
  }
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "get-selection":
      updateSelection()
      break

    case "create-request":
      await createComponentRequest(msg.data)
      break

    case "close-plugin":
      figma.closePlugin()
      break
  }
}

// Initialize the plugin
init()
