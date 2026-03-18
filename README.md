# CodeGen Test Plugin for Figma

A Figma plugin that converts design layers into HTML with support for both plain HTML with inline styles and Tailwind CSS utilities. The plugin works in both **Design Mode** and **Dev Mode** codegen.

## Features

**Figma Design Mode**: Interactive panel for inspecting and exporting selected layers
**Dev Mode Codegen**: Generate HTML or Tailwind HTML code snippets directly in Dev Mode
**HTML Output**: Plain HTML with inline CSS styling
**Tailwind Output**: HTML with Tailwind CSS utility classes
**Full Styling Support**: Colors, typography, spacing, borders, shadows, opacity, and more
**Auto-layout Support**: Converts Figma auto-layout frames to flexbox
**Responsive**: Handles both fixed and responsive sizing modes

## Prerequisites

Before you begin, ensure you have the following installed:

**Node.js** (v14 or later): [Download Node.js](https://nodejs.org/)
**npm** (comes with Node.js)
**Figma Desktop App**: [Download Figma](https://www.figma.com/downloads/)

## Installation

### Option 1: Clone from GitHub

```powershell
git clone https://github.com/IADT-CC-Y4-MP/project-proposal-sample-code-MatthewDent03.git
cd project-proposal-sample-code-MatthewDent03/CodeGenTestPlugin
```

### Option 2: Extract from Local Directory

```powershell
# Navigate to the plugin directory
cd "c:\Users\Mattd\OneDrive - Dun Laoghaire Institute of Art, Design and Technology\MajorProject\InitialResearch\CodeGenTestPlugin"
```

### Install Dependencies

Once in the plugin directory:

```powershell
npm install
```

## Building the Plugin

The plugin source code is written in TypeScript and needs to be compiled to JavaScript before use.

### Build Once

```powershell
npm run build
```

This command:

Compiles TypeScript files in the `Source/` directory
Generates `Source/code.js` (plugin logic)
Uses the configuration in `Source/tsconfig.json`

### Build in Watch Mode

For active development, use watch mode to automatically rebuild on file changes:

```powershell
npm run watch
```

Or:

```powershell
npm run build -- --watch
```

## Setting Up the Plugin in Figma

### **Design Mode Setup**

1. **Open Figma Desktop App**
   Launch the Figma application on your computer

2. **Access Plugins Menu**
   Click **Plugins** → **Development** → **New plugin...**
   Or use the keyboard shortcut: `Ctrl+Alt+P` (Windows) / `Cmd+Option+P` (Mac)

3. **Link to Manifest**
   Select "Link existing plugin"
   Navigate to and select the `Source/manifest.json` file in your plugin directory
   Click **Open** or **Link**

4. **Run the Plugin**
   Open any Figma design file
   Go to **Plugins** → **Development** → **Simple HTML Codegen**
   The plugin panel will appear on the right side
   Select any layer or frame to inspect its properties

### **Dev Mode Setup**

Dev Mode allows you to use the plugin as a code generator within Figma's native codegen interface.

1. **Enable Dev Mode**
   Open Figma
   Click the toggle to enable **Dev Mode** (usually in the top left corner)
   Your workspace will switch to the Dev interface

2. **Link the Plugin**
   Click **Plugins** → **Create plugin**
   Select "Link existing plugin"
   Navigate to `Source/manifest.json` and link it
   The plugin will be registered for Dev Mode use

3. **Use in Dev Mode**
   Open a file in Dev Mode
   Select any layer or frame
   Go to the **Code** panel on the right
   You should see:
   **HTML** - Plain HTML with inline styles
   **TAILWIND_HTML** - HTML with Tailwind CSS classes
   Click on either option to generate code
   Copy the generated code directly into your project

## File Structure

```
CodeGenTestPlugin/
├── package.json              # Project metadata and scripts
├── tsconfig.json             # TypeScript configuration (root)
├── README.md                 # This file
├── Source/
│   ├── code.ts              # Main plugin logic (TypeScript)
│   ├── code.js              # Compiled plugin (generated)
│   ├── manifest.json        # Plugin configuration for Figma
│   ├── tsconfig.json        # TypeScript configuration (Source)
│   ├── ui.html              # UI panel for Design Mode
└── Docs/
    └── ...                  # Documentation files
```

## Manifest Configuration

The `Source/manifest.json` file defines the plugin's behavior:

```json
{
  "name": "Simple HTML Codegen",
  "id": "1573026597684374431",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma", "dev"],
  "capabilities": ["codegen"],
  "codegenLanguages": [
    { "label": "HTML", "value": "HTML" },
    { "label": "Tailwind HTML", "value": "TAILWIND_HTML" }
  ]
}
```

**Key Properties:**

`name`: Display name in Figma
`id`: Unique plugin identifier
`main`: Compiled plugin entry point (`code.js`)
`ui`: UI panel for Design Mode (`ui.html`)
`editorType`: Supported Figma modes (`figma` = Design Mode, `dev` = Dev Mode)
`capabilities`: Features the plugin uses (`codegen` enables code generation)
`codegenLanguages`: Available output formats

## Troubleshooting

### Plugin Not Appearing in Figma

1. **Rebuild the TypeScript**

   ```powershell
   npm run build
   ```

2. **Check the Manifest Path**
   Ensure you're pointing to the correct `Source/manifest.json`
   The manifest must be in the same directory as `code.js`

3. **Restart Figma**
   Close and reopen the Figma application

### TypeScript Compilation Errors

1. **Check Node Modules**

   ```powershell
   npm install
   ```

2. **Rebuild**

   ```powershell
   npm run build
   ```

3. **Check Errors**
   Review the terminal output for specific error messages
   Ensure all TypeScript syntax is correct in `Source/code.ts`

### Code Generation Not Working in Dev Mode

1. **Verify editorType in manifest.json**
   Should include: `"editorType": ["figma", "dev"]`

2. **Verify capabilities in manifest.json**
   Should include: `"capabilities": ["codegen"]`

3. **Relink the plugin**
   Remove the plugin and link it again to the manifest

## Development Workflow

1. **Make changes** to files in the `Source/` directory (especially `Source/code.ts`)

2. **Watch for changes** (recommended):

   ```powershell
   npm run watch
   ```

3. **Reload in Figma**:
   - Press `Ctrl+R` (Windows) or `Cmd+R` (Mac) in Figma to reload the plugin

4. **Test** your changes by selecting layers and generating code

## Linting

To check code quality:

```powershell
npm run lint
```

To automatically fix linting issues:

```powershell
npm run lint:fix
```

## Available Commands

| Command            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `npm run build`    | Compile TypeScript to JavaScript            |
| `npm run watch`    | Watch for changes and rebuild automatically |
| `npm run lint`     | Check code for style and type issues        |
| `npm run lint:fix` | Automatically fix linting issues            |

## Output Formats

### HTML Output

Plain HTML with inline CSS styling:

```html
<div style="width:200px; height:100px; background:#ffffff; border-radius:8px;">
  <p style="font-size:16px; color:#000000;">Hello World</p>
</div>
```

### Tailwind HTML Output

HTML using Tailwind CSS utility classes:

```html
<div class="w-52 h-24 bg-white rounded-lg flex flex-col gap-4">
  <p class="text-base text-black">Hello World</p>
</div>
```

## Additional Resources

[Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
[Figma Plugin Samples](https://github.com/figma/plugin-samples)
[Tailwind CSS Documentation](https://tailwindcss.com/docs)
[TypeScript Documentation](https://www.typescriptlang.org/docs/)
