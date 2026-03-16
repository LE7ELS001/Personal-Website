import * as Phaser from 'phaser'
import { __values } from "tslib";
import { isArcadePhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { HeldGameObjectComponent } from "../../../game-object/held-game-object-component";
import { GameObject } from "../../../../common/types";
import { LIFT_ITEM_ANIMATION_DELAY, LIFT_ITEM_ANIMATION_DURATION, LIFT_ITEM_ANIMATION_ENABLE_DEBUGGING } from '../../../../common/config';

export class LiftState extends BaseCharacterState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.LIFT_STATE, gameObject); 
    }

    public onEnter(args: unknown[]): void {
        const gameObjectBeingPickUP = args[0] as GameObject;

        this._resetObjectVelocity();

        const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject)
        if (heldComponent === undefined) {
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
            return;
        }
        heldComponent.object = gameObjectBeingPickUP;

        if (isArcadePhysicsBody(gameObjectBeingPickUP.body)) {
            gameObjectBeingPickUP.body.enable = false;
        }
        gameObjectBeingPickUP.setDepth(2).setOrigin(0.5, 0.5);

        //---- add cubic bezier curve----
        const startPoint = new Phaser.Math.Vector2(gameObjectBeingPickUP.x + 8,  gameObjectBeingPickUP.y - 8);
        const controlPoint1 = new Phaser.Math.Vector2(gameObjectBeingPickUP.x + 8,gameObjectBeingPickUP.y - 24);
        const controlPoint2 = new Phaser.Math.Vector2(gameObjectBeingPickUP.x +8, gameObjectBeingPickUP.y - 24);
        const endtPoint = new Phaser.Math.Vector2(this._gameObject.x, this._gameObject.y - 8);
        const curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endtPoint);
        const curvePath = new Phaser.Curves.Path(startPoint.x, startPoint.y).add(curve);

        let g: Phaser.GameObjects.Graphics | undefined;
        //debug the curve
        if (LIFT_ITEM_ANIMATION_ENABLE_DEBUGGING) {        
            g = this._gameObject.scene.add.graphics();
            g.clear();
            g.lineStyle(4, 0x00ff00, 1);
            curvePath.draw(g);
        }
        gameObjectBeingPickUP.setAlpha(0);

        //
        const follwer = this._gameObject.scene.add.follower(curvePath, startPoint.x, startPoint.y, gameObjectBeingPickUP.texture).setAlpha(1);
        follwer.startFollow({
            delay: LIFT_ITEM_ANIMATION_DELAY,
            duration: LIFT_ITEM_ANIMATION_DURATION,
            onComplete: () => {
                follwer.destroy();
                if (g !== undefined)
                {
                    g.destroy();
                }

                gameObjectBeingPickUP.setPosition(follwer.x, follwer.y).setAlpha(1);
            }
        });

        //play the animation
        this._gameObject.animationComponent.playAnimation(`LIFT_${this._gameObject.direction}`);
    }

    public onUpdate(): void {
        if (this._gameObject.animationComponent.isAnimationPlaying()) {
            return;
        }

        this._stateMachine.setState(CHARACTER_STATES.IDLE_HOLDING_STATE);
    }
}