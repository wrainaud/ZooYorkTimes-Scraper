import React, { Component } from 'react';
import Jumbotron from '../../components/Jumbotron';
import API from '../../utils/API';
import { Link } from 'react-router-dom';
import { Col, Row, Container } from '../../components/Grid';
import { List, ListItem } from '../../components/List';
import { Input, TextArea, FormBtn } from '../../components/Form';

class Main extends Component {
  state = {
    articles: [],
    queryTerm: '',
    beginDate: '',
    endDate: '',
    dbAvailable: null
  };

  componentDidMount() {
    API.getHealth()
      .then(res => {
        const ok = res && res.data && res.data.dbConnected;
        this.setState({ dbAvailable: !!ok });
      })
      .catch(() => this.setState({ dbAvailable: false }));
  }

  getArticles = () => {
    let query = `${this.state.queryTerm}`;
    if (this.state.beginDate) {
      query = `${query}&begin_date=${this.state.beginDate}`;
    }
    if (this.state.endDate) {
      query = `${query}&end_date=${this.state.endDate}`;
    }

    API.nytSearch(query)
      .then(res => {
        console.log(res);
        this.setState({
          articles: res.data.response.docs,
          queryTerm: '',
          beginDate: '',
          endDate: ''
        });
      })
      .catch(err => console.log(err));
  };

 
  saveArticle = articleInfo => {
    API.saveArticle(articleInfo)
      .then(res => {
        console.log('hey it saved');
      })
      .catch(err => {
        if (err && err.response && err.response.status === 503) {
          alert('Database unavailable: Please start MongoDB or configure MONGODB_URI, then try saving again.');
        }
        console.log(err);
      })
  }


  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    if (this.state.queryTerm) {
      this.getArticles();
    }
  };

  render() {
    return (
        <Row>
          <Col size="md-3">
            <Jumbotron>
              <h1>Search for a topic.</h1>
            </Jumbotron>
            <form>
              <Input
                value={this.state.queryTerm}
                onChange={this.handleInputChange}
                name="queryTerm"
                placeholder="Topic (required)"
              />
              <Input
                value={this.state.beginDate}
                onChange={this.handleInputChange}
                name="beginDate"
                placeholder="Begin Date (Optional - in YYYYMMDD)"
              />
              <Input
                value={this.state.endDate}
                onChange={this.handleInputChange}
                name="endDate"
                placeholder="End Date (Optional - in YYYYMMDD)"
              />
              <FormBtn disabled={!this.state.queryTerm} onClick={this.handleFormSubmit}>
                Search
              </FormBtn>
            </form>
          </Col>
          <Col size="md-9">
            <Jumbotron>
              <h1>Article Results</h1>
            </Jumbotron>
            {this.state.dbAvailable === false && (
              <div className="alert alert-warning" role="alert">
                Database is currently unavailable. You can search articles, but saving is disabled until the database is connected.
              </div>
            )}
            {this.state.articles.length ? (
              <List>
                {this.state.articles.map(article => (
                  <ListItem key={article._id}>
                    <a href={article.web_url} target="_blank">
                      <strong>{article.headline.main}</strong>
                    </a>
                    <br/>
                    <span>Published on {article.pub_date}</span>
                    <button className="btn btn-primary" style={{float: "right"}} disabled={this.state.dbAvailable===false} title={this.state.dbAvailable===false ? 'Database unavailable' : 'Save this article'} onClick={() => this.saveArticle({
                      title: article.headline.main,
                      url: article.web_url, 
                      date: article.pub_date
                    })}> {this.state.dbAvailable===false ? 'Save Unavailable' : 'Save Article'} </button> 
                  </ListItem>
                ))}
              </List>
            ) : (
              <h3>No Results to Display</h3>
            )}
          </Col>
        </Row>
    );
  }
}

export default Main;
