/**
 * Navbar Component Tests
 * ======================
 * Tests the Navbar component rendering and navigation links.
 * Wrapped in MemoryRouter since Navbar uses react-router-dom hooks.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Helper: render Navbar inside MemoryRouter with default props
function renderNavbar(props = {}) {
  const defaults = {
    isLoggedIn: false,
    onLogout: vi.fn(),
  };
  return render(
    <MemoryRouter>
      <Navbar {...defaults} {...props} />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Test 9 — Navbar renders without crashing
// ---------------------------------------------------------------------------
describe('Navbar', () => {
  it('renders without crashing', () => {
    const { container } = renderNavbar();
    expect(container).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 10 — Login link is present when logged out
  // -------------------------------------------------------------------------
  it('shows login link when user is not logged in', () => {
    renderNavbar({ isLoggedIn: false });
    // ล็อกอิน = "ล็อกอิน" in Thai
    expect(screen.getByText('ล็อกอิน')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Test 11 — Brand name is visible
  // -------------------------------------------------------------------------
  it('displays the brand name KasetFair e-Reservation', () => {
    renderNavbar();
    expect(screen.getByText('KasetFair e-Reservation')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Test 12 — Register link is present when logged out
  // -------------------------------------------------------------------------
  it('shows register link when user is not logged in', () => {
    renderNavbar({ isLoggedIn: false });
    expect(screen.getByText('ลงทะเบียน')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Test 13 — Logout button appears when logged in
  // -------------------------------------------------------------------------
  it('shows logout button when user is logged in', () => {
    // Simulate a logged-in state
    localStorage.setItem('userName', 'ผู้ทดสอบ');
    localStorage.setItem('isLoggedIn', 'true');

    renderNavbar({ isLoggedIn: true });

    expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();

    // Cleanup
    localStorage.clear();
  });
});
