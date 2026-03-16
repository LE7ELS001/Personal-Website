import { __values } from "tslib";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { ThorwableGameObjectComponent } from "../../../game-object/throwable-object-component";

export class ThrowState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.THROW_STATE, gameObject); 
    }

    public onEnter(): void {
        
       
        
        this._resetObjectVelocity();

         this._gameObject.animationComponent.playAnimationInReverse(`LIFT_${this._gameObject.direction}`);
        
        //get the HeldGameObjectComponent
        const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject)
                if (heldComponent === undefined || heldComponent.object === undefined) {
                    return;
        }
        
        const ThrowComponent = ThorwableGameObjectComponent.getComponent<ThorwableGameObjectComponent>(heldComponent.object)
        if (ThrowComponent !== undefined) {
            ThrowComponent.throw(this._gameObject.direction);
        }
        heldComponent.drop();
    }

    public onUpdate(): void {
        if (this._gameObject.animationComponent.isAnimationPlaying())
        {
            return;
        }

        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }
}