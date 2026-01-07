// Character Count Estimator Figma Plugin
// Reads selected text layer properties and sends them to the UI for calculation

interface TextLayerData {
  fontName: string;
  fontStyle: string;
  fontSize: number;
  letterSpacing: number;
  textBoxWidth: number;
}

interface SelectionDataMessage extends TextLayerData {
  type: 'selection-data';
}

interface SelectionErrorMessage {
  type: 'selection-error';
  message: string;
}

type PluginMessage = SelectionDataMessage | SelectionErrorMessage;

// Get selected text layer properties
const getSelectedTextLayer = (): TextLayerData => {
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

  // Check for mixed properties
  if (node.fontName === figma.mixed) {
    throw new Error('Text layer has mixed fonts. Please select text with a single font.');
  }

  if (node.fontSize === figma.mixed) {
    throw new Error('Text layer has mixed font sizes. Please select text with a single size.');
  }

  // Get letter spacing (convert percent to pixels if needed)
  let letterSpacing = 0;
  if (node.letterSpacing && node.letterSpacing !== figma.mixed) {
    const ls = node.letterSpacing as LetterSpacing;
    if (ls.unit === 'PIXELS') {
      letterSpacing = ls.value;
    } else if (ls.unit === 'PERCENT') {
      // Percent is relative to font size
      const fontSize = node.fontSize as number;
      letterSpacing = (ls.value / 100) * fontSize;
    }
  }

  const fontName = node.fontName as FontName;

  return {
    fontName: fontName.family,
    fontStyle: fontName.style,
    fontSize: node.fontSize as number,
    letterSpacing: letterSpacing,
    textBoxWidth: node.width
  };
};

// Create the plugin UI
figma.showUI(__html__, { width: 400, height: 420 });

// Send selection data to UI
const sendSelectionData = (): void => {
  try {
    const layerData = getSelectedTextLayer();
    const message: SelectionDataMessage = {
      type: 'selection-data',
      fontName: layerData.fontName,
      fontStyle: layerData.fontStyle,
      fontSize: layerData.fontSize,
      letterSpacing: layerData.letterSpacing,
      textBoxWidth: layerData.textBoxWidth
    };
    figma.ui.postMessage(message);
  } catch (error) {
    const message: SelectionErrorMessage = {
      type: 'selection-error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    figma.ui.postMessage(message);
  }
};

// Send initial selection data when plugin opens
sendSelectionData();

// Listen for selection changes
figma.on('selectionchange', () => {
  sendSelectionData();
});

// Handle messages from the UI
figma.ui.onmessage = (msg: { type: string; charCount?: number }) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }

  if (msg.type === 'rename-layer' && msg.charCount !== undefined) {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && selection[0].type === 'TEXT') {
      const node = selection[0];
      // Remove existing [CharLimit: xx] if present
      const baseName = node.name.replace(/\s*\[CharLimit:\s*\d+\]$/, '');
      node.name = `${baseName} [CharLimit: ${msg.charCount}]`;
    }
  }
};
