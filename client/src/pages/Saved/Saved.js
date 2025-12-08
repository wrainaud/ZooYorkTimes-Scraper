import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/API';
import './Saved.css';

class Saved extends Component {
  state = {
    articles: [],
    isLoading: true,
    toast: null,
    deleteConfirm: null
  };

  componentDidMount() {
    this.loadArticles();
  }

  showToast = (message, type = 'success') => {
    this.setState({ toast: { message, type } });
    setTimeout(() => this.setState({ toast: null }), 3000);
  };

  loadArticles = () => {
    this.setState({ isLoading: true });
    API.getSavedArticles()
      .then(res => {
        this.setState({
          articles: res.data,
          isLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
        this.showToast('Failed to load saved articles.', 'error');
      });
  };

  deleteArticle = id => {
    API.deleteArticle(id)
      .then(res => {
        this.loadArticles();
        this.showToast('Article removed from your collection.', 'success');
        this.setState({ deleteConfirm: null });
      })
      .catch(err => {
        console.log(err);
        this.showToast('Failed to delete article.', 'error');
      });
  };

  formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  render() {
    const { articles, isLoading, toast, deleteConfirm } = this.state;

    return (
      <div className="saved-page">
        {/* Page Header */}
        <header className="page-header">
          <h1>Your Collection</h1>
          <p>Articles you've saved for later reading</p>
        </header>

        {/* Stats Bar */}
        {articles.length > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span><strong>{articles.length}</strong> saved article{articles.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Articles Section */}
        <section className="saved-section">
          {isLoading ? (
            <div className="articles-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="article-card skeleton-card">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="articles-grid">
              {articles.map(article => (
                <article key={article._id} className="article-card saved-article-card">
                  <div className="article-card-content">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-title"
                    >
                      {article.title}
                    </a>

                    <div className="article-meta">
                      <span className="article-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {this.formatDate(article.date)}
                      </span>
                    </div>
                  </div>

                  <div className="article-actions">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Read Now
                    </a>
                    {deleteConfirm === article._id ? (
                      <div className="delete-confirm">
                        <span className="delete-confirm-text">Delete?</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => this.deleteArticle(article._id)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => this.setState({ deleteConfirm: null })}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => this.setState({ deleteConfirm: article._id })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>No Saved Articles Yet</h3>
              <p>Start building your reading list by saving articles from your search results.</p>
              <Link to="/" className="btn btn-primary btn-lg mt-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Start Searching
              </Link>
            </div>
          )}
        </section>

        {/* Toast Notification */}
        {toast && (
          <div className="toast-container">
            <div className={`toast toast-${toast.type}`}>
              {toast.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Saved;
