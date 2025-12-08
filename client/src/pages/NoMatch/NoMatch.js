import React from "react";
import { Link } from "react-router-dom";
import "./NoMatch.css";

const NoMatch = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <div className="not-found-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary btn-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Go Home
        </Link>
        <Link to="/saved" className="btn btn-outline btn-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          View Saved
        </Link>
      </div>
    </div>
  </div>
);

export default NoMatch;
