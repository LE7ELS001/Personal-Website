import { CHARACTER_ANIMATIONS } from "../../common/assets";
import { DataManager } from "../../common/data-manager/data-manager";
import { CustomGameObject, Direction, Position } from "../../common/types";
import { AnimationComponent, AnimationsConfig } from "../../components/game-object/animation-component";
import { ControlsComponent } from "../../components/game-object/controls-component";
import { DirectionComponent } from "../../components/game-object/direction-component";
import { InvulnerableComponent } from "../../components/game-object/invulnerable-component";
import { LifeComponent } from "../../components/game-object/life-component";
import { SpeedComponent } from "../../components/game-object/speed-component";
import { WeaponComponent } from "../../components/game-object/weapon-component";
import { InputComponent } from "../../components/input/input-component";
import { StateMachine } from "../../components/state-machine/state-machine";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";

export type CharacterConfig = {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    inputComponent: InputComponent;
    animationConfig: AnimationsConfig;
    speed: number;
    id?: string;
    isPlayer: boolean;
    isInvulnerable?: boolean;
    invulnerableAfterHitAnimationDuration?: number;
    maxLife: number;
    currentLife?: number;
    
};

export abstract class CharacterGameObject extends Phaser.GameObjects.Sprite implements CustomGameObject{
    protected _controlsComponent: ControlsComponent;
    protected _speedComponent: SpeedComponent;
    protected _directionComponent: DirectionComponent;
    protected _animationComponent: AnimationComponent;
    protected _stateMachine: StateMachine;
    protected _isPlayer: boolean;
    protected _invulnerableComponent: InvulnerableComponent;
    protected _lifeComponent: LifeComponent;
    protected _isDefeated: boolean;

    constructor(config: CharacterConfig) {
        const {
            scene,
            position,
            assetKey,
            frame,
            speed,
            animationConfig,
            inputComponent,
            id, isPlayer,
            invulnerableAfterHitAnimationDuration,
            isInvulnerable,
            maxLife,
            currentLife,
        } = config;
        const { x, y } = position; 
        super(scene, x, y, assetKey, frame || 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        

        //initialize components
        this._controlsComponent = new ControlsComponent(this, inputComponent);
        this._speedComponent = new SpeedComponent(this, config.speed);
        this._directionComponent = new DirectionComponent(this);
        this._animationComponent = new AnimationComponent(this, config.animationConfig);
        this._invulnerableComponent = new InvulnerableComponent(this, isInvulnerable || false, invulnerableAfterHitAnimationDuration)
        this._lifeComponent = new LifeComponent(this, maxLife, currentLife || 1 );

        // add state machine 
        this._stateMachine = new StateMachine(id || 'undefined');

        //general config
        this._isPlayer = isPlayer;
        this._isDefeated = false;

        if (!this._isPlayer) {
            this.disableObject();
        }
    }

    get isDefeated(): boolean {
        return this._isDefeated;
    }

    get isEnemy(): boolean {
        return !this._isPlayer;
    }

    get controls(): InputComponent {
        return this._controlsComponent.controls;
    }

    get speed(): number {
        return this._speedComponent.speed;
    }

    get direction(): Direction {
        return this._directionComponent.direction;
    }

    set direction(value: Direction) {
        this._directionComponent.direction = value;
    }

    get stateMachine(): StateMachine {
        return this._stateMachine;
    }

    
    get animationComponent(): AnimationComponent {
        return this._animationComponent;
    }

     get invulnerableComponent(): InvulnerableComponent {
        return this._invulnerableComponent;
    }


    
    public update(): void {
        this._stateMachine.update();
    }

    public hit(direction: Direction, damage: number): void {
        

        if (this._isDefeated) {
            return;
        }

        if (this._invulnerableComponent.invulnerable) {
            return;
        }


        this._lifeComponent.takeDamage(damage);
        if (this._isPlayer) {
            DataManager.instance.updatePlayerCurrentHealth(this._lifeComponent.life);
        }

        if (this._lifeComponent.life === 0) {
            this._isDefeated = true;
            this._stateMachine.setState(CHARACTER_STATES.DEATH_STATE, direction);
            return;
        }

        this._stateMachine.setState(CHARACTER_STATES.HURT_STATE, direction);
    } 

    public increasePlayerMaxLife(amount: number): void {
        if (!this._isPlayer) {
            return;
        }
        this._lifeComponent.increaseMaxLife(amount);
        DataManager.instance.updatePlayerMaxHealth(this._lifeComponent.maxLife);
        DataManager.instance.updatePlayerCurrentHealth(this._lifeComponent.life);
    }


    public increasePlayerAttack(amount: number): void {
        if (!this._isPlayer) {
            return;
        }

        DataManager.instance.updatePlayerAttack(amount);
        
        const totalAttack = DataManager.instance.data.baseAttack;
        const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this);
        if (weaponComponent !== undefined && weaponComponent.weapon) {
            weaponComponent.weaponDamage = totalAttack;
        }
    }
    
    public disableObject(): void {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;

        this.active = false;
        if (!this._isPlayer) {
            this.visible = false;
        }

        const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this);
        if (weaponComponent !== undefined && weaponComponent.weapon !== undefined && weaponComponent.weapon.isAttacking) {
            weaponComponent.weapon.onCollisionCallback();
        }
    }



    public enableObject(): void {
        if (this._isDefeated) {
            return;
        }
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.active = true;
        this.visible = true;
    }
}