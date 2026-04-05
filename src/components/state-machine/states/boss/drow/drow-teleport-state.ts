import * as Phaser from 'phaser'
import { __values } from "tslib";
import { isArcadePhysicsBody } from '../../../../../common/utils';
import { CharacterGameObject } from '../../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from '../../character/base-character-state';
import { CHARACTER_STATES } from '../../character/character-states';
import { ENEMY_BOSS_HIDDEN_STATE_DURATION, ENEMY_BOSS_TELEPORT_INITIAL_STATE_DURATION, ENEMY_BOSS_TELEPORT_STATE_FINISHED_DURATION, ENEMY_DROW_DEATH_ANIMATION_DURATION } from '../../../../../common/config';
import { DIRECTION } from '../../../../../common/common';


export class DrowTeleportState extends BaseCharacterState {
    #possibleTeleportLocation: Phaser.Math.Vector2[];

    constructor(gameObject: CharacterGameObject, possibleTeleportLocation: Phaser.Math.Vector2[]) {
        super(CHARACTER_STATES.TELEPORT_STATE, gameObject); 
        this.#possibleTeleportLocation = possibleTeleportLocation;
    }

    public onEnter(): void {
        this._gameObject.invulnerableComponent.invulnerable = true;

        //get camera location 
        const camera = this._gameObject.scene.cameras.main;
        const camX = camera.worldView.x;
        const camY = camera.worldView.y;

        // use camera location and possible teleport location to determine where to teleport
        const dynamicLocations = [
            new Phaser.Math.Vector2(camX + 128, camY + 50),  
            new Phaser.Math.Vector2(camX + 54, camY + 150),  
            new Phaser.Math.Vector2(camX + 202, camY + 150)  
        ];

        const timeEvent = this._gameObject.scene.time.addEvent({
            delay: ENEMY_BOSS_TELEPORT_INITIAL_STATE_DURATION,
            callback: () => {
                if (timeEvent.getOverallProgress() === 1) {
                    this.#handleTeleportFinished(dynamicLocations);
                    return;
                }
                this._gameObject.direction = DIRECTION.DOWN;
                this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
                const location =
                    dynamicLocations[timeEvent.repeatCount % dynamicLocations.length];
                    //this.#possibleTeleportLocation[timeEvent.repeatCount % this.#possibleTeleportLocation.length];
                this._gameObject.setPosition(location.x, location.y);
            },
            callbackScope: this,
            repeat: this.#possibleTeleportLocation.length * 3 - 1,
        });
        
    }

    #handleTeleportFinished(dynamicLocations: Phaser.Math.Vector2[]): void {
        this._gameObject.visible = false;
        this._gameObject.scene.time.delayedCall(ENEMY_BOSS_TELEPORT_STATE_FINISHED_DURATION, ()=> 
        {
            const randomLocaton = Phaser.Utils.Array.GetRandom(dynamicLocations);
            //const randomLocaton = this.#possibleTeleportLocation[2];
            this._gameObject.setPosition(randomLocaton.x, randomLocaton.y);
            this._gameObject.visible = true;
            this._gameObject.invulnerableComponent.invulnerable = false;
            this._stateMachine.setState(CHARACTER_STATES.PREPARE_ATTACK_STATE);
        })
    }
}