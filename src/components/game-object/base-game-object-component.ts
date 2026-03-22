import * as Phaser from 'phaser';import { GameObjects } from "phaser"
import { GameObject } from '../../common/types';

export class BaseGameObjectComponent {
    protected scene: Phaser.Scene;
    protected gameObject: GameObject;

    constructor(gameObject: GameObject) {
        this.scene = gameObject.scene;
        this.gameObject = gameObject;
        this.assignComponent(gameObject);
    }

    static getComponent<T>(gameObject: GameObject): T {
        return gameObject[`_${this.name}`] as T;
    }

    static removeComponent(gameObject: GameObject): void {
        delete gameObject[`_${this.name}`];
    }

    protected assignComponent(object: GameObject): void {
        object[`_${this.constructor.name}`] = this;
    }

    protected assignComponentToObject(object: GameObject | Phaser.Physics.Arcade.Body): void{
        object[`_${this.constructor.name}`] = this;
    }
}