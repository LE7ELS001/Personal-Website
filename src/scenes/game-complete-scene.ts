import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { DataManager } from '../common/data-manager/data-manager';
import { COMPLETE_UI_TEXT_STYLE, DEFAULT_UI_TEXT_STYLE } from '../common/common';


export class GameCompleteScene extends Phaser.Scene {
    #menuContainer!: Phaser.GameObjects.Container;
    #cursorGameObejct!: Phaser.GameObjects.Image;
    #controls!: KeyboardComponent;
    #selectedMenuOptionIndex!: number;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_COMPLETE_SCENE,
    });
}

    public create(): void {
        if (!this.input.keyboard) {
            return;
        }
        this.add.text(this.scale.width / 2,
            40,
            'Thank you for playing!\n\n-Junming', COMPLETE_UI_TEXT_STYLE).setOrigin(0.5,0);
        
        this.#menuContainer = this.add.container(32, 142, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0),
            this.add.text(32, 32, 'Restart', DEFAULT_UI_TEXT_STYLE).setOrigin(0),
        ]);
        this.#cursorGameObejct = this.add.image(22, 29, ASSET_KEYS.UI_CURSOR, 0).setOrigin(0);
        this.#menuContainer.add(this.#cursorGameObejct);

        this.#controls = new KeyboardComponent(this.input.keyboard);
        this.#selectedMenuOptionIndex = 0;
        DataManager.instance.resetPlayerHealthToMin();
    }
    public update(): void {
        if (this.#controls.isActionKeyJustDown || this.#controls.isAttackKeyJustDown || this.#controls.isEnterKeyJustDown) {
            
                window.location.reload();
                return;
        }

        this.#cursorGameObejct.setY(29 + this.#selectedMenuOptionIndex * 16);
    }  
}
