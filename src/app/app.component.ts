import {Component} from "@angular/core";
import {Player} from "./model/player";

@Component({
    selector: 'my-app',
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {

    public player1: Player = new Player();

    public player2: Player = new Player();
}
