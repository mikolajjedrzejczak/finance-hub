import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    // Włączamy natywną obsługę ścieżek z tsconfig (bez zewnętrznej wtyczki)
    tsconfigPaths: true,
  },
});
