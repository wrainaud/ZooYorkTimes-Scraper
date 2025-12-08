import React, { Component } from 'react';
import API from '../../utils/API';
import './Main.css';

class Main extends Component {
  state = {
    articles: [],
    queryTerm: '',
    beginDate: '',
    endDate: '',
    dbAvailable: null,
    isLoading: false,
    toast: null
  };

  componentDidMount() {
    API.getHealth()
      .then(res => {
        const ok = res && res.data && res.data.dbConnected;
        this.setState({ dbAvailable: !!ok });
      })
      .catch(() => this.setState({ dbAvailable: false }));
  }

  showToast = (message, type = 'success') => {
    this.setState({ toast: { message, type } });
    setTimeout(() => this.setState({ toast: null }), 3000);
  };

  getArticles = () => {
    this.setState({ isLoading: true });

    let query = `${this.state.queryTerm}`;
    if (this.state.beginDate) {
      const formattedBegin = this.state.beginDate.replace(/-/g, '');
      query = `${query}&begin_date=${formattedBegin}`;
    }
    if (this.state.endDate) {
      const formattedEnd = this.state.endDate.replace(/-/g, '');
      query = `${query}&end_date=${formattedEnd}`;
    }

    API.nytSearch(query)
      .then(res => {
        this.setState({
          articles: res.data.response.docs,
          isLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
        this.showToast('Failed to fetch articles. Please try again.', 'error');
      });
  };

  saveArticle = articleInfo => {
    API.saveArticle(articleInfo)
      .then(res => {
        this.showToast('Article saved successfully!', 'success');
      })
      .catch(err => {
        if (err && err.response && err.response.status === 503) {
          this.showToast('Database unavailable. Please try again later.', 'error');
        } else {
          this.showToast('Article already saved or error occurred.', 'error');
        }
        console.log(err);
      });
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    if (this.state.queryTerm) {
      this.getArticles();
    }
  };

  formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  render() {
    const { articles, queryTerm, beginDate, endDate, dbAvailable, isLoading, toast } = this.state;

    return (
      <div className="main-page">
        {/* Page Header */}
        <header className="page-header">
          <h1>Discover the News</h1>
          <p>Search millions of articles from The New York Times</p>
        </header>

        {/* Search Section */}
        <section className="search-section">
          <form className="search-form" onSubmit={this.handleFormSubmit}>
            <div className="form-group search-input-group">
              <label className="form-label" htmlFor="queryTerm">Search Topic</label>
              <div className="input-group">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  id="queryTerm"
                  className="form-control"
                  value={queryTerm}
                  onChange={this.handleInputChange}
                  name="queryTerm"
                  placeholder="e.g., Climate Change, Technology..."
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="beginDate">From Date</label>
              <input
                type="date"
                id="beginDate"
                className="form-control"
                value={beginDate}
                onChange={this.handleInputChange}
                name="beginDate"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="endDate">To Date</label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={this.handleInputChange}
                name="endDate"
              />
            </div>

            <div className="form-group search-btn-group">
              <label className="form-label hide-mobile">&nbsp;</label>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={!queryTerm || isLoading}
              >
                {isLoading ? (
                  <React.Fragment>
                    <span className="loading-spinner"></span>
                    Searching...
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Search
                  </React.Fragment>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Database Warning */}
        {dbAvailable === false && (
          <div className="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Database is currently unavailable. Saving articles is temporarily disabled.</span>
          </div>
        )}

        {/* Results Section */}
        <section className="results-section">
          {articles.length > 0 && (
            <div className="results-header">
              <h2>Search Results</h2>
              <span className="results-count">{articles.length} articles found</span>
            </div>
          )}

          {isLoading ? (
            <div className="articles-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="article-card skeleton-card">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="articles-grid">
              {articles.map(article => (
                <article key={article._id} className="article-card">
                  <div className="article-card-header">
                    <a
                      href={article.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-title"
                    >
                      {article.headline.main}
                    </a>
                  </div>

                  <div className="article-meta">
                    {article.pub_date && (
                      <span className="article-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {this.formatDate(article.pub_date)}
                      </span>
                    )}
                    {article.section_name && (
                      <span className="badge badge-primary">{article.section_name}</span>
                    )}
                  </div>

                  {article.abstract && (
                    <p className="article-snippet">{article.abstract}</p>
                  )}

                  <div className="article-actions">
                    <a
                      href={article.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Read Article
                    </a>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={dbAvailable === false}
                      title={dbAvailable === false ? 'Database unavailable' : 'Save this article'}
                      onClick={() => this.saveArticle({
                        title: article.headline.main,
                        url: article.web_url,
                        date: article.pub_date
                      })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {dbAvailable === false ? 'Unavailable' : 'Save'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <circle cx="11" cy="11" r="3"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3>Start Your Search</h3>
              <p>Enter a topic above to discover articles from The New York Times archive.</p>
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

export default Main;
