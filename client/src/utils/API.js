import axios from 'axios';

export default {
  nytSearch: function(query) {
    // query is already formatted as "q=topic&begin_date=...&end_date=..."
    return axios.get(`/api/saved/search?${query}`);
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
