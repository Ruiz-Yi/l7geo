import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPluginImport from 'vite-plugin-monaco-editor';

const monacoEditorPlugin = monacoEditorPluginImport.default || monacoEditorPluginImport;

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'css', 'html', 'typescript'],
    }),
  ],
});
