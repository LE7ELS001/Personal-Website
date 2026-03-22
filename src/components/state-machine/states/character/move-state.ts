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

export class MoveState extends BaseMoveState {
    constructor(gameObject: CharacterGameObject) {
        super(CHARACTER_STATES.MOVE_STATE, gameObject, 'WALK'); 
    }

    public onUpdate(): void {
        const controls = this._gameObject.controls;

         if (controls.isAttackKeyJustDown) {
            this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
            return;
        }

         if (this.isNoInputMovemnt(controls)) {
             this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
             return;
        }

        // if player interacted with an object, then change the state 
        if (this.#checkIfObjectWasInteractedWith(controls)) {
            return;
        }

        this.handleCharacterMovement();

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
            return true;
        }

        //check if the object is AUTO?
        if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.AUTO)
        {
            return false;
        }

        exhaustiveGuard(interactiveObjectComponent.objectType);
    }
}