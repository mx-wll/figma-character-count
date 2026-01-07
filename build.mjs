import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

// Plugin to inline CSS into HTML
const htmlPlugin = {
  name: 'html-plugin',
  setup(build) {
    build.onEnd(async () => {
      // Read the HTML template
      const htmlPath = path.resolve('src/ui/ui.html');
      let html = fs.readFileSync(htmlPath, 'utf8');

      // Read the built UI JS
      const uiJsPath = path.resolve('dist/ui.js');
      if (fs.existsSync(uiJsPath)) {
        const uiJs = fs.readFileSync(uiJsPath, 'utf8');
        // Replace the script placeholder with inline script
        html = html.replace(
          '<!-- SCRIPT_PLACEHOLDER -->',
          `<script>${uiJs}</script>`
        );
      }

      // Read the CSS
      const cssPath = path.resolve('dist/ui.css');
      if (fs.existsSync(cssPath)) {
        const css = fs.readFileSync(cssPath, 'utf8');
        // Replace the style placeholder with inline styles
        html = html.replace(
          '<!-- STYLE_PLACEHOLDER -->',
          `<style>${css}</style>`
        );
      }

      // Write final HTML
      fs.writeFileSync(path.resolve('dist/ui.html'), html);
      console.log('Built dist/ui.html');
    });
  }
};

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build configuration for main plugin code
const codeConfig = {
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  format: 'iife',
  target: 'es2020',
  logLevel: 'info',
};

// Build configuration for UI
const uiConfig = {
  entryPoints: ['src/ui/ui.ts'],
  bundle: true,
  outfile: 'dist/ui.js',
  format: 'iife',
  target: 'es2020',
  logLevel: 'info',
  plugins: [htmlPlugin],
};

// Build configuration for CSS
const cssConfig = {
  entryPoints: ['src/ui/ui.css'],
  bundle: true,
  outfile: 'dist/ui.css',
  logLevel: 'info',
};

async function build() {
  try {
    if (isWatch) {
      // Watch mode
      const codeCtx = await esbuild.context(codeConfig);
      const cssCtx = await esbuild.context(cssConfig);
      const uiCtx = await esbuild.context(uiConfig);

      await Promise.all([
        codeCtx.watch(),
        cssCtx.watch(),
        uiCtx.watch(),
      ]);

      console.log('Watching for changes...');
    } else {
      // Single build
      await esbuild.build(codeConfig);
      await esbuild.build(cssConfig);
      await esbuild.build(uiConfig);
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
