import * as Phaser from 'phaser'
import { Position } from '../../common/types';
import { ASSET_KEYS, CRYSTAL_ANIMATION_KEYS } from '../../common/assets';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';
import { INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { CRYSTAL_SCALE } from '../../common/config';


type CrystalConfig = {
    scene: Phaser.Scene;
    position: Position;
}

export class Crystal extends Phaser.Physics.Arcade.Sprite {
    #position: Position;

    constructor(config: CrystalConfig) {
        const { scene, position } = config;
        super(scene, position.x, position.y, ASSET_KEYS.BLUE_CRYSTAL, 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(CRYSTAL_SCALE);
        this.setOrigin(0, 1).setImmovable(true);

        this.#position = { x: position.x, y: position.y }

        this.play({ key: CRYSTAL_ANIMATION_KEYS.SHINING, repeat: -1 });
        
        //add components 
        new InteractiveObjectComponent(this, INTERACTIVE_OBJECT_TYPE.OPEN_MY_PORTFOLIO);

    }

    public disableObject(): void {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.active = false;
        this.visible = false;
    }

        public enableObject(): void {
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.active = true;
        this.visible = true;
    }


}