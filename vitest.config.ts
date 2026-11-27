import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nothing-ui/tokens': path.resolve(rootDir, 'packages/tokens/src'),
      '@nothing-ui/core': path.resolve(rootDir, 'packages/core/src'),
      '@nothing-ui/dot-icons/react': path.resolve(rootDir, 'packages/dot-icons/src/react'),
      '@nothing-ui/dot-icons/native': path.resolve(rootDir, 'packages/dot-icons/src/native'),
      '@nothing-ui/dot-icons': path.resolve(rootDir, 'packages/dot-icons/src'),
      '@nothing-ui/ui': path.resolve(rootDir, 'packages/ui/src'),
      '@nothing-ui/ui-native': path.resolve(rootDir, 'packages/ui-native/src'),
      '@nothing-ui/registry': path.resolve(rootDir, 'packages/registry/src'),
      '@nothing-ui/cli': path.resolve(rootDir, 'packages/cli/src'),
      '@apps/ui': path.resolve(rootDir, 'apps/ui/src'),
      '@': path.resolve(rootDir, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    // The dot-icon explorer renders 1,600+ icons; the 5s default is too tight on CI runners.
    testTimeout: 30_000,
  },
});
