import { render, screen, act, fireEvent } from '@testing-library/react';
import { JoistInput } from './JoistInput';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('JoistInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all input fields', () => {
    render(<JoistInput onSubmit={mockOnSubmit} />);
    
    // Check that all labels are present
    expect(screen.getByLabelText('Project Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Span (feet)')).toBeInTheDocument();
    expect(screen.getByLabelText('Spacing (inches)')).toBeInTheDocument();
    expect(screen.getByLabelText('Species/Grade')).toBeInTheDocument();
    expect(screen.getByLabelText('Live Load (psf)')).toBeInTheDocument();
    
    // Check that inputs are present
    expect(screen.getByPlaceholderText('Enter project name or address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter span length')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter joist spacing')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    render(<JoistInput onSubmit={mockOnSubmit} />);
    
    // Fill in the form
    const projectInput = screen.getByPlaceholderText('Enter project name or address');
    const spanInput = screen.getByPlaceholderText('Enter span length');
    const spacingInput = screen.getByPlaceholderText('Enter joist spacing');
    const speciesSelect = screen.getByLabelText('Species/Grade');
    const loadSelect = screen.getByLabelText('Live Load (psf)');
    
    // Change inputs
    fireEvent.change(projectInput, { target: { value: 'Test Project' } });
    fireEvent.change(spanInput, { target: { value: '10' } });
    fireEvent.change(spacingInput, { target: { value: '16' } });
    fireEvent.change(speciesSelect, { target: { value: 'Spruce-Pine-Fir #2' } });
    fireEvent.change(loadSelect, { target: { value: '30' } });
    
    // Submit the form
    const form = screen.getByRole('form');
    // @ts-ignore
    act(() => {
      fireEvent.submit(form);
    });
    
    // Verify onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      projectLabel: 'Test Project',
      spanFeet: '10',
      spacingInches: '16',
      speciesGrade: 'Spruce-Pine-Fir #2',
      loadCategory: '30'
    });
  });
});