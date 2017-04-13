import {Player} from "./model/player";
import {Injectable} from "@angular/core";
import {Server} from "./model/server";
/**
 * Created by Miu on 12/04/2017.
 */
@Injectable()
export class DataService {

    private players: Player[] = [];

    private _server:Server;

    public setPlayer(index: number, player: Player): void {
        this.players[index] = player;
    }

    public getPlayer(index: number): Player {
        return this.players[index];
    }

    get server(): Server {
        return this._server;
    }

    set server(value: Server) {
        this._server = value;
    }
}