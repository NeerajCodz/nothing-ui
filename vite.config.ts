import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@nothing-ui/tokens': path.resolve(__dirname, 'packages/tokens/src'),
        '@nothing-ui/core': path.resolve(__dirname, 'packages/core/src'),
        '@nothing-ui/dot-icons/react': path.resolve(__dirname, 'packages/dot-icons/src/react'),
        '@nothing-ui/dot-icons/native': path.resolve(__dirname, 'packages/dot-icons/src/native'),
        '@nothing-ui/dot-icons': path.resolve(__dirname, 'packages/dot-icons/src'),
        '@nothing-ui/ui': path.resolve(__dirname, 'packages/ui/src'),
        '@nothing-ui/ui-native': path.resolve(__dirname, 'packages/ui-native/src'),
        '@nothing-ui/registry': path.resolve(__dirname, 'packages/registry/src'),
        '@nothing-ui/cli': path.resolve(__dirname, 'packages/cli/src'),
        '@apps/ui': path.resolve(__dirname, 'apps/ui/src'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
