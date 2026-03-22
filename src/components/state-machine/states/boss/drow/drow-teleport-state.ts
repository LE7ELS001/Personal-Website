import * as Phaser from 'phaser'
import { __values } from "tslib";
import { isArcadePhysicsBody } from '../../../../../common/utils';
import { CharacterGameObject } from '../../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from '../../character/base-character-state';
import { CHARACTER_STATES } from '../../character/character-states';
import { ENEMY_BOSS_HIDDEN_STATE_DURATION, ENEMY_BOSS_TELEPORT_INITIAL_STATE_DURATION, ENEMY_BOSS_TELEPORT_STATE_FINISHED_DURATION, ENEMY_DROW_DEATH_ANIMATION_DURATION } from '../../../../../common/config';


export class DrowTeleportState extends BaseCharacterState {
    #possibleTeleportLocation: Phaser.Math.Vector2[];

    constructor(gameObject: CharacterGameObject, possibleTeleportLocation: Phaser.Math.Vector2[]) {
        super(CHARACTER_STATES.TELEPORT_STATE, gameObject); 
        this.#possibleTeleportLocation = possibleTeleportLocation;
    }

    public onEnter(): void {
        this._gameObject.invulnerableComponent.invulnerable = true;
        const timeEvent = this._gameObject.scene.time.addEvent({
            delay: ENEMY_BOSS_TELEPORT_INITIAL_STATE_DURATION,
            callback: () => {
                if (timeEvent.getOverallProgress() === 1) {
                    this.#handleTeleportFinished();
                    return;
                }
                const location =
                    this.#possibleTeleportLocation[timeEvent.repeatCount % this.#possibleTeleportLocation.length];
                this._gameObject.setPosition(location.x, location.y);
            },
            callbackScope: this,
            repeat: this.#possibleTeleportLocation.length * 3 - 1,
        });
        
    }

    #handleTeleportFinished(): void {
        this._gameObject.visible = false;
        this._gameObject.scene.time.delayedCall(ENEMY_BOSS_TELEPORT_STATE_FINISHED_DURATION, ()=> 
        {
            const randomLocaton = Phaser.Utils.Array.GetRandom(this.#possibleTeleportLocation);
            this._gameObject.setPosition(randomLocaton.x, randomLocaton.y);
            this._gameObject.visible = true;
            this._gameObject.invulnerableComponent.invulnerable = false;
            this._stateMachine.setState(CHARACTER_STATES.PREPARE_ATTACK_STATE);
        })
    }
}