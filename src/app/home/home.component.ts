import {Component} from '@angular/core';
import {Player} from '../model/player';
import {DataService} from '../data.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {

    public player1: Player = new Player();

    public player2: Player = new Player();

    constructor(private dataService: DataService, private router: Router) {
        this.player1.name = 'IAJS';
        this.player1.ip = 'localhost:3001';
        this.player2.name = 'IAPython';
        this.player2.ip = 'localhost:3002';
    }

    public isFormValid(): boolean {
        return this.player1.ip !== undefined && this.player2.ip !== undefined &&
            this.player1.name !== undefined && this.player2.name !== undefined
    }

    public play(): void {
        this.dataService.setPlayer(1, this.player1);
        this.dataService.setPlayer(2, this.player2);
        this.router.navigateByUrl('/game');
    }
}
