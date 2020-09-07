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
        images: {}
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
      let brewery = {
        images: {}
      };

      if (this.state.data) {
        brewery = this.state.data;
      }


      return (
        <div>
        <div className="row col-md-6">
          <div className="row"><img src={brewery.images.icon}/></div>
        </div>
        <div className="row col-md-6">
        <div className="row">{brewery.name}</div>

        <div className="row">{brewery.description}</div>
        </div></div>

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
      <div>
    <div className="row col-md-6">
    <div className="row"><Link to={{
      pathname: '/brewery/?id=' + brewery.id,
      state: {
        data: brewery || {}
      }
    }}>{brewery.name}</Link></div>
      <div className="row"><img src={brewery.description} /></div>
    </div>
    <div className="row col-md-6">
    <div className="row">{beer.name}</div>

    <div className="row">{beer.description}</div>

    </div></div>

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
      result = {"message":"READ ONLY MODE: Request Successful","data":{"id":"ct0Hxz","name":"Charkoota Rye","nameDisplay":"Charkoota Rye (2012)","abv":"9.35","styleId":90,"isRetired":"N","year":2012,"status":"verified","statusDisplay":"Verified","createDate":"2012-08-25 19:41:56","updateDate":"2018-11-02 02:15:14","style":{"id":90,"categoryId":7,"category":{"id":7,"name":"European-germanic Lager","createDate":"2012-03-21 20:06:46"},"name":"German-Style Doppelbock","shortName":"Doppelbock","description":"Malty sweetness is dominant but should not be cloying. Malt character is more reminiscent of fresh and lightly toasted Munich- style malt, more so than caramel or toffee malt character. Some elements of caramel and toffee can be evident and contribute to complexity, but the predominant malt character is an expression of toasted barley malt. Doppelbocks are full bodied and deep amber to dark brown in color. Astringency from roast malts is absent. Alcoholic strength is high, and hop rates increase with gravity. Hop bitterness and flavor should be low and hop aroma absent. Fruity esters are commonly perceived but at low to moderate levels. Diacetyl should be absent","ibuMin":"17","ibuMax":"27","abvMin":"6.5","abvMax":"8","srmMin":"12","srmMax":"30","ogMin":"1.074","fgMin":"1.014","fgMax":"1.02","createDate":"2012-03-21 20:06:46","updateDate":"2015-04-07 15:39:08"},"breweries":[{"id":"AqEUBQ","name":"New Holland Brewing Company","nameShortDisplay":"New Holland","status":"verified","statusDisplay":"Verified","createDate":"2012-01-03 02:42:03","updateDate":"2018-11-02 02:15:01","isInBusiness":"Y","isVerified":"N","locations":[{"id":"awYZlE","name":"New Holland Brewing","streetAddress":"66 East 8th Street","locality":"Holland","region":"Michigan","postalCode":"49423","phone":"616-355-6422","website":"http:\/\/newhollandbrew.com\/","isPrimary":"N","inPlanning":"N","isClosed":"N","openToPublic":"Y","locationType":"micro","locationTypeDisplay":"Micro Brewery","countryIsoCode":"US","yearOpened":"1996","status":"verified","statusDisplay":"Verified","createDate":"2012-01-03 02:42:03","updateDate":"2018-11-02 02:14:56","timezoneId":"America\/New_York","country":{"isoCode":"US","name":"UNITED STATES","displayName":"United States","isoThree":"USA","numberCode":840,"createDate":"2012-01-03 02:41:33"}},{"id":"qncYRx","name":"Production Campus, Sales & Marketing","streetAddress":"684 Commerce Court","locality":"Holland","region":"Michigan","postalCode":"49424","website":"http:\/\/newhollandbrew.com\/","isPrimary":"N","inPlanning":"N","isClosed":"N","openToPublic":"Y","locationType":"office","locationTypeDisplay":"Office","countryIsoCode":"US","yearOpened":"1996","status":"verified","statusDisplay":"Verified","createDate":"2012-03-07 14:26:41","updateDate":"2018-11-02 02:14:56","country":{"isoCode":"US","name":"UNITED STATES","displayName":"United States","isoThree":"USA","numberCode":840,"createDate":"2012-01-03 02:41:33"}},{"id":"T7LMbO","name":"Production Facility","streetAddress":"690 Commerce Court","locality":"Holland","region":"Michigan","postalCode":"49424","phone":"616-355-6422","website":"http:\/\/newhollandbrew.com\/","isPrimary":"N","inPlanning":"N","isClosed":"N","openToPublic":"Y","locationType":"production","locationTypeDisplay":"Production Facility","countryIsoCode":"US","yearOpened":"1996","status":"deleted","statusDisplay":"Deleted","createDate":"2012-03-07 14:27:26","updateDate":"2018-11-02 02:14:56","hoursOfOperationNotes":"Brewery tours are at Noon and 3pm. Tours are $10 per person and include samples of our beer as well as a take-home New Holland pint glass.","country":{"isoCode":"US","name":"UNITED STATES","displayName":"United States","isoThree":"USA","numberCode":840,"createDate":"2012-01-03 02:41:33"}},{"id":"JAvSVM","name":"New Holland - Brew Pub","streetAddress":"66 East 8th Street","locality":"Holland","region":"Michigan","postalCode":"49423","phone":"(616) 355 \u2013 6422","website":"http:\/\/newhollandbrew.com\/the-pub\/","isPrimary":"N","inPlanning":"N","isClosed":"N","openToPublic":"Y","locationType":"micro","locationTypeDisplay":"Micro Brewery","countryIsoCode":"US","yearOpened":"1997","status":"deleted","statusDisplay":"Deleted","createDate":"2014-09-03 13:59:03","updateDate":"2018-11-02 02:14:56","hoursOfOperationNotes":"Mon-Thurs 11am-12am\nFri-Sat 11am-1am\nSun 11am-10pm","timezoneId":"America\/New_York","country":{"isoCode":"US","name":"UNITED STATES","displayName":"United States","isoThree":"USA","numberCode":840,"createDate":"2012-01-03 02:41:33"}},{"id":"Db1S1w","name":"The Knickerbocker","streetAddress":"417 Bridge Street NW","locality":"Grand Rapids","region":"Michigan","postalCode":"49504","phone":"1-616-345-5642","website":"http:\/\/newhollandbrew.com\/theknickerbocker\/","isPrimary":"Y","inPlanning":"N","isClosed":"N","openToPublic":"Y","locationType":"restaurant","locationTypeDisplay":"Restaurant\/Ale House","countryIsoCode":"US","status":"verified","statusDisplay":"Verified","createDate":"2017-06-02 15:46:01","updateDate":"2018-11-02 02:14:56","timezoneId":"America\/New_York","country":{"isoCode":"US","name":"UNITED STATES","displayName":"United States","isoThree":"USA","numberCode":840,"createDate":"2012-01-03 02:41:33"}}]}]},"status":"success"}
      //throw new Error(result.errorMessage);
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
