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
function initializePlugin() {
  updateSelection()
  figma.on("selectionchange", updateSelection)
}

function updateSelection() {
  const selection = figma.currentPage.selection

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

  if (node.type !== "FRAME" && node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
    figma.ui.postMessage({
      type: "selection-updated",
      data: null,
      link: null,
      error: `Invalid selection: "${node.name}" is a ${node.type}. Please select a Frame or Component.`,
    })
    return
  }

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

  currentFigmaLink = generateFigmaLink(node)

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
    return `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(node.id)}`
  } catch (error) {
    console.error("Failed to generate Figma link:", error)
    return null
  }
}

async function exportSelectionAsImage(node) {
  try {
    const imageBytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 },
    })
    return `data:image/png;base64,${figma.base64Encode(imageBytes)}`
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
      apiEndpoint,
    } = requestData

    if (!apiKey) {
      throw new Error("API key is required")
    }

    if (!apiEndpoint) {
      throw new Error("API endpoint is required")
    }

    const selectedNode = figma.currentPage.selection[0]
    if (!selectedNode) {
      throw new Error("No node selected")
    }

    const imageData = await exportSelectionAsImage(selectedNode)
    const fileKey = figma.fileKey || "unknown"
    const fileName = figma.root.name || "Untitled"

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

    figma.ui.postMessage({
      type: "request-success",
      data: result,
    })

    figma.notify(`✅ Component request "${componentName}" created successfully!`, {
      timeout: 4000,
    })
  } catch (error) {
    console.error("Failed to create request:", error)

    figma.ui.postMessage({
      type: "request-error",
      error: error.message,
    })

    figma.notify(`❌ Failed to create request: ${error.message}`, {
      timeout: 5000,
      error: true,
    })
  }
}

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

initializePlugin()
