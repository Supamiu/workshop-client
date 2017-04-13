import {Player} from "./model/player";
import {Injectable} from "@angular/core";
/**
 * Created by Miu on 12/04/2017.
 */
@Injectable()
export class DataService {

    private players: Player[] = [];

    public setPlayer(index: number, player: Player): void {
        this.players[index] = player;
    }

    public getPlayer(index: number): Player {
        return this.players[index];
    }
}