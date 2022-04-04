import { HTMLInputProvider, InputKey } from "@uni.js/html-input";
import { DirectionType } from "../../server/actor/actor";
import { LoginEvent } from "../../server/event/client";
import { LoginedEvent } from "../../server/event/server";
import { Vector2 } from "../../server/utils/vector2";
import { GameClientApp } from "../client-app";
import { Player } from "./player";

export class PlayerManager{
    private player: Player;
    private input: HTMLInputProvider
    constructor(private app: GameClientApp) {
        this.input = this.app.getInputProvider();
        this.app.getEventBus().on(LoginedEvent, this.onLoginedEvent.bind(this));
    }

    emitEvent(event: any) {
        return this.app.emitEvent(event);
    }

    login() {
        const event = new LoginEvent();
        event.username = 'TestPlayer';
        this.emitEvent(event);
    }

    private setMainPlayer(player: Player) {
        if (this.player) {
            return;
        }
        this.player = player;
        this.player.setIsMaster();
    }

    private onLoginedEvent(event: LoginedEvent) {
        console.log("player is logined:", event);

        const player = <Player>this.app.getActorManager().getActor(event.playerActorId);
        if (player) {
            this.setMainPlayer(player);
            console.log("set main player: ", event.playerActorId);
        }
    }
    
    private doControlMoveTick() {
		if(!this.player) {
			return;
		}

        const moveSpeed = 0.06;

		const upPress = this.input.keyPress(InputKey.W);
		const downPress = this.input.keyPress(InputKey.S);
		const leftPress = this.input.keyPress(InputKey.A);
		const rightPress = this.input.keyPress(InputKey.D);

		let deltaMove;
		if (upPress && leftPress) {
			deltaMove = new Vector2(-0.707 * moveSpeed, -0.707 * moveSpeed);
		} else if (upPress && rightPress) {
			deltaMove = new Vector2(0.707 * moveSpeed, -0.707 * moveSpeed);
		} else if (downPress && leftPress) {
			deltaMove = new Vector2(-0.707 * moveSpeed, 0.707 * moveSpeed);
		} else if (downPress && rightPress) {
			deltaMove = new Vector2(0.707 * moveSpeed, 0.707 * moveSpeed);
		} else if (downPress) {
			deltaMove = new Vector2(0, moveSpeed);
		} else if (leftPress) {
			deltaMove = new Vector2(-moveSpeed, 0);
		} else if (rightPress) {
			deltaMove = new Vector2(moveSpeed, 0);
		} else if (upPress) {
			deltaMove = new Vector2(0, -moveSpeed);
		}

		if (deltaMove) {
			if (deltaMove.y > 0) {
				this.player.controlDirection(DirectionType.FORWARD);
			} else if (deltaMove.y < 0) {
				this.player.controlDirection(DirectionType.BACK);
			} else if (deltaMove.x > 0) {
				this.player.controlDirection(DirectionType.RIGHT);
			} else if (deltaMove.x < 0) {
				this.player.controlDirection(DirectionType.LEFT);
			}
		}

		if (!upPress && !leftPress && !rightPress && !downPress) {
			this.player.controlMove(false);
		} else {			
			this.player.controlMove(deltaMove);
        }
    }

    doFixedUpdateTick(tick: number) {
        this.doControlMoveTick();

    }
}