// Character Count Estimator Figma Plugin
// Reads selected text layer properties and sends them to the UI for calculation

// Get selected text layer properties
const getSelectedTextLayer = () => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    throw new Error('Please select a text layer first');
  }

  if (selection.length > 1) {
    throw new Error('Please select only one text layer');
  }

  const node = selection[0];

  if (node.type !== 'TEXT') {
    throw new Error('Selected layer is not a text layer');
  }

  // Get letter spacing (convert percent to pixels if needed)
  let letterSpacing = 0;
  if (node.letterSpacing && node.letterSpacing !== figma.mixed) {
    if (node.letterSpacing.unit === 'PIXELS') {
      letterSpacing = node.letterSpacing.value;
    } else if (node.letterSpacing.unit === 'PERCENT') {
      // Percent is relative to font size
      letterSpacing = (node.letterSpacing.value / 100) * node.fontSize;
    }
  }

  return {
    fontName: node.fontName.family,
    fontStyle: node.fontName.style,
    fontSize: node.fontSize,
    letterSpacing: letterSpacing,
    textBoxWidth: node.width
  };
};

// Create the plugin UI
figma.showUI(__html__, { width: 400, height: 400 });

// Send selection data to UI
const sendSelectionData = () => {
  try {
    const layerData = getSelectedTextLayer();
    figma.ui.postMessage({
      type: 'selection-data',
      fontName: layerData.fontName,
      fontStyle: layerData.fontStyle,
      fontSize: layerData.fontSize,
      letterSpacing: layerData.letterSpacing,
      textBoxWidth: layerData.textBoxWidth
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'selection-error',
      message: error.message
    });
  }
};

// Send initial selection data when plugin opens
sendSelectionData();

// Listen for selection changes
figma.on('selectionchange', () => {
  sendSelectionData();
});

// Handle messages from the UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
