import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublisherCard } from './PublisherCard';

const mockPublisher = {
  id: '11111111-1111-1111-1111-111111111101',
  name: 'El Tecolote',
  neighborhoods: ['Mission'],
  reach: 12400,
  languages: ['English', 'Spanish'],
  startingPrice: 1900, // cents
};

describe('PublisherCard', () => {
  it('renders publisher info', () => {
    render(<PublisherCard publisher={mockPublisher} selected={false} onToggle={() => {}} />);
    expect(screen.getByText('El Tecolote')).toBeInTheDocument();
    expect(screen.getByText(/Mission/)).toBeInTheDocument();
    expect(screen.getByText(/12.4K/)).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<PublisherCard publisher={mockPublisher} selected={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(mockPublisher.id);
  });

  it('shows selected state', () => {
    render(<PublisherCard publisher={mockPublisher} selected={true} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('border-teal-500');
  });
});
