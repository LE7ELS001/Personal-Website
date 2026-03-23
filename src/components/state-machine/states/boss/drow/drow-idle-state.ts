import * as Phaser from 'phaser'
import { __values } from "tslib";
import { CharacterGameObject } from "../../../../../game-objects/common/character-game-object";
import { BaseCharacterState } from "../../character/base-character-state";
import { CHARACTER_STATES } from "../../character/character-states";
import {  ENEMY_BOSS_IDLE_STATE_DURATION } from "../../../../../common/config";


export class DrowIdleState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.IDLE_STATE, gameObject); 
    }

    public onEnter(): void {
        
        this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
        
        this._gameObject.scene.time.delayedCall(ENEMY_BOSS_IDLE_STATE_DURATION, () => {
            if (this._stateMachine.currentStateName === CHARACTER_STATES.IDLE_STATE) {
                this._stateMachine.setState(CHARACTER_STATES.TELEPORT_STATE);
            }
        });
    }

}