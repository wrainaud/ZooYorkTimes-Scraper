import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import './Nav.css';

const Nav = ({ location }) => {
  const isActive = (path) => location.pathname === path;

  return (
    <React.Fragment>
      {/* Desktop Navigation */}
      <nav className="top-navbar">
        <div className="navbar-container">
          <Link className="navbar-brand" to="/">
            <img src="/logo.png" alt="ZooYork Times Logo" className="brand-logo" />
          </Link>
          <div className="navbar-links">
            <Link
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              to="/"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Search</span>
            </Link>
            <Link
              className={`nav-link ${isActive('/saved') ? 'active' : ''}`}
              to="/saved"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Saved</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <Link
          className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}
          to="/"
        >
          <svg className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Search</span>
        </Link>
        <Link
          className={`mobile-nav-item ${isActive('/saved') ? 'active' : ''}`}
          to="/saved"
        >
          <svg className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Saved</span>
        </Link>
      </nav>
    </React.Fragment>
  );
};

export default withRouter(Nav);
