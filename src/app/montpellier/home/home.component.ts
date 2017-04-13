import {Component} from "@angular/core";
import {Player} from "../../model/player";
import {DataService} from "../../data.service";
import {Router} from "@angular/router";
import {Server} from "../../model/server";

@Component({
    selector: 'app-home',
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class MontpellierHomeComponent {

    public player: Player = new Player();

    public server:Server = new Server();

    constructor(private dataService: DataService, private router: Router) {
    }

    public isFormValid(): boolean {
        return this.player.ip !== undefined && this.player.ip !== undefined &&
             this.server.ip !== undefined
    }

    public play(): void {
        this.dataService.setPlayer(1, this.player);
        this.dataService.server = this.server;
        this.router.navigateByUrl('/montpellier/game');
    }
}
