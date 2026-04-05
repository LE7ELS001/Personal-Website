import * as Phaser from 'phaser'
import { Position } from '../../../common/types';
import { WISP_ANIMATION_KEYS, ASSET_KEYS, DROW_ANIMATION_KEYS } from '../../../common/assets';
import { ENEMY_WISP_SPEED, ENEMY_WISP_MAX_HEALTH, ENEMY_WISP_PULSE_ANIMATION_X, ENEMY_WISP_PULSE_ANIMATION_Y, ENEMY_WISP_PULSE_ANIMATION_DURATION, ENEMY_DROW_SPEED, ENEMY_DROW_MAX_HEALTH, DROW_HURT_PUSH_BACK_DELAY, HURT_PUSH_BACK_DELAY, ENEMY_DROW_DEATH_ANIMATION_DURATION, ENEMY_DROW_ATTACK_DAMAGE, ENEMY_DROW_ATTACK_SPEED, ENEMY_BOSS_START_INITIAL_DELAY } from '../../../common/config';
import { AnimationsConfig } from '../../../components/game-object/animation-component';
import { InputComponent } from '../../../components/input/input-component';
import { BounceMoveState } from '../../../components/state-machine/states/character/bounce-move-state';
import { CHARACTER_STATES } from '../../../components/state-machine/states/character/character-states';
import { CharacterGameObject } from '../../common/character-game-object';
import { flash } from '../../../common/juice-utils';
import { WeaponComponent } from '../../../components/game-object/weapon-component';
import { IdleState } from '../../../components/state-machine/states/character/idle-state';
import { HurtState } from '../../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../../components/state-machine/states/character/death-state';
import { DrowHiddenState } from '../../../components/state-machine/states/boss/drow/drow-hidden-state';
import { DrowPrepareAttackState } from '../../../components/state-machine/states/boss/drow/drow-prepare-attack-state';
import { DrowTeleportState } from '../../../components/state-machine/states/boss/drow/drow-teleport-state';
import { AttackState } from '../../../components/state-machine/states/character/attack-state';
import { DrowIdleState } from '../../../components/state-machine/states/boss/drow/drow-idle-state';
import { Dagger } from '../../weapon/dagger';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../../common/event-bus';

export type DrowConfig = {
    scene: Phaser.Scene;
    position: Position;
};

export class Drow extends CharacterGameObject {
    #weaponComponent: WeaponComponent;

    public isInvulnerable: boolean = false;


    constructor(config: DrowConfig) {
        const hurtAnimationConfig = { key: DROW_ANIMATION_KEYS.HIT, repeat: 0, ignoreIfPlaying: true }
        //create animation config for player
        const animationConfig: AnimationsConfig = {
            IDLE_DOWN: { key: DROW_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
            IDLE_UP: { key: DROW_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
            IDLE_LEFT: { key: DROW_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },
            IDLE_RIGHT: { key: DROW_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },

            WALK_DOWN: { key: DROW_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
            WALK_UP: { key: DROW_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
            WALK_LEFT: { key: DROW_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
            WALK_RIGHT: { key: DROW_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },

            HURT_DOWN: hurtAnimationConfig,
            HURT_UP: hurtAnimationConfig,
            HURT_LEFT: hurtAnimationConfig,
            HURT_RIGHT: hurtAnimationConfig,
        }

        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.DROW,
            frame: 0,
            id: `drow-${Phaser.Math.RND.uuid()}`,
            isPlayer: false,
            animationConfig,
            speed: ENEMY_DROW_SPEED,
            inputComponent: new InputComponent(),
            isInvulnerable: false,
            maxLife: ENEMY_DROW_MAX_HEALTH,
            currentLife:ENEMY_DROW_MAX_HEALTH,
        });

        this.#weaponComponent = new WeaponComponent(this);
        this.#weaponComponent.weapon = new Dagger(this, this.#weaponComponent, {
            DOWN: DROW_ANIMATION_KEYS.ATTACK_DOWN,
            UP: DROW_ANIMATION_KEYS.ATTACK_UP,
            LEFT: DROW_ANIMATION_KEYS.ATTACK_SIDE,
            RIGHT: DROW_ANIMATION_KEYS.ATTACK_SIDE,
        },
        ENEMY_DROW_ATTACK_DAMAGE, ENEMY_DROW_ATTACK_SPEED)

        this.setAlpha(1);
        this.setBlendMode(Phaser.BlendModes.NORMAL);




        // add state machine
        this._stateMachine.addState(new DrowIdleState(this));
        this._stateMachine.addState(new DrowHiddenState(this));
        this._stateMachine.addState(new DrowTeleportState(this, [
            new Phaser.Math.Vector2(this.scene.scale.width / 2, 80),
            new Phaser.Math.Vector2(64, 180),
            new Phaser.Math.Vector2(192, 180),
        ]));

        this._stateMachine.addState(new DrowPrepareAttackState(this));
        this._stateMachine.addState(new AttackState(this));

        this._stateMachine.addState(new HurtState(this, DROW_HURT_PUSH_BACK_DELAY, undefined, CHARACTER_STATES.TELEPORT_STATE));
        this._stateMachine.addState(new DeathState(this, ()=> {
            this.visible = true;
            flash(this, () => {
                const fx = this.postFX.addWipe(0.1, 0.1);
                this.scene.add.tween({
                    targets: fx,
                    progress: 1,
                    duration: ENEMY_DROW_DEATH_ANIMATION_DURATION,
                    onComplete: () => {
                        this.visible = false;
                        EVENT_BUS.emit(CUSTOM_EVENTS.BOSS_DEFEATED);
                    },
                });
            });
        }));



        this.setScale(1.25);
        this.PhysicsBody
            .setSize(12, 24, true)
            .setOffset(this.displayWidth / 4, this.displayHeight / 4 - 3);
    }

    get PhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    public update(): void {
        
        super.update();
          this.#weaponComponent.update();


        //drow invulnerable when teleport 
        if (this._stateMachine.currentStateName === CHARACTER_STATES.TELEPORT_STATE || this._stateMachine.currentStateName === CHARACTER_STATES.HIDDEN_STATE) {
        this.isInvulnerable = true;
        
        if (this.alpha !== 0.5) this.setAlpha(0.5); 
    } else {
        if (this._stateMachine.currentStateName !== CHARACTER_STATES.HURT_STATE) {
            this.isInvulnerable = false;
            if (this.alpha !== 1) this.setAlpha(1);
        }
    }
         
          
         
    }

    public enableObject(): void {
        super.enableObject(); 
        
        if (this._isDefeated) {
            return;
        }

        if (this._stateMachine.currentStateName === undefined) {
            this.visible = false;
            this.scene.time.delayedCall(ENEMY_BOSS_START_INITIAL_DELAY, () => {
                this.visible = true;
                this._stateMachine.setState(CHARACTER_STATES.HIDDEN_STATE);
            });
        }
    }
}

    
 
