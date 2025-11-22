import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the app title after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
        expect(screen.getByText('SmartPlanner')).toBeInTheDocument();
    });
  });
});
