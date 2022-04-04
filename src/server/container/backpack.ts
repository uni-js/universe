import { PlayerContainer } from "./player-container";

export class Backpack extends PlayerContainer{
    getSize(): number {
        return 20;
    }
}