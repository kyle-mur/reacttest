import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter as Router, Route, Switch, Redirect, Link, useParams} from 'react-router-dom';

const api = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/';
const breweryApi = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/brewery/';
const randomBeer = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/random/';

const apiKey = "?withBreweries=Y&hasLabels=Y&key=a5c1b917e7ba62dcd79f434ed73bc72d";

class Brewery extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        style: {}
      }
    }  }

  componentDidMount() {
    let brewery = this.props.data || null;
console.log(this.props)
    if (brewery) {
      this.setState({
        data: brewery
      })
    } else {

          try {
            // if not props, request it again. Probably history navigation
            let id= this.props.location.search.length ? this.props.location.search : null;
            if (id) { // using history
              id = id.split('=');
              id = id[id.length-1]; // get query param

              fetchApi(breweryApi +id)
              .then((data) => {
                this.setState({
                  data,
                })
              })
            } // else we let the router redirect to a random beer
          } catch (err){
            throw err;
          }
    }

  }


    render() {
      console.log(this.state)
      let brewery = {};

      if (this.state.data) {
        brewery = this.state.data.breweries? this.state.data.breweries[0] : {};
      }


      return (
        <div class="row">
        <div class="col-md-4>">{brewery.name}</div>

        <div class="col-md-4>">{brewery.description}</div>
        </div>

    )
  }
}

class Beer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        style: {}
      }
    }  }

  componentDidMount() {

    try {
      let id= this.props.location.search.length ? this.props.location.search : null;
      if (id) { // using history
        id = id.split('=');
        id = id[id.length-1]; // get query param
        fetchApi(api + id)
        .then((data) => {
          this.setState({
            data,
          })
        })
      } else {
        fetchApi(randomBeer)
        .then((data) => {
          this.setState({
            data,
          })
        })
      }
    } catch (err){
      throw err;
    }
  }

  render() {
    console.log(this.state)
    let beer = {};
    let brewery = {};

    if (this.state.data) {
      beer = {
        name: this.state.data.name,
        description: this.state.data.style.description
      }
      brewery = this.state.data.breweries? this.state.data.breweries[0] : {};
    }

    const breweryPath = "/brewery/" + brewery.id;

    return (
    <div class="row">
    <div class="col-md-4>">{beer.name}</div>

    <div class="col-md-4>">{beer.description}</div>

    <div class="col-md-4"><Link to={{
      pathname: '/brewery/?id=' + brewery.id,
      state: {
        data: brewery || {}
      }
    }}>{brewery.name}</Link></div>
    </div>

  )
  }
}

const routes = [{
  path: "/beer/:id",
  component: Beer
},{
  path: "/beer",
  component: Beer
}, {
  path: "/brewery/:id",
  component: Brewery
},{
  path: "/brewery",
  component: Brewery
}];

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}
class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div>
        <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        <Route path="/">
          <Redirect to={{pathname:"/beer"}}/>
        </Route>
        </Switch>

      </div>
    )
  }
}



const fetchApi = async (request) => {
  return fetch(request + apiKey)
  .then(res => res.json())
  .then((result) => {
    console.log("result",result)
    if (result.status === "failure") {
      throw new Error(result.errorMessage);
    }
    let data = result.data || {};
    return data;
  }, (err) =>{
    throw err;
  })

}



ReactDOM.render(
  <div class="container">
  <div class="page-header"><h3>The Random Beer App</h3></div>
  <Router>
  <App />
  </Router>
  </div>,
  document.getElementById('root')
);
