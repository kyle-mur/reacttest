import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter as Router, Route, Switch, Redirect, Link,useHistory, useParams} from 'react-router-dom';
import { withRouter } from 'react-router'
const api = 'https://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/';
const breweryApi = 'https://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/brewery/';
const randomBeer = 'https://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/beer/random/';

const apiKey = "?withBreweries=Y&hasLabels=Y&key=a5c1b917e7ba62dcd79f434ed73bc72d";

// has labels does not work with random for some reason

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
        // actually it seems that a random beer request doesn't return a label even if we ask for one, yet a direct request does
        // so this is broken on the API perhaps
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
    this.goBack = this.goBack.bind(this);
  }

  goBack(){
    console.log(this)
    return this.props.history ? this.props.history.goBack() : null;
  }


  render() {

    return (
      <div className="container"><Header></Header>

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


class HeaderComponent extends React.Component {
  render() {
    return (

      <div className="page-header">
      <div><a href="#" onClick={() => this.props.history.go(-1)} >Go Back</a></div>
      <div className="pull-left"><h3>The Random Beer App</h3></div>

      <div className="pull-right"><a href="/" className="btn"><h3>Get Another Beer</h3></a></div>
<div class="clearfix"></div>      </div>
    )
  }
}


const Header = withRouter(HeaderComponent);


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
  <Router>
  <App />
  </Router>,
  document.getElementById('root')
);
