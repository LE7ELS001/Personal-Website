import { __values } from "tslib";
import { exhaustiveGuard, isArcadePhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { Direction } from "../../../../common/types";
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { InputComponent } from "../../../input/input-component";
import { CollidingObjectsComponent } from "../../../game-object/colliding-objects-components";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";

export abstract class BaseMoveState extends BaseCharacterState {
    protected moveAnimationPrefix: 'WALK' | 'WALK_HOLD';

    constructor(stateName: string , gameObject: CharacterGameObject, moveAnimationPrefix: 'WALK' | 'WALK_HOLD') {
        super(stateName, gameObject);
        this.moveAnimationPrefix = moveAnimationPrefix;
    }


    protected isNoInputMovemnt(controls: InputComponent): boolean {
       return (!controls.isLeftDown && !controls.isRightDown && !controls.isUpDown && !controls.isDownDown || controls.isMovementLocked)   
    }


    protected handleCharacterMovement(): void {
        const controls = this._gameObject.controls;


        if (controls.isUpDown) {
            this.updateVelocity(false, -1);
            this.updateDirection(DIRECTION.UP);
        }
        else if (controls.isDownDown) {
            this.updateVelocity(false, 1);
            this.updateDirection(DIRECTION.DOWN);
        }
        else {
            this.updateVelocity(false, 0);
        }

        const isMovingVertically = controls.isDownDown || controls.isUpDown;
        if (controls.isLeftDown) {
            this._gameObject.setFlipX(true);
            this.updateVelocity(true, -1);
            if (!isMovingVertically) {
                this.updateDirection(DIRECTION.LEFT);
            }
        }
        else if (controls.isRightDown) {
            this._gameObject.setFlipX(false);
            this.updateVelocity(true, 1);
            if (!isMovingVertically) {
                this.updateDirection(DIRECTION.RIGHT);
            }
        }
        else {
            this.updateVelocity(true, 0);
        }

     

        this.normalizeVeloctiy();
    }

    protected updateVelocity(isX: boolean, value: number): void {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }
        if (isX) {
            this._gameObject.body.velocity.x = value;
            return;
        }
        this._gameObject.body.velocity.y = value;
    }

    protected normalizeVeloctiy(): void {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }

       
        this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
        //debug 
        //console.log(this.body.velocity);
    }

    protected updateDirection(direction: Direction): void {
        this._gameObject.direction = direction;
        this._gameObject.animationComponent.playAnimation(`${this.moveAnimationPrefix}_${this._gameObject.direction}`);
    }

}