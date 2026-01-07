# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "Character Count Estimator" that calculates the maximum number of characters that can fit in a selected text box. This helps developers and copywriters understand content limits for specific text fields.

**Workflow:** User selects a text box in Figma → plugin displays max characters based on font properties and selected language frequency data.

## Architecture

The plugin follows Figma's standard plugin architecture:

- **manifest.json** - Plugin configuration (ID, permissions, entry points)
- **code.js** - Figma API layer: reads selection, sends data to UI, listens for selection changes
- **ui.html** - User interface + calculation logic using Canvas API for font measurement

### Data Flow

1. User selects a text layer in Figma
2. code.js reads font properties via `figma.currentPage.selection` and sends to UI
3. On selection change, code.js automatically sends updated data
4. User selects language (English/German) and clicks Calculate
5. UI measures actual character widths using Canvas API (`ctx.measureText()`)
6. UI calculates frequency-weighted average and displays max character count

### Key Components

**code.js** - Minimal, only handles:
- `getSelectedTextLayer()` - extracts fontName, fontStyle, fontSize, letterSpacing, textBoxWidth
- `figma.on('selectionchange')` - auto-updates UI on selection change

**ui.html** - Contains all calculation logic:
- `FREQUENCY_MAPS` - Letter frequencies for English and German
- `getFontWeight()` - Maps font style names (e.g., "Bold", "Medium") to numeric weights (100-900)
- `measureCharacterWidths()` - Uses Canvas API with font weight for actual measurement
- `calculateWeightedAverage()` - Frequency-weighted average width
- `calculateCharacterCount()` - Adds letter spacing to effective width, calculates max chars

### Calculation Formula

```
effective_char_width = measured_avg_width + letter_spacing
max_characters = floor(text_box_width / effective_char_width)
```

## Development

### Loading the Plugin in Figma

1. Open Figma Desktop
2. Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory

### Testing

Select a text layer with a defined width in Figma, then run the plugin from Plugins → Development menu. Open console (Plugins → Development → Open Console) to see detailed calculation breakdown.

### Message Protocol

UI → Plugin:
- `{ type: 'close' }`

Plugin → UI:
- `{ type: 'selection-data', fontName, fontStyle, fontSize, letterSpacing, textBoxWidth }`
- `{ type: 'selection-error', message }`

## v2 Backlog

- Auto-detect language from Figma document/layer settings
- Localization expansion factor (20-35% buffer for translations)
