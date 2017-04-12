function Router(){
  let routes = [];

  function checkIfItsRoutes(event){
    let location = window.location.pathname.substr(window.location.pathname.lastIndexOf("/"), window.location.pathname.length);

    let currentRoutes = routes.find(route => route.path == location);

    if(currentRoutes !== undefined){
      if(localStorage.getItem(location)){
        currentRoutes.components.updateModel(JSON.parse(localStorage.getItem(location)));
      }
      document.getElementById('app').innerHTML = currentRoutes.components.template()
      if(currentRoutes.components.initialiseEvents !== undefined){
        currentRoutes.components.initialiseEvents();
      }
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
      localStorage.setItem(path, JSON.stringify(state) );
      checkIfItsRoutes();
    }
  }
}

let router = new Router();

router.path("/", new Home());
router.path("/index.html", new Home());

router.path("/game", new Game() );

router.start();
