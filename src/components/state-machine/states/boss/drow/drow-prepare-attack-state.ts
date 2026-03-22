import * as Phaser from 'phaser'
import { __values } from "tslib";
import { isArcadePhysicsBody } from '../../../../../common/utils';
import { CharacterGameObject } from '../../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from '../../character/base-character-state';
import { CHARACTER_STATES } from '../../character/character-states';
import { ENEMY_BOSS_HIDDEN_STATE_DURATION } from '../../../../../common/config';


export class DrowPrepareAttackState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.PREPARE_ATTACK_STATE, gameObject); 
    }

    public onEnter(): void {
        
    }
}