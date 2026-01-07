# Character Count Estimator Figma Plugin

A Figma plugin that estimates how many characters can fit in a selected text box based on German letter frequency data and font characteristics.

## Features

- **Auto-Detection**: Automatically reads font name, font size, and text box width from selected text layer
- **Smart Estimation**: Uses German letter frequency data for weighted character width calculations
- **Font-Aware**: Adjusts calculations based on font family characteristics (monospace, condensed, wide, etc.)
- **Language-Specific**: Built with German frequency map for accurate real-world text estimation

## Installation

### Method 1: Development Mode (Recommended for Testing)

1. **Open Figma Desktop App**
2. **Go to Plugins Menu**: 
   - Click on the menu icon (hamburger) in the top-left
   - Select "Plugins" → "Development" → "New Plugin..."
3. **Import Plugin**:
   - Click "Import plugin from manifest..."
   - Select the `manifest.json` file from this directory
4. **Plugin is Ready**: The plugin will appear in your "Development" plugins list

### Method 2: Manual Installation

1. **Create Plugin Directory**:
   - Navigate to Figma's plugin directory:
     - **macOS**: `~/Library/Application Support/Figma/plugins/`
     - **Windows**: `%APPDATA%\Figma\plugins\`
   - Create a new folder named `character-count-estimator`
2. **Copy Files**:
   - Copy `manifest.json`, `code.js`, and `ui.html` to the new folder
3. **Restart Figma**: Close and reopen Figma Desktop App
4. **Enable Plugin**: Go to Plugins → Development → Character Count Estimator

## How to Use

### Basic Usage

1. **Create or Select a Text Layer**:
   - In Figma, create a text layer or select an existing one
   - The text layer should have a defined width (not auto-width)

2. **Launch Plugin**:
   - With the text layer selected, go to Plugins → Development → Character Count Estimator
   - The plugin will automatically read the layer's properties

3. **View Results**:
   - The plugin displays:
     - Font name
     - Font size
     - Text box width
   - Click "Calculate Character Count" to see the estimated character count

4. **Interpret Results**:
   - The result shows how many characters (based on German text patterns) can fit in the text box
   - Also displays the weighted average character width for reference

### Test Cases

Try these scenarios to test the plugin:

| Font Name | Font Size | Text Box Width | Expected Behavior |
|-----------|-----------|----------------|-------------------|
| Arial | 16px | 200px | ~20-25 characters |
| Roboto | 24px | 300px | ~12-15 characters |
| Courier New | 16px | 200px | ~18-22 characters (monospace) |
| Arial Narrow | 16px | 200px | ~25-30 characters (condensed) |

### Expected Behavior

- **Monospace fonts** (like Courier) show consistent character counts
- **Condensed fonts** fit more characters
- **Wide fonts** fit fewer characters
- **Larger font sizes** reduce character count proportionally
- **Wider text boxes** increase character count proportionally

## File Structure

```
character-count-estimator/
├── manifest.json    # Plugin configuration
├── code.js         # Main plugin logic with selection handling
├── ui.html         # User interface
└── README.md       # This file
```

## Technical Details

### Algorithm

1. **Selection Detection**: Validates that a single text layer is selected
2. **Property Extraction**: Reads `fontName.family`, `fontSize`, and `width` from the selected node
3. **Font Analysis**: Estimates character widths based on font family characteristics
4. **Frequency Weighting**: Each character's width is weighted by its frequency in German text
5. **Character Count**: Divides text box width by weighted average character width

### Font Characteristics

The plugin adjusts base width calculations for different font types:
- **Monospace**: `fontSize * 0.6`
- **Condensed/Narrow**: `fontSize * 0.5`
- **Wide/Expanded**: `fontSize * 0.7`
- **Default**: `fontSize * 0.6`

### German Frequency Data

Uses authentic German letter frequency data including:
- Standard letters (a-z)
- German umlauts (ä, ö, ü)
- Eszett (ß)
- Space character

### Limitations

- **Estimation Only**: Results are estimates based on average character widths, not exact measurements
- **German-Specific**: Optimized for German text patterns (can be adapted for other languages)
- **Single Font**: Assumes uniform font throughout the text box
- **No Kerning**: Does not account for kerning pairs or ligatures
- **Fixed Width**: Requires text box with defined width (not auto-width)

## Troubleshooting

### "Please select a text layer first"
- Ensure you have selected exactly one text layer before launching the plugin
- The layer must be of type TEXT (not a frame or group)

### "Please select only one text layer"
- Select only one text layer at a time
- Deselect other layers before launching

### "Selected layer is not a text layer"
- The selected object must be a text layer
- Frames, groups, and other layer types are not supported

### Unexpected Character Counts
- Verify the text box has a defined width (not auto-width)
- Check that font name is recognized (common fonts work best)
- Results are estimates and may vary from actual character counts

## Extending the Plugin

### Adding New Languages

Replace the `GERMAN_FREQUENCY_MAP` in `code.js` with frequency data for your target language:

```javascript
const ENGLISH_FREQUENCY_MAP = {
  'a': 8.17, 'b': 1.49, 'c': 2.78, 'd': 4.25, 'e': 12.70,
  // ... add all letters
  ' ': 18.0
};
```

### Improving Accuracy

Potential enhancements:
- Add more font family detection patterns
- Include font weight considerations
- Add kerning pair analysis
- Support for variable fonts
- Multi-language frequency maps

### Advanced Features

Ideas for future development:
- Support for multiple text layers
- Export results to CSV
- Visual preview of character limit
- Real-time updates on selection change
- Custom frequency maps via UI

## License

This plugin is provided as-is for educational and development purposes.