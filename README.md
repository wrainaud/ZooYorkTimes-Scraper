# ZooYorkTimes Scraper :newspaper::apple::statue_of_liberty:
A `NodeJS`, `MongoDB`, `Express`, and `ReactJS` application where users can query, display, and save articles from the [New York Times Article Search API](http://developer.nytimes.com/). Users can remove saved articles as well.

Please check out the deployed version in Heroku [here](https://ny-times-react.herokuapp.com/)!

Click on the headlines to be re-directed to the full New York Times articles.

## Functionality
On the backend, the app uses `express` to serve routes and `mongoose` to interact with a `MongoDB` database.

On the frontend, the app uses `ReactJS` for rendering components, `axios` for internal/external API calls, and `bootstrap` as a styling framework.

In order to transpile the JSX code, `webpack` and `babel` were utilized. All of the JSX  code in the `/app` folder was transpiled into the `bundle.js` file located in the `/public` folder.

## New York Times API
Prior to starting this app and getting an `unnecessary` error message, you'll probably want to swap out the API Key provided in the `client/src/utils/API.js` file. 

To get a New York Times API Key, visit [this link](https://developer.nytimes.com/signup).

## Quickstart

```
  git clone git@github.com:wrainaud/ZooYorkTimes-Scraper.git my-app
  cd my-app
  yarn install
  cd client
  yarn install
  cd ..
  yarn start
```

**Note : Please make sure your MongoDB is running.** For MongoDB installation guide see [this](https://docs.mongodb.org/v3.0/installation/). Also `npm3` is required to install dependencies properly.
