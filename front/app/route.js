function Router(){
  let routes = [];

  function checkIfItsRoutes(event){
    let location = window.location.pathname;
    
    let currentRoutes = routes.find(route => route.path == location);

    if(currentRoutes !== undefined){
      document.getElementById('app').innerHTML = currentRoutes.components.template()
      currentRoutes.components.initialiseEvents();
    } else {
      document.getElementById('app').innerHTML = "Error"
    }
  }
  window.onpopstate = checkIfItsRoutes;

  return {
    path: function(path, components){
      routes.push({path, components})
    },
    start: () => checkIfItsRoutes(),
    go: (path, state) => {
      window.history.pushState(state, path, path);
      checkIfItsRoutes();
    }
  }
}

let router = new Router();

router.path("/", new Home());
router.path("/index.html", new Home());

router.start();
