var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')

require('../rothschildish.webflow/css/normalize.css');
require('../rothschildish.webflow/css/webflow.css');
require('../rothschildish.webflow/css/rothschildish.webflow.css');

var Qs = require('qs')
var Cookie = require('cookie')
var When = require('when')





/*******************************************************************************
 *                          REMOTE PROPS                                       *
 ******************************************************************************/
var remoteProps = {
  // user: (props)=>{
  //   return {
  //     url: "/api/me",
  //     prop: "user"
  //   }
  // },
  // orders: (props)=>{
  //   if(!props.user) return
  //   var qs = {...props.qs, user_id: props.user.value.id, type: "nat_order"}
  //   var query = Qs.stringify(qs)
  //   return {
  //     url: "/api/orders" + (query == '' ? '' : '?'+query),
  //     prop: "orders"
  //   }
  // },
  wallet: (props)=>{
    return {
      url: "/api/wallet", // + (query == '' ? '' : '?'+query),
      prop: "wallet"
    }
  },
}

var localhost = require('reaxt/config').localhost
var XMLHttpRequest = require("xhr2") // External XmlHTTPReq on browser, xhr2 on server
var HTTP = new (function(){
  this.get = (url)=>this.req('GET',url)
  this.delete = (url)=>this.req('DELETE',url)
  this.post = (url,data)=>this.req('POST',url,data)
  this.put = (url,data)=>this.req('PUT',url,data)

  this.req = (method,url,data)=> new Promise((resolve, reject) => {
    var req = new XMLHttpRequest()
    url = (typeof window !== 'undefined') ? url : localhost+url
    req.open(method, url)
    req.responseType = "text"
    req.setRequestHeader("accept","application/json,*/*;0.8")
    req.setRequestHeader("content-type","application/json")
    req.onload = ()=>{
      if(req.status >= 200 && req.status < 300){
        //console.log(req.responseText)
        resolve(req.responseText && JSON.parse(req.responseText))
      }else{
        reject({http_code: req.status})
      }
    }
    req.onerror = (err)=>{
      reject({http_code: req.status})
    }
    req.send(data && JSON.stringify(data))
  })
})()


function addRemoteProps(props){
  return new Promise((resolve, reject)=>{

    //Here we could call `[].concat.apply` instead of `Array.prototype.concat.apply`
    //apply first parameter define the `this` of the concat function called
    //Ex [0,1,2].concat([3,4],[5,6])-> [0,1,2,3,4,5,6]
    // <=> Array.prototype.concat.apply([0,1,2],[[3,4],[5,6]])
    //Also `var list = [1,2,3]` <=> `var list = new Array(1,2,3)`
    var remoteProps = Array.prototype.concat.apply([],
      props.handlerPath
        .map((c)=> c.remoteProps) // -> [[remoteProps.user], [remoteProps.orders], null]
        .filter((p)=> p) // -> [[remoteProps.user], [remoteProps.orders], null]
    ) // -> [remoteProps.user, remoteProps.orders]


    var remoteProps = remoteProps
      .map((spec_fun)=> spec_fun(props) ) // -> 1st call [{url: '/api/me', prop: 'user'},undefined]
                                // -> 2nd call [{url: '/api/me', prop: 'user'},{url: '/api/orders?user_id=123', prop: 'orders'}]
      .filter((specs)=> specs) // get rid of undefined from remoteProps that don't match their dependencies
      .filter((specs)=> !props[specs.prop] ||  props[specs.prop].url != specs.url) // get rid of remoteProps already resolved with the url

    if(remoteProps.length == 0) return resolve(props)

    // check out https://github.com/cujojs/when/blob/master/docs/api.md#whenmap and https://github.com/cujojs/when/blob/master/docs/api.md#whenreduce
    var promise = When.map( // Returns a Promise that either on a list of resolved remoteProps, or on the rejected value by the first fetch who failed 
      remoteProps.map((spec)=>{ // Returns a list of Promises that resolve on list of resolved remoteProps ([{url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'}])
        return HTTP.get(spec.url)
          .then((result)=>{spec.value = result; return spec}) // we want to keep the url in the value resolved by the promise here. spec = {url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'} 
      })
    )

    When.reduce(promise, (acc, spec)=>{ // {url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'}
      acc[spec.prop] = {url: spec.url, value: spec.value}
      return acc
    }, props).then((newProps)=>{
      addRemoteProps(newProps).then(resolve, reject)
    },reject)
  })
}




/*******************************************************************************
 *                          REACT CLASSES                                      *
 ******************************************************************************/
// var Layout = createReactClass({
//   render(){
//     return <JSXZ in="home" sel=".layout">
//       <Z sel=".layout-container"><this.props.Child {...this.props}/></Z>
//     </JSXZ>
//   }
// })

// var Header = createReactClass({
//   statics: {
//     remoteProps: [remoteProps.user]
//   },
//   render(){
//     return <JSXZ in="orders" sel=".header">
//       <Z sel=".logo-container" onClick={(e)=>{
//         e.preventDefault()
//         this.props.Link.GoTo("orders",{} , ...this.props.qs)
//       }} ><ChildrenZ/></Z>
//       <Z sel=".header-container"><this.props.Child {...this.props}/></Z>
//       <Z sel=".client-login-text">{this.props.user.value.last_name+' '+this.props.user.value.first_name}</Z>
//     </JSXZ>
//   }
// })

// var Orders = createReactClass({
//   statics: {
//     remoteProps: [remoteProps.orders]
//   },
//   render(){
//     return (
//     <JSXZ in="home" sel=".container">
//       <Z sel=".form" onSubmit={(e) => {
//         e.preventDefault()
//         var text = document.getElementById('search-2').value
//         this.props.qs["custom.customer.last_name"] = text
//         this.props.qs.page = 0
//         this.props.Link.GoTo("orders", {}, this.props.qs)
//       }}><ChildrenZ/></Z>
//       <Z sel=".text-block-4" onClick={(e)=> {
//         e.preventDefault()
//         var text = document.getElementById('search-2').value
//         this.props.qs["custom.customer.last_name"] = text
//         this.props.qs.page  = 0
//         this.props.Link.GoTo("orders", {}, this.props.qs)
//       }}><ChildrenZ/></Z>
//       <Z sel=".tab-body">{
//         this.props.orders.value.results.map( (order) => (
//           <JSXZ in="orders" sel=".table-line" key={order.remoteid}>
//             <Z sel=".col-1 .cell-content">{order.remoteid}</Z>
//             <Z sel=".col-2 .cell-content">{order.custom.customer.full_name}</Z>
//             <Z sel=".col-3 .cell-content">
//               { order.custom.billing_address.street  +" "+
//                 order.custom.billing_address.postcode+" "+
//                 order.custom.billing_address.city }
//             </Z>
//             <Z sel=".col-4 .cell-content">{order.custom.items.reduce(((sum, item) => sum + parseInt(item.quantity_to_fetch)), 0)}</Z>
//             <Z sel=".order-goto" onClick={(e)=>{
//               e.preventDefault()
//               this.props.Link.GoTo("order", {order_id: order.remoteid}, this.props.qs)
//             }}><ChildrenZ/></Z>
//           </JSXZ>
//         ))}
//       </Z>
//       <Z sel=".current-page">{(parseInt(this.props.qs.page) || 0 )+1}</Z>
//       <Z sel=".super-left-arrow" onClick={(e)=>{
//         e.preventDefault()
//         var old_page = parseInt(this.props.qs.page) || 0
//         this.props.qs.page = Math.max(old_page-10, 0)
//         if(this.props.qs.page == old_page) {
//           this.props.Link.GoTo("orders", {}, this.props.qs)
//         }
//       }} ><ChildrenZ/></Z>
//       <Z sel=".left-arrow" onClick={(e)=>{
//         e.preventDefault()
//         var old_page = parseInt(this.props.qs.page) || 0
//         this.props.qs.page = Math.max(old_page-1, 0)
//         this.props.Link.GoTo("orders", {}, this.props.qs)
//       }} ><ChildrenZ/></Z>
//       <Z sel=".right-arrow" onClick={(e)=>{
//         e.preventDefault()
//         if(this.props.orders.value.results.length == (this.props.qs.rows || 30))
//           this.props.qs.page = (parseInt(this.props.qs.page) || 0) + 1
//           this.props.Link.GoTo("orders", {}, this.props.qs)
//       }} ><ChildrenZ/></Z>
//       <Z sel=".super-right-arrow" onClick={(e)=>{
//         e.preventDefault()
//         if(this.props.orders.value.results.length == (this.props.qs.rows || 30))
//           this.props.qs.page = (parseInt(this.props.qs.page) || 0) + 10
//           this.props.Link.GoTo("orders", {}, this.props.qs)
//       }} ><ChildrenZ/></Z>
//     </JSXZ>)
//   }
// })

// var Order = createReactClass({
//   statics: {
//     remoteProps: [remoteProps.order]
//   },
//   render(){
//     return <JSXZ in="order" sel=".container">
//       <Z sel=".order-title">{`Commande n° ${this.props.order.value.remoteid}`}</Z>
//       <Z sel=".order-line-1 .content-order">{this.props.order.value.custom.customer.full_name}</Z>
//       <Z sel=".order-line-2 .content-order">
//           { this.props.order.value.custom.billing_address.street  +" "+
//             this.props.order.value.custom.billing_address.postcode+" "+
//             this.props.order.value.custom.billing_address.city}
//       </Z>
//       <Z sel=".items-table">
//         {this.props.order.value.custom.items.map( (item) => (
//         <JSXZ in="order" sel=".order-line" key={item.sku}>
//           <Z sel=".order-col-nom">{item.product_title}</Z>
//           <Z sel=".order-col-quant">{item.quantity_to_fetch}</Z>
//           <Z sel=".order-col-price-unit">{item.unit_price}</Z>
//           <Z sel=".order-col-price-tot">{(item.unit_price*item.quantity_to_fetch).toFixed(2)}</Z>
//         </JSXZ>
//         ))}
//       </Z>
//       <Z sel=".order-line-tot .order-col-price-tot">{this.props.order.value.custom.items.reduce((sum, item) => (sum+item.unit_price*item.quantity_to_fetch), 0).toFixed(2)}</Z>
//       <Z sel=".left-arrow" onClick={(e)=>{
//         e.preventDefault()
//         this.props.Link.GoTo("orders", {}, this.props.qs)
//       }} ><ChildrenZ/></Z>
//     </JSXZ>
//   }
// })

var ErrorPage = createReactClass({
  render(){
    return <div>
      <h1>{this.props.message}</h1>
      <h2>{this.props.code}</h2>
    </div>
  }
})


var Wallet = createReactClass({
  statics: {
    remoteProps: [remoteProps.wallet]
  },
  render(){
    console.log("NR89")
    console.log(this.props)
    return (
    <JSXZ in="home" sel=".container">
      {/* <Z sel=".form" onSubmit={(e) => {
        e.preventDefault()
        var text = document.getElementById('search-2').value
        this.props.qs["custom.customer.last_name"] = text
        this.props.qs.page = 0
        this.props.Link.GoTo("wallet", {}, this.props.qs)
      }}><ChildrenZ/></Z>
      <Z sel=".text-block-4" onClick={(e)=> {
        e.preventDefault()
        var text = document.getElementById('search-2').value
        this.props.qs["custom.customer.last_name"] = text
        this.props.qs.page  = 0
        this.props.Link.GoTo("orders", {}, this.props.qs)
      }}><ChildrenZ/></Z> */}
      <Z sel=".tab-body">{
        this.props.wallet.value.map( (share) => (
          <JSXZ in="home" sel=".tab-line" key={share.id}>
            <Z sel=".col-1">{share.mnemo}</Z>
            <Z sel=".col-2">{share.date}</Z>
            <Z sel=".col-3">{share.open}</Z>
            <Z sel=".col-4">{share.last}</Z>
            <Z sel=".col-5">{share.high}</Z>
            <Z sel=".col-6">{share.low}</Z>
            <Z sel=".col-7">{share.volume}</Z>
            <Z sel=".col-8">{((share.last-share.open)/share.open*100).toPrecision(2)+"%"}</Z>
          </JSXZ>
        ))}
      </Z>
      {/* <Z sel=".current-page">{(parseInt(this.props.qs.page) || 0 )+1}</Z>
      <Z sel=".super-left-arrow" onClick={(e)=>{
        e.preventDefault()
        var old_page = parseInt(this.props.qs.page) || 0
        this.props.qs.page = Math.max(old_page-10, 0)
        if(this.props.qs.page == old_page) {
          this.props.Link.GoTo("orders", {}, this.props.qs)
        }
      }} ><ChildrenZ/></Z>
      <Z sel=".left-arrow" onClick={(e)=>{
        e.preventDefault()
        var old_page = parseInt(this.props.qs.page) || 0
        this.props.qs.page = Math.max(old_page-1, 0)
        this.props.Link.GoTo("orders", {}, this.props.qs)
      }} ><ChildrenZ/></Z>
      <Z sel=".right-arrow" onClick={(e)=>{
        e.preventDefault()
        if(this.props.orders.value.results.length == (this.props.qs.rows || 30))
          this.props.qs.page = (parseInt(this.props.qs.page) || 0) + 1
          this.props.Link.GoTo("orders", {}, this.props.qs)
      }} ><ChildrenZ/></Z>
      <Z sel=".super-right-arrow" onClick={(e)=>{
        e.preventDefault()
        if(this.props.orders.value.results.length == (this.props.qs.rows || 30))
          this.props.qs.page = (parseInt(this.props.qs.page) || 0) + 10
          this.props.Link.GoTo("orders", {}, this.props.qs)
      }} ><ChildrenZ/></Z> */}
    </JSXZ>)
  }
})



/*******************************************************************************
 *                        FRONT ARCHITECTURE                                   *
 ******************************************************************************/
var routes = {
  "wallet": {
    path:(params) => '/wallet',
    match: (path, qs) => {
      return (path == "/wallet") && {handlerPath: [Wallet]}
    }
  }
  // "order": {
  //   path:(params) => `/order/${params.order_id}`,
  //   match: (path, qs) => {
  //     var r = new RegExp("/order/([^/]*)$").exec(path)
  //       return r && {handlerPath: [Layout,Header,Order],  order_id: r[1]}
  //   }
  // }
}

var Child = createReactClass({
  render(){
    var [ChildHandler,...rest] = this.props.handlerPath
      return <ChildHandler {...this.props} handlerPath={rest} />
  }
})

var Link = createReactClass({
  statics: {
    renderFunc: null, //render function to use (differently set depending if we are server sided or client sided)
    GoTo(route, params, query){// function used to change the path of our browser
      var path = routes[route].path(params)
      var qs = Qs.stringify(query)
      var url = path + (qs == '' ? '' : '?'+qs)
      history.pushState({},"",url)
      Link.onPathChange()
    },
    onPathChange(){ //Updated onPathChange
      var path = location.pathname
      var qs = Qs.parse(location.search.slice(1))
      var cookies = Cookie.parse(document.cookie)
      inferPropsChange(path, qs, cookies).then( //inferPropsChange download the new props if the url query changed as done previously
        ()=>{
          Link.renderFunc(<Child {...browserState}/>) //if we are on server side we render 
        },({http_code})=>{
          Link.renderFunc(<ErrorPage message={"Not Found"} code={http_code}/>, http_code) //idem
        }
      )
    },
    LinkTo: (route,params,query)=> {
      var qs = Qs.stringify(query)
      return routes[route].path(params) +((qs=='') ? '' : ('?'+qs))
    }
  },
  onClick(ev) {
    ev.preventDefault();
    Link.GoTo(this.props.to,this.props.params,this.props.query);
  },
  render (){//render a <Link> this way transform link into href path which allows on browser without javascript to work perfectly on the website
    return (
      <a href={Link.LinkTo(this.props.to,this.props.params,this.props.query)} onClick={this.onClick}>
        {this.props.children}
      </a>
    )
  }
})

var browserState = {}

function inferPropsChange(path,query,cookies){ // the second part of the onPathChange function have been moved here
  browserState = {
    ...browserState,
    path: path, qs: query,
    Link: Link,
    Child: Child
  }

  var route, routeProps
  for(var key in routes) {
    routeProps = routes[key].match(path, query)
    if(routeProps){
      route = key
      break
    }
  }

  if(!route){
    return new Promise( (res,reject) => reject({http_code: 404}))
  }
  browserState = {
    ...browserState,
    ...routeProps,
    route: route
  }

  return addRemoteProps(browserState).then(
    (props)=>{
      browserState = props
    })
}

module.exports = {
  reaxt_server_render(params,render){
    inferPropsChange(params.path, params.query, params.cookies)
      .then(()=>{
        render(<Child {...browserState}/>)
      },(err)=>{
        render(<ErrorPage message={"Not Found :"+err.url } code={err.http_code}/>, err.http_code)
      })
  },
  reaxt_client_render(initialProps,render){
    browserState = initialProps
    Link.renderFunc = render
    window.addEventListener("popstate", ()=>{ Link.onPathChange() })
    Link.onPathChange()
  }
}
