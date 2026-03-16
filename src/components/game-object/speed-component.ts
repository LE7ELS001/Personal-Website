import { GameObject } from "../../common/types";
import { InputComponent } from "../input/input-component";
import { BaseGameObjectComponent } from "./base-game-object-component";

export class SpeedComponent extends BaseGameObjectComponent { 
    #speed: number;
    
    constructor(gameObject: GameObject, speed: number) {
        super(gameObject);
        this.#speed = speed;
    }

    get speed(): number {
        return this.#speed;
    }
}