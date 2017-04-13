import {Component, OnInit} from "@angular/core";
import {DataService} from "../data.service";
import {Player} from "../model/player";
import {Http, Headers} from "@angular/http";
import {MdDialog} from "@angular/material";
/**
 * Created by Miu on 12/04/2017.
 */
@Component({
    selector: 'app-game',
    templateUrl: "./game.component.html",
    styleUrls: ["./game.component.css"]
})
export class GameComponent implements OnInit {

    public nx = 19; 				// nombre de cellules en largeur
    public ny = 19; 				// nombre de cellules en hauteur
    public nbAligne = 5; 			// nombre de jetons à aligner pour gagner
    public couleurTour = 1; 		// couleur dont c'est le tour
    public continueJeu = false; 	// permet d'indiquer si le jeu est arrêté ou non
    public grid: number[][] = []; 				// grille du jeu
    public nbCoup1: number = 30;	// nombre de coup disponible pour le joueur1
    public nbCoup2: number = 30;	// nombre de coup disponible pour le joueur2
    public lastPlayTime: number; 			// Timestamp du dernier coup en secondes
    public nbTenailles1 = 0;		// nombre de tenailles réalisées par le joueur 1
    public nbTenailles2 = 0;		// nombre de tenailles réalisées par le joueur
    public turn = 1;

    public start: Date;

    public now: Date = new Date();

    private headers: Headers = new Headers();

    constructor(private dataService: DataService, private http: Http, private dialog: MdDialog) {
        this.headers.append("content-type", "application/json");
        // Initialisation de la grille
        for (let x = 0; x < this.nx; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.ny; y++) {
                this.grid[x][y] = 0;
            }
        }

        setInterval(() => {
            this.now = new Date();
        }, 1000);

        this.start = new Date();
    }

    public getTime(): Date {
        return new Date(this.now.getTime() - this.start.getTime());
    }

    public getPlayer(index: number): Player {
        //Mock pour pouvoir bosser sur la vue game sans passer par home à chaque test.
        // let p = new Player();
        // p.ip = "127.0.0.1:8000";
        // p.name = "generated player";
        // return p;
        return this.dataService.getPlayer(index);
    }

    /*
     ADAPTATION grille.js
     */
    ngOnInit(): void {
        this.couleurTour = Math.floor(Math.random() * 2) + 1;
        this.turn++;
        this.continueJeu = true;

        // Force le premier joueur à placer au milieu
        this.play(Math.trunc(this.nx / 2), Math.trunc(this.ny / 2));
        this.couleurTour = this.couleurTour % 2 + 1;

        let start = new Date().getTime();

        this.play_game(this.couleurTour, this.turn, start);

        this.lastPlayTime = Math.floor(Date.now() / 1000);
    }

    play_game(numplayer: number, numturn: number, startTime: number): void {
        if (!this.continueJeu) return;
        setTimeout(() => {
            this.http.put(
                "http://" + this.getPlayer(numplayer).ip + "/board/",
                JSON.stringify({
                    board: this.grid,
                    score: numplayer == 1 ? this.nbTenailles1 : this.nbTenailles2,
                    score_vs: numplayer == 1 ? this.nbTenailles2 : this.nbTenailles1,
                    player: numplayer,
                    round: numturn
                }),
                {headers: this.headers}
            ).subscribe(response => {
                let res = response.json();
                let checked = this.check(res, numturn, startTime);
                if (checked.result) {
                    this.play(res.x, res.y);
                    this.couleurTour = this.couleurTour % 2 + 1;
                    numturn++;
                    this.play_game(this.couleurTour, numturn, new Date().getTime());
                } else if (checked.isTimeout) {
                    let winner = this.couleurTour == 1 ? 2 : 1;
                    this.endGame("Victoire par timeout, " + this.getPlayer(winner - 1).name + " a Gagné");
                } else {
                    this.play_game(this.couleurTour, numturn, startTime);
                }
            });
        }, 300);
    }

    play(x: number, y: number): void {
        if (!this.continueJeu) return;

        let rslt: number;
        // Change la couleur de la case où le pion est joué
        this.grid[x][y] = this.couleurTour;

        // On vérifie si le coup joué n'a pas généré une tenaille
        // si c'est le cas, on incrémente le compteur du joueur courant
        this.checkTenailles(x, y);

        // Vérifie les conditions de fin de partie : victoire ou égalité
        setTimeout(() => {
            if (rslt = this.checkWinner(x, y)) this.endGame("Vainqueur : " + (rslt === 1 ? this.getPlayer(1).name : this.getPlayer(2).name));
        }, 50);

        if (!this.canPlay(this.nbCoup1, this.nbCoup2)) this.endGame("Partie nulle : égalité");

        // Décrémentation du nombre de jeton du joueur
        if (this.couleurTour === 1) {
            this.nbCoup1--;
        } else {
            this.nbCoup2--;
        }
    }

    endGame(message: string): void {
        console.log(message);
        this.continueJeu = false;
        alert(message);
    }

    canPlay(pawnCounter1: number, pawnCounter2: number): boolean {
        let nbLibre = 0;
        // Vérifie s'il reste des jetons aux joueurs
        if (pawnCounter1 == 0 && pawnCounter2 == 0) return false;

        // Vérifie s'il reste des cases disponibles pour jouer
        for (let x = 0; x < this.nx; x++) {
            for (let y = 0; y < this.ny; y++) {
                if (this.grid[x][y] === 0) nbLibre++;
            }
        }
        return true;
    }

    checkWinner(x: number, y: number): number {
        let couleurJeton = this.grid[x][y]; 	// couleur du jeton qui vient d'être joué
        let alignH = 1; 					// nombre de jetons alignés horizontalement
        let alignV = 1; 					// nombre de jetons alignés verticalement
        let alignD1 = 1; 					// nombre de jetons alignés diagonalement NO-SE
        let alignD2 = 1; 					// nombre de jetons alignés diagonalement SO-NE
        let xt, yt;


        // vérification horizontale
        xt = x - 1;
        yt = y;
        while (xt >= 0 && this.grid[xt][yt] === couleurJeton) {
            xt--;
            alignH++;
        }
        xt = x + 1;
        yt = y;
        while (xt < this.nx && this.grid[xt][yt] === couleurJeton) {
            xt++;
            alignH++;
        }

        // vérification verticale
        xt = x;
        yt = y - 1;
        while (yt >= 0 && this.grid[xt][yt] === couleurJeton) {
            yt--;
            alignV++;
        }

        xt = x;
        yt = y + 1;
        while (yt < this.ny && this.grid[xt][yt] === couleurJeton) {
            yt++;
            alignV++;
        }
        // vérification diagonale NO-SE
        xt = x - 1;
        yt = y - 1;
        while (xt >= 0 && yt >= 0 && this.grid[xt][yt] === couleurJeton) {
            xt--;
            yt--;
            alignD1++;
        }
        xt = x + 1;
        yt = y + 1;
        while (xt < this.nx && yt < this.ny && this.grid[xt][yt] === couleurJeton) {
            xt++;
            yt++;
            alignD1++;
        }

        // Vérification diagonale SO-NE
        xt = x - 1;
        yt = y + 1;
        while (xt >= 0 && yt < this.ny && this.grid[xt][yt] === couleurJeton) {
            xt--;
            yt++;
            alignD2++;
        }
        xt = x + 1;
        yt = y - 1;
        while (xt < this.nx && yt >= 0 && this.grid[xt][yt] === couleurJeton) {
            xt++;
            yt--;
            alignD2++;
        }

        // On vérifie si le coup joué n'a pas généré une tenaille
        // si c'est le cas, on incrémente le compteur du joueur courant
        //checkTenailles(x, y, this.grid);

        // Parmis tous ces résultats on regarde s'il y en a un qui dépasse le nombre nécessaire pour gagner
        if (this.couleurTour === 1) {
            if (Math.max(alignH, alignV, alignD1, alignD2, this.nbTenailles1) >= this.nbAligne) {
                return couleurJeton;
            }
        } else {
            if (Math.max(alignH, alignV, alignD1, alignD2, this.nbTenailles2) >= this.nbAligne) {
                return couleurJeton;
            }
        }

        return 0;
    }

    checkTenailles(x: number, y: number) {
        let couleurJeton = this.grid[x][y]; 	// couleur du jeton qui vient d'être joué
        let couleurAdv;						// couleur des jetons de l'adversaire
        let tenaillesTrouve = 0;			// booléen permettant de savoir si le coup à créé une tenaille

        if (couleurJeton == 1) {
            couleurAdv = 2;
        } else {
            couleurAdv = 1;
        }

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((0 > x + i) || (x + i > 18) || (0 > y + j) || (y + j > 18)
                    || (0 > x + (2 * i)) || (x + (2 * i) > 18) || (0 > y + (2 * j)) || (y + (2 * j) > 18)
                    || (0 > x + (3 * i)) || (x + (3 * i) > 18) || (0 > y + (3 * j)) || (y + (3 * j) > 18)) {
                    continue;
                }

                if (this.grid[x + i][y + j] === couleurAdv) {
                    if (this.grid[x + (2 * i)][y + (2 * j)] === couleurAdv) {
                        if (this.grid[x + (3 * i)][y + (3 * j)] === couleurJeton) {
                            // On est dans le cas d'une tenaille
                            // On supprime les jetons pris en tenaille et on incrémente le compteur de tenailles du joueur
                            this.grid[x + i][y + j] = 0;
                            this.grid[x + (2 * i)][y + (2 * j)] = 0;
                            tenaillesTrouve++;
                        }
                    }
                }
            }
        }

        // Si on a trouvé une tenaille, on incrémente le compteur du joueur
        if (tenaillesTrouve != 0) {
            if (this.couleurTour === 1) {
                this.nbTenailles1 += tenaillesTrouve;
            } else {
                this.nbTenailles2 += tenaillesTrouve;
            }
        }

        return 0;
    }

    check(pawn: {x: number, y: number}, round: number, start: number): {result: boolean, isTimeout: boolean} {
        // time when we receive the answer
        let currentTime = new Date().getTime();

        let resultNumber = 1;

        let res: boolean;

        // Get X and Y
        let x = pawn.x;
        let y = pawn.y;

        // check if x is an integer
        resultNumber &= this.isInt(x) ? 1 : 0;

        // check if y is an integer
        resultNumber &= this.isInt(y) ? 1 : 0;

        // check if x is on the board
        resultNumber &= ( x > -1 || x < 20 ) ? 1 : 0;

        // check if y is on the board
        resultNumber &= ( y > -1 || y < 20 ) ? 1 : 0;

        // check if the board's square
        // try catch because if x or y is not an integer an excpetion is throw
        try {
            resultNumber &= ( this.grid[x][y] == 0 ) ? 1 : 0;
        } catch (Exception) {
            resultNumber &= 0;
        }

        // check if time is respected
        let isTimeout = false;
        if (( currentTime - start ) > 10 * 1000) {
            isTimeout = true;
            resultNumber = 0;
        }

        // check for the round 2 if the case is into the 8 squares allowed
        if (round == 3) {
            //si 2eme requete --> 3 ou plus intersection
            resultNumber &= ( ( x < 8 || x > 10 ) || ( y < 8 || y > 10 ) ) ? 1 : 0;
        }

        res = resultNumber == 1;

        return {result: res, isTimeout: isTimeout};
    }

    /*
     * return true if the param is en integer
     */
    isInt(value: any): boolean {
        return !isNaN(value) && parseInt(value) == value && !isNaN(parseInt(value, 10));
    }
}