import axios from 'axios';

// Read the NYT API key from environment variables (defined in client/.env)
const APIKEY = process.env.REACT_APP_NYT_API_KEY;

const queryUrlBase = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=' + encodeURIComponent(APIKEY || '') + '&q=';

export default {
  nytSearch: function(queryTerms) {
    if (!APIKEY) {
      return Promise.reject(new Error('Missing NYT API key. Set REACT_APP_NYT_API_KEY in client/.env and rebuild.'));
    }
    return axios.get(`${queryUrlBase}${queryTerms}`);
  },
  getSavedArticles: function() {
    return axios.get('/api/saved/');
  },
  deleteArticle: function(id) {
    return axios.delete('/api/saved/' + id);
  },
  saveArticle: function(articleData) {
    return axios.post('/api/saved', articleData);
  },
  getHealth: function() {
    return axios.get('/api/health');
  }
};
