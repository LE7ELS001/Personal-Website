import * as Phaser from 'phaser'
import { __values } from "tslib";
import { isArcadePhysicsBody } from '../../../../../common/utils';
import { CharacterGameObject } from '../../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from '../../character/base-character-state';
import { CHARACTER_STATES } from '../../character/character-states';
import { ENEMY_BOSS_HIDDEN_STATE_DURATION } from '../../../../../common/config';


export class DrowHiddenState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.HIDDEN_STATE, gameObject); 
    }

    public onEnter(): void {
        this._gameObject.disableObject();
        this._gameObject.scene.time.delayedCall(ENEMY_BOSS_HIDDEN_STATE_DURATION, () => {
            this._gameObject.enableObject();
            this._stateMachine.setState(CHARACTER_STATES.TELEPORT_STATE);
        })
        
    }
}