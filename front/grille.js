var nx = 19; 				// nombre de cellules en largeur
var ny = 19; 				// nombre de cellules en hauteur
var nbAligne = 5; 			// nombre de jetons à aligner pour gagner
var couleurTour = 1; 		// couleur dont c'est le tour
var continueJeu = false; 	// permet d'indiquer si le jeu est arrêté ou non
var iaProfondeurMax = 2;	// indique la profondeur de recherche de l'IA
var iaNoir = false; 		// indique si le joueur noir est une IA
var iaBlanc = true; 		// indique si le joueur blanc est une IA
var grid = []; 				// grille du jeu
var iaWorker; 				// worker gérant l'IA (si le navigateur supportent les workers)
var elemTable; 				// élément contenant les éléments d'affichage du jeu
var progressIA; 			// élément permettant d'indiquer où en est l'ordinateur
var nbCoupLimite = 30;		// nombre de coup maximum
var nbCoup1 = nbCoupLimite;	// nombre de coup disponible pour le joueur1
var nbCoup2 = nbCoupLimite;	// nombre de coup disponible pour le joueur2
var lastPlayTime; 			// Timestamp du dernier coup en secondes
var labelPlayer1 = "noir";	// nom du premier joueur
var labelPlayer2 = "rouge";	// nom du second joueur
var nbTenailles1 = 0;		// nombre de tenailles réalisées par le joueur 1
var nbTenailles2 = 0;		// nombre de tenailles réalisées par le joueur 
var turn = 1;
var turn_running = false;

var players = [
{name:"player1", ip:"localhost:8000"},
{name:"player2", ip:"localhost:8000"}
]

// Lance l'initialisation de la grille une fois que la page est loadée
//window.addEventListener("load", init, false);

// Initialisation d'une partie
function init() {

	/*
	// Initialisation de la grille
	for (var x = 0; x < nx; x++) {
		grid[x] = [];
		for (var y = 0; y < ny; y++) {
			grid[x][y] = 0;
		}
	}

	// Suppression de la grille précédente dans le DOM
	if(elemTable) document.body.removeChild(elemTable);

	// Affichage de la grille de jeu
	elemTable = document.createElement("table");
	var row,cel;
	for (y = 0; y < ny; y++) {
		row = elemTable.insertRow(-1);
		for (x = 0; x < nx; x++) {
			cel = row.insertCell(-1);
			cel.id = "grid_"+x+"_"+y;
			switch (grid[x][y]) {
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
	*/
	//document.body.appendChild(elemTable);
	couleurTour = Math.floor(Math.random() * 2) + 1;
	turn++;
	continueJeu = true;

	// Force le premier joueur à placer au milieu
	play(Math.trunc(nx/2), Math.trunc(ny/2));
	couleurTour = couleurTour%2+1;

	play_game(players[couleurTour - 1], couleurTour, turn);

	lastPlayTime = Math.floor(Date.now() / 1000);
};

function play_game(player, numplayer, numturn){
	if (!continueJeu) return false;
	setTimeout(() => {
		$.ajax({
			method: "PUT",
			url: "http://" + player.ip + "/board", 
			data:JSON.stringify({
				board:grid,
				score:numplayer == 1?nbTenailles1:nbTenailles2,
				score_vs:numplayer == 1?nbTenailles2:nbTenailles1,
				player: numplayer,
				round: numturn
			}),
			contentType: "application/json",
			success: (res) => {
				var checked = check(res, numturn, grid, new Date().getTime());
				if(checked.result === 1){
					play(res.x, res.y);
					couleurTour = couleurTour%2+1;
					numturn ++;
					play_game(players[couleurTour - 1], couleurTour, numturn)		
				}else{
					play_game(players[couleurTour - 1], couleurTour, numturn)
				}
			}
		});
	}, 300);
};

// Permet de jouer un pion en x,y
function play(x, y) {
	if (!continueJeu) return false;

	var rslt;
	// Change la couleur de la case où le pion est joué
	grid[x][y] = couleurTour;
	var elem = $("#grid_"+x+"_"+y);
	if (elem) elem.attr('class', couleurTour === 1 ? "first-color" : "second-color");

	// On vérifie si le coup joué n'a pas généré une tenaille
	// si c'est le cas, on incrémente le compteur du joueur courant
	checkTenailles(x, y, grid);

	// Vérifie les conditions de fin de partie : victoire ou égalité
	if (rslt = checkWinner(x, y, grid)) endGame("Vainqueur : " + (rslt === 1 ? labelPlayer1 : labelPlayer2));

	if (!canPlay(nbCoup1, nbCoup2)) endGame("Partie nulle : égalité");

	// Décrémentation du nombre de jeton du joueur
	if ((couleurTour === 1 && iaNoir) || (couleurTour === 2 && iaBlanc)) {
		nbCoup1--;
	} else {
		nbCoup2--;
	}
	lastPlayTime = Math.floor(Date.now() / 1000);
}


// Mets fin à la partie en indiquant le message en entrée
function endGame(message) {
	console.log(message);
	continueJeu = false;
	alert(message);
}

// Vérifie s'il reste des coups jouables sur la grille
function canPlay(pawnCounter1, pawnCounter2) {
	var nbLibre = 0;
	// Vérifie s'il reste des jetons aux joueurs
	if (pawnCounter1 == 0 && pawnCounter2 == 0) return nbLibre;

	// Vérifie s'il reste des cases disponibles pour jouer
	for (var x = 0; x < nx; x++) {
		for (var y = 0; y < ny; y++) {
			if (grid[x][y] === 0) nbLibre++;
		}
	}
	return nbLibre;
}

// Vérifie si le dernier coup donne la victoire au joueur en cours
function checkWinner(x, y, vGrille) {
	var couleurJeton = vGrille[x][y]; 	// couleur du jeton qui vient d'être joué
	var alignH = 1; 					// nombre de jetons alignés horizontalement
	var alignV = 1; 					// nombre de jetons alignés verticalement
	var alignD1 = 1; 					// nombre de jetons alignés diagonalement NO-SE
	var alignD2 = 1; 					// nombre de jetons alignés diagonalement SO-NE
	var xt,yt;


	// vérification horizontale
	xt=x-1;
	yt=y;
	while (xt >= 0 && vGrille[xt][yt] === couleurJeton) {
		xt--;
		alignH++;
	}
	xt=x+1;
	yt=y;
	while (xt < nx && vGrille[xt][yt] === couleurJeton) {
		xt++;
		alignH++;
	}

	// vérification verticale
	xt=x;
	yt=y-1;
	while (yt >= 0 && vGrille[xt][yt] === couleurJeton) {
		yt--;
		alignV++;
	}
	xt=x;
	yt=y+1;
	while (yt < ny && vGrille[xt][yt] === couleurJeton) {
		yt++;
		alignV++;
	}

	// vérification diagonale NO-SE
	xt=x-1;
	yt=y-1;
	while (xt >= 0 && yt >= 0 && vGrille[xt][yt] === couleurJeton) {
		xt--;
		yt--;
		alignD1++;
	}
	xt=x+1;
	yt=y+1;
	while (xt < nx && yt < ny && vGrille[xt][yt] === couleurJeton) {
		xt++;
		yt++;
		alignD1++;
	}

	// Vérification diagonale SO-NE
	xt=x-1;
	yt=y+1;
	while (xt >= 0 && yt < ny && vGrille[xt][yt] === couleurJeton) {
		xt--;
		yt++;
		alignD2++;
	}
	xt=x+1;
	yt=y-1;
	while (xt < nx && yt >= 0 && vGrille[xt][yt] === couleurJeton) {
		xt++;
		yt--;
		alignD2++;
	}

	// On vérifie si le coup joué n'a pas généré une tenaille
	// si c'est le cas, on incrémente le compteur du joueur courant
	//checkTenailles(x, y, vGrille);

	// Parmis tous ces résultats on regarde s'il y en a un qui dépasse le nombre nécessaire pour gagner
	if (couleurTour === 1) {
		if (Math.max(alignH, alignV, alignD1, alignD2, nbTenailles1) >= nbAligne) {
			return couleurJeton;
		}
	} else {
		if (Math.max(alignH, alignV, alignD1, alignD2, nbTenailles2) >= nbAligne) {
			return couleurJeton;
		}
	}
	
	return 0;
}

// Vérifie si le dernier coup créé une tenaille
// si c'est le cas, on incrémente le compteur du joueur courant
function checkTenailles(x, y, vGrille) {
	var couleurJeton = vGrille[x][y]; 	// couleur du jeton qui vient d'être joué
	var couleurAdv;						// couleur des jetons de l'adversaire
	var compteurJetonsAdv = 0; 			// compteur permettant de savoir combien de jetons adverses se trouvent entre deux jetons du joueur courant
	var tenaillesTrouve = 0;			// booléen permettant de savoir si le coup à créé une tenaille
	var stopRecherche = false;
	var xt,yt;

	if (couleurJeton == 1) {
		couleurAdv = 2;
	} else {
		couleurAdv = 1;
	}

	for (i = -1; i <= 1; i++) {
		for (j = -1; j <= 1; j++) {
			if ((0 > x+i) || (x+i > 18) || (0 > y+j) || (y+j > 18)
				|| (0 > x+(2*i)) || (x+(2*i) > 18) || (0 > y+(2*j)) || (y+(2*j) > 18)
				|| (0 > x+(3*i)) || (x+(3*i) > 18) || (0 > y+(3*j)) || (y+(3*j) > 18)) {
				continue;
			}

			if (vGrille[x + i][y + j] === couleurAdv) {
				if (vGrille[x + (2*i)][y + (2*j)] === couleurAdv) {
					if (vGrille[x + (3*i)][y + (3*j)] === couleurJeton) {
						// On est dans le cas d'une tenaille
						// On supprime les jetons pris en tenaille et on incrémente le compteur de tenailles du joueur
						vGrille[x + i][y + j] = 0;
						vGrille[x + (2*i)][y + (2*j)] = 0;
						tenaillesTrouve++;
					}
				}
			}
		}
	}

	// Si on a trouvé une tenaille, on incrémente le compteur du joueur
	if (tenaillesTrouve != 0) {
		if (couleurTour === 1) {
			nbTenailles1 += tenaillesTrouve;
		} else {
			nbTenailles2 += tenaillesTrouve;
		}
	}

	return 0;
}
