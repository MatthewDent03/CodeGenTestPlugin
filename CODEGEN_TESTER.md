# Codegen tester

This repository includes a minimal Codegen plugin handler so you can test code generation in Figma Dev Mode.

- Build: compile TypeScript to JavaScript

```powershell
npm install
npm run build
```

- In Figma: open a file in Dev Mode, open the Inspect panel -> Code dropdown -> choose `CodeGenTestPlugin` (or the plugin name). The plugin's `generate` callback will be invoked when the selection changes.

- What it returns: a small React JSX snippet and a plaintext section that include the selected node's name.

If you want to experiment, change `code.ts` and rebuild with `npm run build`.
