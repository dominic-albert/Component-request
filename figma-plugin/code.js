// Figma Plugin Main Code
const figma = window.figma // Declare figma variable
const __html__ = "<div>Your UI HTML here</div>" // Declare __html__ variable

figma.showUI(__html__, {
  width: 420,
  height: 720,
  themeColors: true,
})

// Store current selection
let currentSelection = []
let currentFigmaLink = null

// Initialize plugin
async function init() {
  updateSelection()

  // Listen for selection changes
  figma.on("selectionchange", updateSelection)
}

function updateSelection() {
  const selection = figma.currentPage.selection

  // Check if selection is valid (Frame or Component)
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: "selection-updated",
      data: null,
      link: null,
      error: "Please select a Frame or Component to create a request",
    })
    return
  }

  if (selection.length > 1) {
    figma.ui.postMessage({
      type: "selection-updated",
      data: null,
      link: null,
      error: "Please select only one Frame or Component at a time",
    })
    return
  }

  const node = selection[0]

  // Validate node type
  if (node.type !== "FRAME" && node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
    figma.ui.postMessage({
      type: "selection-updated",
      data: null,
      link: null,
      error: `Invalid selection: "${node.name}" is a ${node.type}. Please select a Frame or Component.`,
    })
    return
  }

  // Create selection data
  currentSelection = [
    {
      id: node.id,
      name: node.name,
      type: node.type,
      width: node.width,
      height: node.height,
      fills: node.fills || [],
      effects: node.effects || [],
    },
  ]

  // Generate Figma link
  currentFigmaLink = generateFigmaLink(node)

  // Send valid selection to UI
  figma.ui.postMessage({
    type: "selection-updated",
    data: currentSelection,
    link: currentFigmaLink,
    error: null,
  })
}

function generateFigmaLink(node) {
  try {
    const fileKey = figma.fileKey
    if (!fileKey) {
      console.warn("No file key available")
      return null
    }

    // Generate the Figma link with node ID
    const link = `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(node.id)}`
    return link
  } catch (error) {
    console.error("Failed to generate Figma link:", error)
    return null
  }
}

async function exportSelectionAsImage(node) {
  try {
    // Export as PNG with 2x scale for better quality
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
    const {
      apiKey,
      category,
      priority,
      componentName,
      requesterName,
      requesterEmail,
      description,
      selection,
      figmaLink,
    } = requestData

    // Get the selected node for image export
    const selectedNode = figma.currentPage.selection[0]
    if (!selectedNode) {
      throw new Error("No node selected")
    }

    // Export selection as image
    const imageData = await exportSelectionAsImage(selectedNode)

    // Get current file info
    const fileKey = figma.fileKey || "unknown"
    const fileName = figma.root.name || "Untitled"

    // Prepare request payload matching your dashboard structure
    const payload = {
      requestName: componentName,
      justification: description,
      requesterName,
      requesterEmail,
      category,
      severity: priority, // Maps to priority in your dashboard
      figmaLink: figmaLink || "",
      figmaFileKey: fileKey,
      figmaFileName: fileName,
      figmaNodeId: selection.id,
      selectionData: selection,
      imageData,
      source: "figma-plugin",
      project: "Figma Plugin", // You can customize this
    }

    // Replace with your actual API endpoint
    // const response = await fetch("https://your-dashboard-api.com/api/requests", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${apiKey}`,
    //     "X-Figma-Plugin": "component-request-system",
    //   },
    //   body: JSON.stringify(payload),
    // })

    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    // }

    // const result = await response.json()

    // Simulate API call for now
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate successful response
    const result = {
      id: `CR${String(Date.now()).slice(-4)}`,
      message: "Component request created successfully",
      data: payload,
    }

    // Send success message to UI
    figma.ui.postMessage({
      type: "request-success",
      data: result,
    })

    // Show notification in Figma
    figma.notify(`✅ Component request "${componentName}" created successfully!`, {
      timeout: 4000,
    })
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
