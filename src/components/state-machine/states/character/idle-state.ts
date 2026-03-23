import { __values } from "tslib";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { ThorwableGameObjectComponent } from "../../../game-object/throwable-object-component";

export class IdleState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.IDLE_STATE, gameObject); 
    }

    public onEnter(): void {
        //Check Direction
        this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
        
        this._resetObjectVelocity();
        const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject);
        if (heldComponent !== undefined && heldComponent.object !== undefined) {
            const ThrowComponent = ThorwableGameObjectComponent.getComponent<ThorwableGameObjectComponent>(heldComponent.object);
            if (ThrowComponent !== undefined) {
                    ThrowComponent.drop();
                }
            heldComponent.drop();
                        
        }
    }

    public onUpdate(): void {
        const controls = this._gameObject.controls;

        if (controls.isMovementLocked)
        {
            return;
        }

        if (controls.isAttackKeyJustDown) {
            this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
            return;
        }

         if (!controls.isLeftDown && !controls.isRightDown && !controls.isUpDown && !controls.isDownDown) { 
             return;
        }

        this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
    }
}