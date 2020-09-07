import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter as Router, Route, Switch, Redirect, Link,useHistory, useParams} from 'react-router-dom';
const api = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/';
const breweryApi = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/brewery/';
const randomBeer = 'http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/random/';

const apiKey = "?withBreweries=Y&hasLabels=Y&key=a5c1b917e7ba62dcd79f434ed73bc72d";

class Brewery extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        images: {}
      }
    }  }

  componentDidMount() {
    let brewery = this.props.data || null;
    if (brewery) {
      this.setState({
        data: brewery
      })
    } else {

          try {
            // if not props, request it again. Probably history navigation
            let id= this.props.location.pathname.split('?');
            id = id[id.length-1];
            if (id === "/brewery") {
              //test state
              id = this.state.id
            }
            id = id || "";
            if (id.length > 0) { // using history
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
      let brewery = {
        images: {}
      };

      if (this.state.data) {
        brewery = this.state.data;
      }


      return (
        <div>
        <div className="row col-md-6">
          <div className="row col-md-12 labels"><img src={brewery.images.medium}/></div>
        </div>
        <div className="row col-md-6 panel panel-default">
        <div className="row panel-heading">{brewery.name} --- Established {brewery.established}</div>

        <div className="row panel-body">{brewery.description}</div>
        </div></div>

    )
  }
}



class Beer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        style: {},
        labels: {}
      }
    }  }

  componentDidMount() {

    try {

      let id= this.props.location.search || "";
      if (id.length > 0) { // using history
        id = id.split('=');
        id = id[id.length-1]; // get query param
        fetchApi(api + id)
        .then((data) => {
          this.setState({
            data,
          });
        })
      } else {
        fetchApi(randomBeer)
        .then((data) => {
          this.setState({
            data,
          });

          this.props.history.push('?id='+data.id)
        })
      }
    } catch (err){
      throw err;
    }
  }

  render() {
    console.log(this.state)
    let beer = {
      name: '',
      description: '',
      labels: {}
    };
    let brewery = {};

    if (this.state.data) {
      beer = {
        name: this.state.data.name,
        description: this.state.data.style.description,
        labels: this.state.data.labels || {} // not every beer has a label
      }
      brewery = this.state.data.breweries? this.state.data.breweries[0] : {};
    }

    return (
      <div>
      <div className="row col-md-6">
        <div className="row col-md-12 labels"><img src={beer.labels.medium}/></div>
      </div>
      <div className="row col-md-6 panel panel-default">
      <div className="row panel-heading">{beer.name}</div>

      <div className="row panel-body">{beer.description}
      <p><Link to={{
        pathname: '/brewery?id=' + brewery.id,
        state: {
          data: brewery || {}
        }
      }}><br /> >>>Learn about {brewery.name}</Link></p></div>

      </div></div>

  )
  }
}

const routes = [{
  path: "/beer:id",
  component: Beer
},{
  path: "/beer",
  component: Beer
},{
  path: "/brewery:id",
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
  <div className="container">
  <div className="page-header"><h3>The Random Beer App</h3></div>
  <Router>
  <App />
  </Router>
  </div>,
  document.getElementById('root')
);
