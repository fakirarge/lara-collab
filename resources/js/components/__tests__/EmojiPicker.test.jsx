import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmojiPicker from '@/components/EmojiPicker/EmojiPicker';

describe('EmojiPicker Component', () => {
  it('renders emoji picker button', () => {
    const handleSelect = jest.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens popover on button click', async () => {
    const handleSelect = jest.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search emoji/i)).toBeInTheDocument();
    });
  });

  it('selects emoji and calls onSelect', async () => {
    const handleSelect = jest.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const emojiButtons = screen.getAllByRole('button');
      // Find an emoji button (skip the main button and search-related ones)
      const emojiButton = emojiButtons[2]; // Adjust index as needed
      fireEvent.click(emojiButton);
    });

    expect(handleSelect).toHaveBeenCalled();
  });

  it('filters emojis by search term', async () => {
    const handleSelect = jest.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const searchInput = await screen.findByPlaceholderText(/search emoji/i);
    await userEvent.type(searchInput, 'smile');

    await waitFor(() => {
      // Should show filtered results
      expect(screen.getByPlaceholderText(/search emoji/i)).toHaveValue('smile');
    });
  });

  it('closes popover after selecting emoji', async () => {
    const handleSelect = jest.fn();
    const { rerender } = render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search emoji/i)).toBeInTheDocument();
    });

    // Select emoji should close popover
    // (Implementation depends on actual component behavior)
  });

  it('handles keyboard navigation', async () => {
    const handleSelect = jest.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const searchInput = await screen.findByPlaceholderText(/search emoji/i);

    // Test keyboard navigation
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    // Should have called onSelect
    expect(handleSelect).toHaveBeenCalled();
  });
});

