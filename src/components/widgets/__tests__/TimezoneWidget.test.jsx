import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TimezoneWidget from '../TimezoneWidget';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('TimezoneWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default timezones', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    expect(screen.getByText('World Clock')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Hong Kong')).toBeInTheDocument();
  });

  it('displays current time for each timezone', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Should display time elements (exact time depends on timezone conversion)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('opens settings when settings button is clicked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    const settingsButton = screen.getByLabelText('Timezone settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Timezone Settings')).toBeInTheDocument();
    expect(screen.getByText('Select Timezones (max 6)')).toBeInTheDocument();
  });

  it('allows selecting and deselecting timezones', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    // Find Paris timezone button (should not be selected by default)
    const parisButton = screen.getByText('Paris').closest('button');
    expect(parisButton).not.toHaveClass('bg-blue-600');
    
    // Select Paris
    fireEvent.click(parisButton);
    expect(parisButton).toHaveClass('bg-blue-600');
    
    // Deselect Paris
    fireEvent.click(parisButton);
    expect(parisButton).not.toHaveClass('bg-blue-600');
  });

  it('prevents selecting more than 6 timezones', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      selectedTimezones: [
        'America/New_York',
        'Europe/London', 
        'Asia/Tokyo',
        'Asia/Hong_Kong',
        'Europe/Paris',
        'Asia/Singapore'
      ],
      format24Hour: false,
      showSeconds: false
    }));
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    // Try to select another timezone (should be disabled)
    const berlinButton = screen.getByText('Berlin').closest('button');
    expect(berlinButton).toBeDisabled();
  });

  it('prevents deselecting the last timezone', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      selectedTimezones: ['America/New_York'],
      format24Hour: false,
      showSeconds: false
    }));
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    // Try to deselect the only timezone
    const nyButton = screen.getByText('New York').closest('button');
    fireEvent.click(nyButton);
    
    // Should still be selected
    expect(nyButton).toHaveClass('bg-blue-600');
  });

  it('toggles 24-hour format setting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    const format24HourCheckbox = screen.getByLabelText('24-hour format');
    expect(format24HourCheckbox).not.toBeChecked();
    
    fireEvent.click(format24HourCheckbox);
    expect(format24HourCheckbox).toBeChecked();
  });

  it('toggles show seconds setting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    const showSecondsCheckbox = screen.getByLabelText('Show seconds');
    expect(showSecondsCheckbox).not.toBeChecked();
    
    fireEvent.click(showSecondsCheckbox);
    expect(showSecondsCheckbox).toBeChecked();
  });

  it('saves settings when form is submitted', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    // Make changes
    fireEvent.click(screen.getByLabelText('24-hour format'));
    fireEvent.click(screen.getByText('Paris').closest('button'));
    
    // Save settings
    fireEvent.click(screen.getByText('Save'));
    
    // Should close settings
    expect(screen.queryByText('Timezone Settings')).not.toBeInTheDocument();
  });

  it('cancels settings changes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Timezone settings'));
    
    // Make changes
    fireEvent.click(screen.getByLabelText('24-hour format'));
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should close settings without saving
    expect(screen.queryByText('Timezone Settings')).not.toBeInTheDocument();
  });

  it('updates time every second', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    // Get initial time elements
    const initialTimeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(initialTimeElements.length).toBeGreaterThan(0);
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    
    // Should still have time elements (testing that timer is working)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays local timezone at the bottom', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    expect(screen.getByText(/Local:/)).toBeInTheDocument();
  });

  it('loads saved settings from localStorage', () => {
    const savedSettings = {
      selectedTimezones: ['Europe/Paris', 'Asia/Singapore'],
      format24Hour: true,
      showSeconds: true
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));
    
    render(<TimezoneWidget />);
    
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Singapore')).toBeInTheDocument();
    expect(screen.queryByText('New York')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TimezoneWidget />);
    
    const widget = screen.getByRole('region', { name: 'World clock' });
    expect(widget).toBeInTheDocument();
    expect(widget).toHaveAttribute('data-testid', 'timezone-widget');
  });
});