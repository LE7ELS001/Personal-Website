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
import { Player } from "../../../../game-objects/player/player";
import { PLAYER_SPEED } from "../../../../common/config";

export abstract class BaseMoveState extends BaseCharacterState {
    protected moveAnimationPrefix: 'WALK' | 'WALK_HOLD';

    constructor(stateName: string , gameObject: CharacterGameObject, moveAnimationPrefix: 'WALK' | 'WALK_HOLD') {
        super(stateName, gameObject);
        this.moveAnimationPrefix = moveAnimationPrefix;
    }


    protected isNoInputMovemnt(controls: InputComponent): boolean {
       return (!controls.isLeftDown && !controls.isRightDown && !controls.isUpDown && !controls.isDownDown || controls.isMovementLocked)   
    }


    protected handleIntergratedMovement(player: Player, controls: InputComponent): void {

        //keyboard input first 
        if (!this.isNoInputMovemnt(controls)) {
            player.moveTarget = null;
            this.handleCharacterMovement();
            return;
        }

        //mouse input 
        if (player.moveTarget) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                player.moveTarget.x, player.moveTarget.y
            );

            if (distance < 4) {
                if (player.body) {
                    (player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
                }
                player.moveTarget = null;
                this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
            } else {
               this._gameObject.scene.physics.moveToObject(player, player.moveTarget, PLAYER_SPEED);
                this.#updateDirectionFromTarget(player);
            }
        }
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


    #updateDirectionFromTarget(player: Player): void {
        if (!player.moveTarget) return;

        const dx = player.moveTarget.x - player.x;
        const dy = player.moveTarget.y - player.y;

        let targetDirection: Direction;

        if (Math.abs(dx) > Math.abs(dy)) {
            
            targetDirection = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
            this._gameObject.setFlipX(dx <= 0); 
        } else {
            
            targetDirection = dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
        }

        
        this.updateDirection(targetDirection);
    }

}