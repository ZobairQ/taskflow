import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import { GamificationProvider } from './GamificationContext';

test('renders taskflow title', () => {
  render(
    <GamificationProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GamificationProvider>
  );
  // Use getByRole to target the h1 specifically
  const titleElement = screen.getByRole('heading', { level: 1 });
  expect(titleElement).toBeInTheDocument();
  expect(titleElement.textContent).toContain('Task');
});
