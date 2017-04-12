function Game(){
    const LENGTH_BOARD = 19;
    this.model = {
        grid : []
    }

    // Init board
    for (var x = 0; x < LENGTH_BOARD; x++) {
        this.model.grid[x] = [];
        for (var y = 0; y < LENGTH_BOARD; y++) {
            this.model.grid[x][y] = 0;
        }
    }

    return {
        template : () => {
        	console.log( JSON.parse(localStorage.getItem(window.location.pathname) ) );

        	//creation de la table
            elemTable = document.createElement("table");
            var row,cel;
            for (y = 0; y < LENGTH_BOARD; y++) {
                row = elemTable.insertRow(-1);
                for (x = 0; x < LENGTH_BOARD; x++) {
                    cel = row.insertCell(-1);
                    cel.id = "grid_"+x+"_"+y;
                    switch (this.model.grid[x][y]) {
                        case 1:
                            cel.className = "first-color";
                            break;
                        case 2:
                            cel.className = "second-color";
                            break;
                        case 0:
                        default:
                            cel.className = "none";
                    }
                }
        	}

        	html = "gauche" + elemTable.outerHTML + "droite";

        	return html ;
    	}
	}
}