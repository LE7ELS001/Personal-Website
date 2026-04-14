import { __values } from "tslib";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { ThorwableGameObjectComponent } from "../../../game-object/throwable-object-component";
import { InputComponent } from "../../../input/input-component";
import { Crystal } from "../../../../game-objects/objects/crystal";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";

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

        // crystal interaction
        if (this.#tryCrystalInteraction(controls)) {
            return;
        }

         if (!controls.isLeftDown && !controls.isRightDown && !controls.isUpDown && !controls.isDownDown) { 
             return;
        }

        this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
    }

    //crystal interaction function 
    #tryCrystalInteraction(controls: InputComponent): boolean {
        if (!controls.isActionKeyJustDown) {
            return false;
        }

        const scene = this._gameObject.scene;
        const crystals = scene.children.list.filter(child => child instanceof Crystal) as Crystal[];

        const targetCrystal = crystals.find(crystal => {
            const comp = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(crystal);
            return comp && comp.canInteractWith(); 
        });

        if (targetCrystal) {
            const comp = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(targetCrystal)!;
            comp.interact();
            this._stateMachine.setState(CHARACTER_STATES.INTERACT_WITH_CRYSTAL_STATE, targetCrystal);
            return true;
        }

        return false;
    }
}