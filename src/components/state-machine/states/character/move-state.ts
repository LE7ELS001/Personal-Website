import { __values } from "tslib";
import { exhaustiveGuard, isArcadePhysicsBody } from "../../../../common/utils";
import { CHARACTER_STATES } from "./character-states";
import { Direction } from "../../../../common/types";
import {  INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { InputComponent } from "../../../input/input-component";
import { CollidingObjectsComponent } from "../../../game-object/colliding-objects-components";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";
import { BaseMoveState } from "./base-move-state";
import { Player } from "../../../../game-objects/player/player";
import { Crystal } from "../../../../game-objects/objects/crystal";

export class MoveState extends BaseMoveState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.MOVE_STATE, gameObject, 'WALK'); 
    }

    public onUpdate(): void {
        const controls = this._gameObject.controls;
        const player = this._gameObject as Player;

         if (controls.isAttackKeyJustDown) {
            this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
            return;
        }

        //crystal interaction has higher priority than movement
        if (this.#tryCrystalInteraction(controls)) {
            player.moveTarget = null;
            return;
        }


        // if player interacted with an object, then change the state 
        if (this.#checkIfObjectWasInteractedWith(controls)) {
            player.moveTarget = null;
            return;
        }

        // reset to idle state
        const hasKeyboardInput = !this.isNoInputMovemnt(controls);
        const hasMouseTarget = player.moveTarget !== null;

        if (!hasMouseTarget && !hasKeyboardInput) {
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
            return;
        }

        this.handleIntergratedMovement(player, controls);
        //this.handleCharacterMovement();

    }


    #checkIfObjectWasInteractedWith(controls: InputComponent): boolean {
        const collideComponent = CollidingObjectsComponent.getComponent<CollidingObjectsComponent>(this._gameObject);
        
        //the owner don't have collideComponent or did not collide with any object
        if (collideComponent === undefined || collideComponent.objects.length === 0)
        {
            return false;
        }

        //object don't have collidComponent
        const collisionObject = collideComponent.objects[0];
        const interactiveObjectComponent = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(collisionObject);
        if (interactiveObjectComponent === undefined) {
            return false;
        }

        // no key press 
        if (!controls.isActionKeyJustDown) {
            return false;
        }

        //check if the object can interact or not
        if (!interactiveObjectComponent.canInteractWith()) {
            return false;
        }

        interactiveObjectComponent.interact();

        //check if the object it pick up type or not  
        if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.PICKUP)
        {
            this._stateMachine.setState(CHARACTER_STATES.LIFT_STATE, collisionObject);
            return true;
        }

        //check if the object is open type or not 
        if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.OPEN)
        {
            this._stateMachine.setState(CHARACTER_STATES.OPEN_CHEST_STATE, collisionObject);
            return true;
        }

        //check if the object is open my portfolio type or not 
        if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.OPEN_MY_PORTFOLIO)
        {
            this._stateMachine.setState(CHARACTER_STATES.INTERACT_WITH_CRYSTAL_STATE, collisionObject);
            return false;
        }

        //check if the object is AUTO?
        if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.AUTO)
        {
            return false;
        }

        exhaustiveGuard(interactiveObjectComponent.objectType);
    }

    //crystal interaction function
    #tryCrystalInteraction(controls: InputComponent): boolean {

        if (!controls.isActionKeyJustDown) {
            return false;
        }

        const scene = this._gameObject.scene;
        
        // 
        const crystals = scene.children.list.filter(child => child instanceof Crystal) as Crystal[];

        // 寻找一个符合互动条件（距离足够近，文字已弹出）的水晶
        const targetCrystal = crystals.find(crystal => {
            const comp = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(crystal);
            return comp && comp.canInteractWith(); // 这里的 canInteractWith 在 Crystal.ts 里已经是 () => this.#isPlayerNear
        });

        if (targetCrystal) {
            const comp = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(targetCrystal)!;
            
            // 执行 Crystal 的互动逻辑
            comp.interact();

            // 切换到交互动画状态
            this._stateMachine.setState(CHARACTER_STATES.INTERACT_WITH_CRYSTAL_STATE, targetCrystal);
            return true;
        }

        return false;
    }
}