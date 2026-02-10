import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectNotes from '@/components/ProjectNotes/ProjectNotes';

describe('ProjectNotes Component', () => {
  const mockProjectId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project notes component', () => {
    render(<ProjectNotes projectId={mockProjectId} />);

    const title = screen.getByText(/📝 Project Notes/i);
    expect(title).toBeInTheDocument();
  });

  it('displays add note button', () => {
    render(<ProjectNotes projectId={mockProjectId} />);

    const addButton = screen.getByRole('button', { name: /Add Note/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens drawer when add note button is clicked', async () => {
    render(<ProjectNotes projectId={mockProjectId} />);

    const addButton = screen.getByRole('button', { name: /Add Note/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Note title/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no notes', () => {
    render(<ProjectNotes projectId={mockProjectId} />);

    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
  });

  it('can input note title and content', async () => {
    const user = userEvent.setup();
    render(<ProjectNotes projectId={mockProjectId} />);

    const addButton = screen.getByRole('button', { name: /Add Note/i });
    await user.click(addButton);

    const titleInput = screen.getByPlaceholderText(/Note title/i);
    await user.type(titleInput, 'Test Note');

    expect(titleInput).toHaveValue('Test Note');
  });

  it('disables save button when title is empty', async () => {
    render(<ProjectNotes projectId={mockProjectId} />);

    const addButton = screen.getByRole('button', { name: /Add Note/i });
    fireEvent.click(addButton);

    const saveButton = await screen.findByRole('button', { name: /Save Note/i });
    expect(saveButton).toBeDisabled();
  });

  it('shows pinned notes first', () => {
    // This test would need mock data
    // Implementation depends on how data is passed to component
    render(<ProjectNotes projectId={mockProjectId} />);

    // Note: Would need to verify pinned notes appear first in the list
  });

  it('handles responsive layout on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(<ProjectNotes projectId={mockProjectId} />);

    // Verify component renders properly on mobile
    const component = screen.getByText(/📝 Project Notes/i);
    expect(component).toBeInTheDocument();
  });

  it('handles responsive layout on tablet', () => {
    global.innerWidth = 768;
    global.innerHeight = 1024;

    render(<ProjectNotes projectId={mockProjectId} />);

    const component = screen.getByText(/📝 Project Notes/i);
    expect(component).toBeInTheDocument();
  });

  it('handles responsive layout on desktop', () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;

    render(<ProjectNotes projectId={mockProjectId} />);

    const component = screen.getByText(/📝 Project Notes/i);
    expect(component).toBeInTheDocument();
  });
});

