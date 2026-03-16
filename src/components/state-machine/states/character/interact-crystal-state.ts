import { __values } from "tslib";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { CUSTOM_EVENTS, EVENT_BUS } from "../../../../common/event-bus";
import { Crystal } from "../../../../game-objects/objects/crystal";

export class InteractCrystalState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.INTERACT_WITH_CRYSTAL_STATE, gameObject); 
    }

    public onEnter(args: unknown[]): void {
        const crystal = args[0] as Crystal;
        
        
        
        this._resetObjectVelocity();

        this._gameObject.animationComponent.playAnimation(`LIFT_${this._gameObject.direction}`, () => {
            console.log('open portfolio')
            EVENT_BUS.emit(CUSTOM_EVENTS.OPENED_PORTFOLIO, crystal);
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
        });
    }

}