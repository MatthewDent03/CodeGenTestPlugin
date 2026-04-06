# CodeGen Test Plugin for Figma

A Figma plugin that converts design layers into HTML with support for both plain HTML with inline styles and Tailwind CSS utilities. The plugin works in both **Design Mode** and **Dev Mode** codegen.

## Features

- **Design-system style panel UI** in Figma Design Mode with collapsible sections
- **Editable layer properties** (size, position, typography, spacing, fills, strokes, etc.)
- **Tailwind token browser** with category tabs (`Colors`, `Spacing`, `Typography`, `Effects`, `Gradients`)
- **Alphabetical color groups + A–Z quick filters** in Tailwind color tokens
- **Token search** with live filtering
- **Custom token support** for colors and gradients (save + reuse)
- **Gradient builder** (multiple color stops + saved gradients)
- **Live code preview** with mode switching:
  - HTML + CSS
  - HTML + Tailwind
  - React + Tailwind
- **One-click Copy / Download** from preview panel
- **Undo button in plugin UI** (uses Figma undo stack)
- **Pop-out mode + resizable panel support** for larger editing workflows
- **Dev Mode codegen support** for HTML, Tailwind HTML, and React Tailwind
- **Auto-layout support** for flex conversion and spacing interpretation

## Prerequisites

Before you begin, ensure you have the following installed:

**Node.js** (v14 or later): [Download Node.js](https://nodejs.org/)
**npm** (comes with Node.js)
**Figma Desktop App**: [Download Figma](https://www.figma.com/downloads/)

### Important (first-time setup on a new machine)

If you install Node.js after VS Code is already open, `npm` may not be recognized in existing terminals.

After installing Node.js:

1. Close **all** VS Code windows completely
2. Reopen VS Code
3. Open a new terminal
4. Verify installation:

```powershell
node -v
npm -v
```

If both commands return versions, continue with `npm install`.

## Installation

### Option 1 (Recommended): Clone via SSH

```powershell
git clone git@github.com:MatthewDent03/CodeGenTestPlugin.git
cd CodeGenTestPlugin
git checkout my-code
git pull origin my-code
```

### Option 2: Clone via HTTPS (fallback)

```powershell
git clone https://github.com/MatthewDent03/CodeGenTestPlugin.git
cd CodeGenTestPlugin
git checkout my-code
git pull origin my-code
```

This project is tested from the `my-code` branch. Make sure you're on that branch before installing dependencies and building.

### Option 3: Extract from Local Directory

```powershell
# Navigate to the plugin directory
cd "c:\Users\Mattd\OneDrive - Dun Laoghaire Institute of Art, Design and Technology\MajorProject\InitialResearch\CodeGenTestPlugin"
```

### Install Dependencies

Once in the plugin directory:

```powershell
npm install
```

If you get an error like `npm is not recognized`, install Node.js and restart VS Code fully (see the prerequisite note above).

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

## Setting Up the Plugin in Figma

### **Design Mode Setup**

1. **Open Figma Desktop App**
   Launch the Figma application on your computer

2. **Access Plugins Menu**
   Click **Plugins** → **Development** → **Import Plugin from Manifest...**
   Or use the keyboard shortcut: `Ctrl+Alt+P` (Windows) / `Cmd+Option+P` (Mac)

3. **Import the Manifest File**
   In the file picker, navigate to your project folder
   Select `Source/manifest.json`
   Click **Open**

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

2. **Import the Plugin Manifest**
   Click **Plugins** → **Development** → **Import Plugin from Manifest...**
   Select `Source/manifest.json`
   Click **Open**
   The plugin will be registered and available in Dev Mode

3. **Use in Dev Mode**
   Open a file in Dev Mode
   Select any layer or frame
   Go to the **Code** panel on the right
   You should see:
   **HTML** - Plain HTML with inline styles
   **TAILWIND_HTML** - HTML with Tailwind CSS classes
   **REACT_TAILWIND** - React component-style Tailwind output
   Click on any option to generate code
   Copy the generated code directly into your project

## File Structure

```
CodeGenTestPlugin/
├── package.json              # Project metadata and scripts
├── tsconfig.json             # TypeScript configuration (root)
├── README.md                 # This file
├── Source/
│   ├── code.ts               # Main plugin logic (TypeScript)
│   ├── code.js               # Compiled plugin bundle (generated)
│   ├── manifest.json         # Plugin configuration for Figma
│   ├── tsconfig.json         # TypeScript config used by build/typecheck
│   ├── ui.html               # Design Mode UI panel
│   └── main/
│       ├── codegen/          # HTML / React-Tailwind generators
│       ├── converters/       # Unit/property conversion helpers
│       ├── formatters/       # Tailwind formatting helpers
│       ├── tokens/           # Token maps and registries
│       └── utils/            # Shared color/layout/font/css utilities
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
  "ui": { "main": "ui.html" },
  "editorType": ["figma", "dev"],
  "capabilities": ["codegen"],
  "codegenLanguages": [
    { "label": "HTML", "value": "HTML" },
    { "label": "Tailwind HTML", "value": "TAILWIND_HTML" },
    { "label": "React Tailwind", "value": "REACT_TAILWIND" }
  ],
  "documentAccess": "dynamic-page",
  "networkAccess": { "allowedDomains": ["none"] }
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

   If npm is unavailable, install Node.js and restart VS Code before retrying.

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

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run build`     | Compile TypeScript to JavaScript             |
| `npm run typecheck` | Type-check TypeScript without emitting files |
| `npm run bundle`    | Bundle `Source/code.ts` to `Source/code.js`  |
| `npm run watch`     | Watch for changes and rebuild automatically  |
| `npm run lint`      | Check code for style and type issues         |
| `npm run lint:fix`  | Automatically fix linting issues             |

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

### React + Tailwind Output

React component-style output using Tailwind classes:

```jsx
export default function Component() {
  return (
    <div className="w-52 h-24 bg-white rounded-lg flex flex-col gap-4">
      <p className="text-base text-black">Hello World</p>
    </div>
  );
}
```

## Additional Resources

[Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
[Figma Plugin Samples](https://github.com/figma/plugin-samples)
[Tailwind CSS Documentation](https://tailwindcss.com/docs)
[TypeScript Documentation](https://www.typescriptlang.org/docs/)
