import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders cancelled status with correct label and styling', () => {
    render(<StatusBadge status="cancelled" />);
    
    const badge = screen.getByText('Annulée');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
  });

  it('renders all status types correctly', () => {
    const statuses = ['paid', 'sent', 'draft', 'partial', 'overdue', 'cancelled'];
    
    statuses.forEach(status => {
      const { unmount } = render(<StatusBadge status={status} />);
      const badge = screen.getByText(/./);
      expect(badge).toBeInTheDocument();
      unmount();
    });
  });

  it('handles unknown status with fallback styling', () => {
    render(<StatusBadge status="unknown" />);
    
    const badge = screen.getByText('unknown');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
  });
});
