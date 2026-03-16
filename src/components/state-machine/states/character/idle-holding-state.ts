import { __values } from "tslib";
import { isArcadePhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";

export class IdleHoldingState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.IDLE_HOLDING_STATE, gameObject); 
    }

    public onEnter(): void {
        this._gameObject.animationComponent.playAnimation(`IDLE_HOLD_${this._gameObject.direction}`);
        
        this._resetObjectVelocity();
    }

    public onUpdate(): void {
        const controls = this._gameObject.controls;

        if (controls.isActionKeyJustDown) {
            // throw item
            this._stateMachine.setState(CHARACTER_STATES.THROW_STATE);
            return;
        }

        // if no other input, keep holding the item
         if (!controls.isLeftDown && !controls.isRightDown && !controls.isUpDown && !controls.isDownDown) { 
             return;
        }

        this._stateMachine.setState(CHARACTER_STATES.MOVE_HOLDING_STATE);
    }
}