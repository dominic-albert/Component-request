// Figma Plugin Main Code
const figma = window.figma // Declare figma variable
const __html__ = "<div>Your UI HTML here</div>" // Declare __html__ variable

figma.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: true,
})

let currentSelection = []

// Listen for selection changes
figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection
  currentSelection = selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
  }))

  // Send selection to UI
  figma.ui.postMessage({
    type: "selection-changed",
    data: currentSelection,
  })
})

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "get-selection":
      // Send current selection to UI
      const selection = figma.currentPage.selection
      const selectionData = selection.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.width,
        height: node.height,
      }))

      figma.ui.postMessage({
        type: "selection-changed",
        data: selectionData,
      })
      break

    case "generate-figma-link":
      try {
        const nodeId = msg.nodeId
        const node = figma.getNodeById(nodeId)

        if (!node) {
          figma.ui.postMessage({
            type: "error",
            error: "Selected node not found",
          })
          return
        }

        // Generate Figma link
        const fileKey = figma.fileKey
        const figmaLink = `https://www.figma.com/file/${fileKey}?node-id=${nodeId.replace(":", "%3A")}`

        figma.ui.postMessage({
          type: "figma-link-generated",
          data: { link: figmaLink },
        })
      } catch (error) {
        figma.ui.postMessage({
          type: "error",
          error: "Failed to generate Figma link: " + error.message,
        })
      }
      break

    case "request-created":
      // Show success notification in Figma
      figma.notify("✅ Component request created successfully!", { timeout: 3000 })
      break

    case "close-plugin":
      figma.closePlugin()
      break

    default:
      console.log("Unknown message type:", msg.type)
  }
}

// Initialize
console.log("Component Request System plugin loaded")

// Send initial selection
setTimeout(() => {
  const selection = figma.currentPage.selection
  const selectionData = selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
  }))

  figma.ui.postMessage({
    type: "selection-changed",
    data: selectionData,
  })
}, 100)
