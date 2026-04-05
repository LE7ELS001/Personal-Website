import { ASSET_KEYS, SPIDER_ANIMATION_KEYS, WISP_ANIMATION_KEYS } from "../../common/assets";
import { DIRECTION } from "../../common/common";
import { ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MAX, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPDIER_CHANGE_DIRECTION_DELAY_WAIT, ENEMY_SPIDER_SPEED, ENEMY_WISP_MAX_HEALTH, ENEMY_WISP_PULSE_ANIMATION_DURATION, ENEMY_WISP_PULSE_ANIMATION_X, ENEMY_WISP_PULSE_ANIMATION_Y, ENEMY_WISP_SPEED} from "../../common/config";
import {  Direction, Position } from "../../common/types";
import { exhaustiveGuard } from "../../common/utils";
import {  AnimationsConfig } from "../../components/game-object/animation-component";
import { InputComponent } from "../../components/input/input-component";
import { BounceMoveState } from "../../components/state-machine/states/character/bounce-move-state";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";
import { IdleState } from "../../components/state-machine/states/character/idle-state";
import { MoveState } from "../../components/state-machine/states/character/move-state";
import { CharacterGameObject } from "../common/character-game-object";

export type WispConfig = {
    scene: Phaser.Scene;
    position: Position;
};

export class Wisp extends CharacterGameObject {
    constructor(config: WispConfig) {

        const animConfig = { key: WISP_ANIMATION_KEYS.IDLE, repeat: -1, ignoreIfPlaying: true }
        //create animation config for player
        const animationConfig: AnimationsConfig = {
            IDLE_DOWN: animConfig,
            IDLE_UP: animConfig,
            IDLE_LEFT: animConfig,
            IDLE_RIGHT: animConfig,
        }

        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.WISP,
            frame: 0,
            id: `wisp-${Phaser.Math.RND.uuid()}`,
            isPlayer: false,
            animationConfig,
            speed: ENEMY_WISP_SPEED,
            inputComponent: new InputComponent(),
            isInvulnerable: true,
            maxLife: ENEMY_WISP_MAX_HEALTH,
            currentLife: ENEMY_WISP_MAX_HEALTH,
        });

        this.setAlpha(0.5);
        this.setBlendMode(Phaser.BlendModes.NORMAL);




        // add state machine
        this._stateMachine.addState(new BounceMoveState(this));
        this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);

        this.scene.tweens.add({
    targets: this,
    scaleX: ENEMY_WISP_PULSE_ANIMATION_X,
    scaleY: ENEMY_WISP_PULSE_ANIMATION_Y,
    alpha: { from: 0.3, to: 0.7 }, 
    yoyo: true,
    repeat: -1,
    duration: ENEMY_WISP_PULSE_ANIMATION_DURATION,
});
       
    }

}

    
 
