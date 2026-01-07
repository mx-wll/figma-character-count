// UI Logic for Character Count Estimator

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

// Letter frequency data
const FREQUENCY_MAPS: Record<string, Record<string, number>> = {
  english: {
    'a': 8.17, 'b': 1.49, 'c': 2.78, 'd': 4.25, 'e': 12.70,
    'f': 2.23, 'g': 2.02, 'h': 6.09, 'i': 6.97, 'j': 0.15,
    'k': 0.77, 'l': 4.03, 'm': 2.41, 'n': 6.75, 'o': 7.51,
    'p': 1.93, 'q': 0.10, 'r': 5.99, 's': 6.33, 't': 9.06,
    'u': 2.76, 'v': 0.98, 'w': 2.36, 'x': 0.15, 'y': 1.97,
    'z': 0.07, ' ': 18.0
  },
  german: {
    'a': 6.51, 'b': 1.89, 'c': 3.06, 'd': 5.08, 'e': 17.40,
    'f': 1.66, 'g': 3.01, 'h': 4.76, 'i': 7.55, 'j': 0.27,
    'k': 1.21, 'l': 3.44, 'm': 2.53, 'n': 9.78, 'o': 2.51,
    'p': 0.79, 'q': 0.02, 'r': 7.00, 's': 7.27, 't': 6.15,
    'u': 4.35, 'v': 0.67, 'w': 1.89, 'x': 0.03, 'y': 0.04,
    'z': 1.13, 'ä': 0.58, 'ö': 0.44, 'ü': 0.99, 'ß': 0.31,
    ' ': 16.0
  }
};

// DOM Elements
const errorSection = document.getElementById('errorSection') as HTMLDivElement;
const errorText = document.getElementById('errorText') as HTMLDivElement;
const selectionSection = document.getElementById('selectionSection') as HTMLDivElement;
const fontDisplay = document.getElementById('fontDisplay') as HTMLSpanElement;
const textBoxWidthDisplay = document.getElementById('textBoxWidthDisplay') as HTMLSpanElement;
const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
const computeBtn = document.getElementById('computeBtn') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const canvas = document.getElementById('measureCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let currentLayerData: TextLayerData | null = null;

// Map font style names to numeric weights
function getFontWeight(fontStyle: string): number {
  const style = fontStyle.toLowerCase();

  const weightMap: Record<string, number> = {
    'thin': 100,
    'hairline': 100,
    'extralight': 200,
    'extra light': 200,
    'ultralight': 200,
    'ultra light': 200,
    'light': 300,
    'regular': 400,
    'normal': 400,
    'book': 400,
    'medium': 500,
    'semibold': 600,
    'semi bold': 600,
    'demibold': 600,
    'demi bold': 600,
    'bold': 700,
    'extrabold': 800,
    'extra bold': 800,
    'ultrabold': 800,
    'ultra bold': 800,
    'black': 900,
    'heavy': 900
  };

  // Check for exact match first
  if (weightMap[style]) {
    return weightMap[style];
  }

  // Check if style contains any weight keyword
  for (const [keyword, weight] of Object.entries(weightMap)) {
    if (style.includes(keyword)) {
      return weight;
    }
  }

  // Default to regular
  return 400;
}

// Measure character widths using canvas
function measureCharacterWidths(fontName: string, fontSize: number, fontStyle: string): Record<string, number> {
  const fontWeight = getFontWeight(fontStyle);
  const fontString = `${fontWeight} ${fontSize}px "${fontName}"`;
  ctx.font = fontString;
  const widths: Record<string, number> = {};
  const chars = 'abcdefghijklmnopqrstuvwxyzäöüß ';

  console.log('=== CHARACTER WIDTH MEASUREMENT ===');
  console.log('Font:', fontString);
  console.log('Font weight mapped:', fontStyle, '→', fontWeight);
  console.log('');

  for (const char of chars) {
    widths[char] = ctx.measureText(char).width;
  }

  console.table(Object.entries(widths).map(([char, width]) => ({
    character: char === ' ' ? '(space)' : char,
    width: width.toFixed(2) + 'px'
  })));

  return widths;
}

// Calculate weighted average character width
function calculateWeightedAverage(charWidths: Record<string, number>, language: string): number {
  const freqMap = FREQUENCY_MAPS[language] || FREQUENCY_MAPS.english;
  const total = Object.values(freqMap).reduce((sum, freq) => sum + freq, 0);

  console.log('');
  console.log('=== WEIGHTED AVERAGE CALCULATION ===');
  console.log('Language:', language);
  console.log('');

  let weightedSum = 0;
  let weightTotal = 0;
  const breakdown: Array<{ character: string; width: string; frequency: string; weight: string; contribution: string }> = [];

  for (const [char, freq] of Object.entries(freqMap)) {
    if (charWidths[char] !== undefined) {
      const weight = freq / total;
      const contribution = charWidths[char] * weight;
      weightedSum += contribution;
      weightTotal += weight;

      breakdown.push({
        character: char === ' ' ? '(space)' : char,
        width: charWidths[char].toFixed(2) + 'px',
        frequency: freq.toFixed(2) + '%',
        weight: (weight * 100).toFixed(2) + '%',
        contribution: contribution.toFixed(3) + 'px'
      });
    }
  }

  console.table(breakdown);
  console.log('');
  console.log('Sum of contributions:', weightedSum.toFixed(3) + 'px');
  console.log('Total weight:', (weightTotal * 100).toFixed(2) + '%');

  const result = weightTotal > 0 ? weightedSum / weightTotal : 0;
  console.log('Weighted average (sum/weight):', result.toFixed(3) + 'px');

  return result;
}

// Calculate max character count
function calculateCharacterCount(
  fontName: string,
  fontStyle: string,
  fontSize: number,
  letterSpacing: number,
  textBoxWidth: number,
  language: string
): { maxChars: number; avgWidth: number } {
  console.log('');
  console.log('========================================');
  console.log('   CHARACTER COUNT CALCULATION');
  console.log('========================================');
  console.log('');

  const charWidths = measureCharacterWidths(fontName, fontSize, fontStyle);
  const avgWidth = calculateWeightedAverage(charWidths, language);

  // Add letter spacing to average width
  const effectiveWidth = avgWidth + letterSpacing;

  console.log('');
  console.log('=== FINAL RESULT ===');
  console.log('Text box width:', textBoxWidth.toFixed(2) + 'px');
  console.log('Average character width:', avgWidth.toFixed(3) + 'px');
  console.log('Letter spacing:', letterSpacing.toFixed(2) + 'px');
  console.log('Effective width per char:', effectiveWidth.toFixed(3) + 'px', `(${avgWidth.toFixed(3)} + ${letterSpacing.toFixed(2)})`);
  console.log('Calculation:', textBoxWidth.toFixed(2), '/', effectiveWidth.toFixed(3), '=', (textBoxWidth / effectiveWidth).toFixed(2));
  console.log('Max characters (floored):', Math.floor(textBoxWidth / effectiveWidth));
  console.log('========================================');
  console.log('');

  const maxChars = Math.floor(textBoxWidth / effectiveWidth);
  return { maxChars, avgWidth: effectiveWidth };
}

// Show error message
function showError(message: string): void {
  errorSection.style.display = 'block';
  selectionSection.style.display = 'none';
  resultDiv.style.display = 'none';
  errorText.textContent = message;
}

// Show selection data
function showSelectionData(data: TextLayerData): void {
  errorSection.style.display = 'none';
  selectionSection.style.display = 'block';
  resultDiv.style.display = 'none';

  currentLayerData = data;
  fontDisplay.textContent = `${data.fontName}, ${data.fontSize}px, ${data.fontStyle}`;
  textBoxWidthDisplay.textContent = `${Math.round(data.textBoxWidth)}px`;
}

// Show result
function showResult(maxChars: number): void {
  resultDiv.style.display = 'block';
  resultDiv.className = 'result result--success';
  resultDiv.innerHTML = `
    <div class="result__label">Safe Character Count</div>
    <div class="result__value">${maxChars}</div>
  `;
}

// Show calculation error
function showCalculationError(message: string): void {
  resultDiv.style.display = 'block';
  resultDiv.className = 'result result--error';
  resultDiv.innerHTML = `<div class="result__label">Error: ${message}</div>`;
}

// Handle compute button click
computeBtn.addEventListener('click', () => {
  if (currentLayerData) {
    console.log('Compute button clicked');

    try {
      const { maxChars, avgWidth } = calculateCharacterCount(
        currentLayerData.fontName,
        currentLayerData.fontStyle,
        currentLayerData.fontSize,
        currentLayerData.letterSpacing,
        currentLayerData.textBoxWidth,
        languageSelect.value
      );

      showResult(maxChars);

      // Send message to plugin to rename the layer
      parent.postMessage({
        pluginMessage: {
          type: 'rename-layer',
          charCount: maxChars
        }
      }, '*');
    } catch (error) {
      console.error('Calculation error:', error);
      showCalculationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
});

// Listen for messages from the plugin
window.addEventListener('message', (event: MessageEvent) => {
  const message = event.data.pluginMessage as PluginMessage;
  console.log('Received message from plugin:', message);

  if (message.type === 'selection-data') {
    showSelectionData(message);
  } else if (message.type === 'selection-error') {
    showError(message.message);
  }
});

// Initialize
console.log('Plugin UI initialized');
