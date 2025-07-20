import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLocalStorage } from '@test/utils.jsx'
import Notes from '../Notes'

describe('Notes', () => {
  beforeEach(() => {
    mockLocalStorage({
      'notes-data': JSON.stringify([
        {
          id: '1',
          title: 'Test Note 1',
          content: 'This is a test note',
          createdAt: '2024-01-01T12:00:00Z',
          updatedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: '2',
          title: 'Test Note 2',
          content: 'Another test note',
          createdAt: '2024-01-01T13:00:00Z',
          updatedAt: '2024-01-01T13:00:00Z'
        }
      ]),
      'notes-settings': JSON.stringify({
        autoSave: true,
        markdown: true,
        theme: 'dark'
      })
    })
  })

  it('renders notes component', () => {
    renderWithProviders(<Notes />)
    
    expect(screen.getByTestId('notes-component')).toBeInTheDocument()
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.getByText('Test Note 2')).toBeInTheDocument()
  })

  it('creates a new note', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const newNoteButton = screen.getByText(/new note/i)
    await user.click(newNoteButton)
    
    expect(screen.getByPlaceholderText(/note title/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/start writing/i)).toBeInTheDocument()
  })

  it('edits an existing note', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const noteItem = screen.getByText('Test Note 1')
    await user.click(noteItem)
    
    const titleInput = screen.getByDisplayValue('Test Note 1')
    const contentTextarea = screen.getByDisplayValue('This is a test note')
    
    expect(titleInput).toBeInTheDocument()
    expect(contentTextarea).toBeInTheDocument()
  })

  it('saves note changes automatically', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    // Open first note
    const noteItem = screen.getByText('Test Note 1')
    await user.click(noteItem)
    
    // Edit content
    const contentTextarea = screen.getByDisplayValue('This is a test note')
    await user.clear(contentTextarea)
    await user.type(contentTextarea, 'Updated note content')
    
    // Wait for auto-save
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'notes-data',
        expect.stringContaining('Updated note content')
      )
    }, { timeout: 3000 })
  })

  it('deletes a note', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    // Open first note
    const noteItem = screen.getByText('Test Note 1')
    await user.click(noteItem)
    
    // Click delete button
    const deleteButton = screen.getByLabelText(/delete note/i)
    await user.click(deleteButton)
    
    // Confirm deletion
    const confirmButton = screen.getByText(/confirm/i)
    await user.click(confirmButton)
    
    expect(screen.queryByText('Test Note 1')).not.toBeInTheDocument()
  })

  it('searches notes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const searchInput = screen.getByPlaceholderText(/search notes/i)
    await user.type(searchInput, 'Test Note 1')
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument()
  })

  it('filters notes by date', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const filterButton = screen.getByLabelText(/filter notes/i)
    await user.click(filterButton)
    
    const dateFilter = screen.getByLabelText(/created after/i)
    await user.type(dateFilter, '2024-01-01')
    
    const applyButton = screen.getByText(/apply filter/i)
    await user.click(applyButton)
    
    // Both notes should still be visible as they match the filter
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.getByText('Test Note 2')).toBeInTheDocument()
  })

  it('exports notes', async () => {
    const user = userEvent.setup()
    
    // Mock URL.createObjectURL and click
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockClick = vi.fn()
    
    vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL })
    
    // Mock createElement to return element with click method
    const mockElement = { click: mockClick, href: '', download: '' }
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement)
    
    renderWithProviders(<Notes />)
    
    const exportButton = screen.getByLabelText(/export notes/i)
    await user.click(exportButton)
    
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })

  it('imports notes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const importButton = screen.getByLabelText(/import notes/i)
    
    // Mock file input
    const file = new File(['[{"title":"Imported Note","content":"Imported content"}]'], 'notes.json', {
      type: 'application/json'
    })
    
    const fileInput = screen.getByLabelText(/import file/i)
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText('Imported Note')).toBeInTheDocument()
    })
  })

  it('renders markdown preview', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    // Open first note
    const noteItem = screen.getByText('Test Note 1')
    await user.click(noteItem)
    
    // Add markdown content
    const contentTextarea = screen.getByDisplayValue('This is a test note')
    await user.clear(contentTextarea)
    await user.type(contentTextarea, '# Heading\n\n**Bold text**')
    
    // Toggle preview
    const previewButton = screen.getByText(/preview/i)
    await user.click(previewButton)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading')
    expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold')
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    // Ctrl+N for new note
    await user.keyboard('{Control>}n{/Control}')
    expect(screen.getByPlaceholderText(/note title/i)).toBeInTheDocument()
    
    // Escape to close
    await user.keyboard('{Escape}')
    expect(screen.queryByPlaceholderText(/note title/i)).not.toBeInTheDocument()
  })

  it('sorts notes by different criteria', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Notes />)
    
    const sortButton = screen.getByLabelText(/sort notes/i)
    await user.click(sortButton)
    
    const sortByTitle = screen.getByText(/sort by title/i)
    await user.click(sortByTitle)
    
    // Notes should be reordered (Test Note 1 should come before Test Note 2)
    const noteItems = screen.getAllByTestId(/note-item/)
    expect(noteItems[0]).toHaveTextContent('Test Note 1')
    expect(noteItems[1]).toHaveTextContent('Test Note 2')
  })

  it('is accessible', () => {
    renderWithProviders(<Notes />)
    
    const notesComponent = screen.getByTestId('notes-component')
    expect(notesComponent).toHaveAttribute('role', 'main')
    
    const notesList = screen.getByRole('list')
    expect(notesList).toHaveAttribute('aria-label', 'Notes list')
    
    const searchInput = screen.getByPlaceholderText(/search notes/i)
    expect(searchInput).toHaveAttribute('aria-label', 'Search notes')
  })

  it('handles empty state', () => {
    mockLocalStorage({ 'notes-data': JSON.stringify([]) })
    
    renderWithProviders(<Notes />)
    
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
    expect(screen.getByText(/create your first note/i)).toBeInTheDocument()
  })

  it('handles corrupted data gracefully', () => {
    mockLocalStorage({ 'notes-data': 'invalid json' })
    
    renderWithProviders(<Notes />)
    
    // Should show empty state instead of crashing
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })
})