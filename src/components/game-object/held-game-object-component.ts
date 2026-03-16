import { GameObject } from "../../common/types";
import { BaseGameObjectComponent } from "./base-game-object-component";

export class HeldGameObjectComponent extends BaseGameObjectComponent { 
    #obejct: GameObject | undefined;
    
    constructor(gameObject: GameObject) {
        super(gameObject);
    }

    get object(): GameObject | undefined {
        return this.#obejct;
    }

     set object(object: GameObject) {
        this.#obejct = object
    }

    public drop(): void {
        this.#obejct = undefined;
    }
}