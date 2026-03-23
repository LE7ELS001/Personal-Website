import { __values } from "tslib";
import { exhaustiveGuard, isArcadePhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { ThorwableGameObjectComponent } from "../../../game-object/throwable-object-component";
import { WeaponComponent } from "../../../game-object/weapon-component";
import { DIRECTION } from "../../../../common/common";

export class AttackState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.ATTACK_STATE, gameObject); 
    }

    public onEnter(): void {
        this._resetObjectVelocity();
        console.log('attack');


        const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
        if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
            return;     
        }

        const weapon = weaponComponent.weapon;
        switch (this._gameObject.direction) {
            case DIRECTION.UP:
                return weapon.attackUp();
             case DIRECTION.DOWN:
                return weapon.attackDown();
             case DIRECTION.LEFT:
                return weapon.attackLeft();
             case DIRECTION.RIGHT:
                return weapon.attackRight();
            default:
                exhaustiveGuard(this._gameObject.direction);
        }
    }

    public onUpdate(): void {
         const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
        if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
            return;     
        }
        const weapon = weaponComponent.weapon;
        if (weapon.isAttacking) {
            return;
        }
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }
}