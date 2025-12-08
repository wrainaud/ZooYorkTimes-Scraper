import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './pages/Main';
import Saved from './pages/Saved';
import NoMatch from './pages/NoMatch';
import Nav from './components/Nav';

const App = () => (
  <Router>
    <div className="app">
      <Nav />
      <main className="app-container">
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/saved" component={Saved} />
          <Route component={NoMatch} />
        </Switch>
      </main>
    </div>
  </Router>
);

export default App;
