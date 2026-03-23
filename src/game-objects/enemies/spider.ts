import { ASSET_KEYS, SPIDER_ANIMATION_KEYS } from "../../common/assets";
import { DIRECTION } from "../../common/common";
import { ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MAX, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_WAIT, ENEMY_SPDIER_MAX_HEALTH, ENEMY_SPDIER_PUSH_BACK_SPEED, ENEMY_SPIDER_SPEED} from "../../common/config";
import {  Direction, Position } from "../../common/types";
import { exhaustiveGuard } from "../../common/utils";
import {  AnimationsConfig } from "../../components/game-object/animation-component";
import { InputComponent } from "../../components/input/input-component";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";
import { DeathState } from "../../components/state-machine/states/character/death-state";
import { HurtState } from "../../components/state-machine/states/character/hurt-state";
import { IdleState } from "../../components/state-machine/states/character/idle-state";
import { MoveState } from "../../components/state-machine/states/character/move-state";
import { CharacterGameObject } from "../common/character-game-object";

export type SpiderConfig = {
    scene: Phaser.Scene;
    position: Position;
};

export class Spider extends CharacterGameObject{
    constructor(config: SpiderConfig) {

        const animConfig = { key: SPIDER_ANIMATION_KEYS.WALK, repeat: -1, ignoreIfPlaying: true }
        const hurtAniConfig = { key: SPIDER_ANIMATION_KEYS.HIT, repeat: 0, ignoreIfPlaying: true }
        const deathAnimConfig = { key: SPIDER_ANIMATION_KEYS.DEATH, repeat: 0, ignoreIfPlaying: true }
        //create animation config for player
        const animationConfig: AnimationsConfig = {
            WALK_DOWN: animConfig,
            WALK_UP: animConfig,
            WALK_LEFT: animConfig,
            WALK_RIGHT: animConfig,
            IDLE_DOWN: animConfig,
            IDLE_UP: animConfig,
            IDLE_LEFT: animConfig,
            IDLE_RIGHT: animConfig,
            HURT_DOWN: hurtAniConfig,
            HURT_UP:hurtAniConfig,
            HURT_LEFT: hurtAniConfig,
            HURT_RIGHT: hurtAniConfig,
            DIE_DOWN: deathAnimConfig,
            DIE_UP:deathAnimConfig,
            DIE_LEFT: deathAnimConfig,
            DIE_RIGHT: deathAnimConfig,
        }

        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.SPIDER,
            frame: 0,
            id: `spider-${Phaser.Math.RND.uuid()}`,
            isPlayer: false,
            animationConfig,
            speed: ENEMY_SPIDER_SPEED,
            inputComponent: new InputComponent(),
            isInvulnerable: false,
            maxLife: ENEMY_SPDIER_MAX_HEALTH,
            currentLife:ENEMY_SPDIER_MAX_HEALTH,
        });

        this._directionComponent.callback = (direction: Direction) => {
            this.#handleDirectionChange(direction);
        }


        // add state machine 
        this._stateMachine.addState(new IdleState(this));
        this._stateMachine.addState(new MoveState(this));
        this._stateMachine.addState(new HurtState(this, ENEMY_SPDIER_PUSH_BACK_SPEED));
        this._stateMachine.addState(new DeathState(this));
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);


    }

    public enableObject(): void {
        super.enableObject();

        this.scene.time.addEvent({
            delay: Phaser.Math.Between(ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MAX),
            callback: this.#changeDirection,
            callbackScope: this,
            loop: false,
        });
    }

    #handleDirectionChange(direction: Direction): void {
        switch (direction) {
            case DIRECTION.DOWN:
                this.setAngle(0);
                break;
            case DIRECTION.UP:
                this.setAngle(180);
                break;
            case DIRECTION.LEFT:
                this.setAngle(90);
                break;
            case DIRECTION.RIGHT:
                this.setAngle(270);
                break;
            default:
                exhaustiveGuard(direction);
        }
    }

    #changeDirection(): void {
        this.controls.reset();

        if (!this.active) {
            return;
        }


            this.scene.time.delayedCall(ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_WAIT, () => {
                const randomDirection = Phaser.Math.Between(0, 3);
                if (randomDirection === 0) {
                    this.controls.isUpDown = true;
                } else if (randomDirection === 1) {
                    this.controls.isRightDown = true;
                }else if (randomDirection === 2) {
                    this.controls.isDownDown = true;
                } else {
                    this.controls.isLeftDown = true;
                }

                this.scene.time.addEvent({
                    delay: Phaser.Math.Between(ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MAX),
                    callback: this.#changeDirection,
                    callbackScope: this,
                    loop: false,
                });
            })
        }
    }

    
 
