import { __values } from "tslib";
import { isArcadePhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { CHARACTER_ANIMATIONS } from "../../../../common/assets";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { ThorwableGameObjectComponent } from "../../../game-object/throwable-object-component";
import { CUSTOM_EVENTS, EVENT_BUS } from "../../../../common/event-bus";

export class DeathState extends BaseCharacterState {
    #onDieCallback: () => void;

    constructor(gameObject: CharacterGameObject, onDieCallback: ()=> void = () => undefined) {
        super(CHARACTER_STATES.DEATH_STATE, gameObject);
        this.#onDieCallback = onDieCallback;
    }

    public onEnter(): void {
        
        //reset velocity  
        this._resetObjectVelocity();

        //get the HeldGameObjectComponent
        const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject)
            if (heldComponent !== undefined && heldComponent.object !== undefined) {
                const ThrowComponent = ThorwableGameObjectComponent.getComponent<ThorwableGameObjectComponent>(heldComponent.object)
                if (ThrowComponent !== undefined) {
                    ThrowComponent.drop();
                }
                heldComponent.drop();
                                           
            }

        this._gameObject.invulnerableComponent.invulnerable = true;
        (this._gameObject.body as Phaser.Physics.Arcade.Body).enable = false;

        this._gameObject.animationComponent.playAnimation(CHARACTER_ANIMATIONS.DIE_DOWN, () => {
            this.#triggerDefeatedEvent();
        });

        

    }

    #triggerDefeatedEvent(): void {
        this._gameObject.disableObject();
        if (this._gameObject.isEnemy) {
            EVENT_BUS.emit(CUSTOM_EVENTS.ENEMY_DESTROYED);
        } else {
            EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_DEFEATED);
        }

        this.#onDieCallback();
        }

}