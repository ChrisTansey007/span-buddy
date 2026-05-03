import { render, screen, act, fireEvent } from '@testing-library/react';
import { HeaderInput } from './HeaderInput';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('HeaderInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all input fields', () => {
    render(<HeaderInput onSubmit={mockOnSubmit} />);
    
    // Check that all labels are present
    expect(screen.getByLabelText('Project Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Span (feet)')).toBeInTheDocument();
    expect(screen.getByLabelText('Load Width (inches)')).toBeInTheDocument();
    expect(screen.getByLabelText('Stories Supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Species')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade')).toBeInTheDocument();
    
    // Check that inputs are present
    expect(screen.getByPlaceholderText('Enter project name or address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter header span')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter load width')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    render(<HeaderInput onSubmit={mockOnSubmit} />);
    
    // Fill in the form
    const projectInput = screen.getByPlaceholderText('Enter project name or address');
    const spanInput = screen.getByPlaceholderText('Enter header span');
    const loadWidthInput = screen.getByPlaceholderText('Enter load width');
    const storiesSelect = screen.getByLabelText('Stories Supported');
    const speciesSelect = screen.getByLabelText('Species');
    const gradeSelect = screen.getByLabelText('Grade');
    
    // Change inputs
    fireEvent.change(projectInput, { target: { value: 'Test Project' } });
    fireEvent.change(spanInput, { target: { value: '8' } });
    fireEvent.change(loadWidthInput, { target: { value: '12' } });
    
    // @ts-ignore
    storiesSelect.value = '2';
    // @ts-ignore
    storiesSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // @ts-ignore
    speciesSelect.value = 'Southern Pine';
    // @ts-ignore
    speciesSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // @ts-ignore
    gradeSelect.value = '#2';
    // @ts-ignore
    gradeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Submit the form
    const form = screen.getByRole('form');
    // @ts-ignore
    act(() => {
      fireEvent.submit(form);
    });
    
    // Verify onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      projectLabel: 'Test Project',
      headerSpanFeet: '8',
      loadWidthInches: '12',
      stories: '2',
      headerSpecies: 'Southern Pine',
      headerGrade: '#2'
    });
  });
});