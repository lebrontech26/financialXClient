import '@testing-library/jest-dom';

// Activa el modo mock para pruebas de UI.
if (typeof process !== 'undefined' && process.env) {
  process.env.VITE_USAR_MOCKS = 'true';
}

if (typeof globalThis !== 'undefined') {
  globalThis.__VITE_USAR_MOCKS__ = true;
  globalThis.__MOCK_DELAY_MS__ = 0;
}
