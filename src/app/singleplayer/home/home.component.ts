import {Component} from "@angular/core";
import {Player} from "../../model/player";
import {DataService} from "../../data.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class SinglePlayerHomeComponent {

    public player1: Player = new Player();

    constructor(private dataService: DataService, private router: Router) {
    }

    public isFormValid(): boolean {
        return this.player1.ip !== undefined && this.player1.ip !== undefined
    }

    public play(): void {
        this.dataService.setPlayer(1, this.player1);
        let human:Player = new Player();
        human.name = "Joueur";
        this.dataService.setPlayer(2, human);
        this.router.navigateByUrl('/singleplayer/game');
    }
}
