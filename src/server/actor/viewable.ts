import type { Server } from "../server";
import type { Vector2 } from "../utils/vector2";
import type { Player } from "../player/player";

export abstract class Viewable{
	private viewingPlayers = new Set<Player>();

    constructor(private _server: Server) { }

    abstract onBeshownToPlayer(player: Player): void;
    abstract getLandPos(): Vector2;
	abstract getHash(): string;

	showTo(player: Player) {
		if (this.viewingPlayers.has(player)) {
			return;
		}
		this.viewingPlayers.add(player);

        this.onBeshownToPlayer(player);
	}

    abstract onBeunshownToPlayer(player: Player): void;

	unshowTo(player: Player) {
		if (!this.viewingPlayers.has(player)) {
			return;
		}
		this.viewingPlayers.delete(player);

        this.onBeunshownToPlayer(player);
	}

    showToAllCansee() {
		for (const player of this._server.getPlayerList().values()) {
			if (player.canSeeLand(this.getLandPos())) {
				this.showTo(player);
			}
		}
	}

	unshowToAll() {
		for (const viewer of this.getViewers()) {
			this.unshowTo(viewer);
		}
	}

	getViewers() {
		return Array.from(this.viewingPlayers.values());
	}
}