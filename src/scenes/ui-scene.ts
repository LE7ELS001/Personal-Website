import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, HEART_ANIMATIONS, HEART_TEXTURE_FRAME } from '../common/assets';
import { DataManager } from '../common/data-manager/data-manager';
import { CUSTOM_EVENTS, EVENT_BUS, PLAYER_HEALTH_UPDATE_TYPE, PlayerHealthUpdated } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';

export class UiScene extends Phaser.Scene {
    #hudContainer!: Phaser.GameObjects.Container;
    #hearts!: Phaser.GameObjects.Sprite[];
    #dialogContainer!: Phaser.GameObjects.Container;
    #dialogContainerText!: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE,
    });
    }
    


  public create(): void {
      this.#hudContainer = this.add.container(0, 0, []);
      this.#hearts = [];

      const numberOfHeart = Math.floor(DataManager.instance.data.maxHealth / 2);
      const numberOfFullHeart = Math.floor(DataManager.instance.data.currentHealth / 2);
      const hasHalfHeart = DataManager.instance.data.currentHealth % 2 === 1;
      for (let i = 0; i < 20; i++){
          let x = 157 + 8 * i;
          let y= 25;
          if (i >= 10) {
              x = 157 + 8 * (i - 10);
              y = 33;
          }
          let frame: string = HEART_TEXTURE_FRAME.NONE;
          if (i < numberOfFullHeart) {
              frame = HEART_TEXTURE_FRAME.FULL
          } else if(i < numberOfHeart ) {
              frame = HEART_TEXTURE_FRAME.EMPTY;
          }
          if (hasHalfHeart && i === numberOfFullHeart) {
              frame = HEART_TEXTURE_FRAME.HALF;
          }
          this.#hearts.push(this.add.sprite(x, y, ASSET_KEYS.HUD_NUMBERS, frame).setOrigin(0));
      }
      this.#hudContainer.add(this.#hearts);

      this.#dialogContainer = this.add.container(32, 142, [this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)]);
      this.#dialogContainerText = this.add.text(14, 14, '', DEFAULT_UI_TEXT_STYLE).setOrigin(0);
      this.#dialogContainer.add(this.#dialogContainerText);
      this.#dialogContainer.visible = false;

      EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATE, this.updateHealthInHud, this);
      EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
      //EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_ATTACK_UPDATE, this.showDialog, this);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
          EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATE, this.updateHealthInHud, this);
          EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
          //EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_ATTACK_UPDATE, this.showDialog, this);
      });

    }
    
    public async updateHealthInHud(data: PlayerHealthUpdated): Promise <void> {
        if (data.type === PLAYER_HEALTH_UPDATE_TYPE.INCREASE) {
            this.#updateHeartFrame();
            return;


        }

        const healthDifference = data.previousHealth - data.currentHealth;
        let health = data.previousHealth;
        for (let i = 0; i < healthDifference; i += 1){
            const heartIndex = Math.round(health / 2) - 1;
            const isHalfHeart = health % 2 === 1;
            let animationName = HEART_ANIMATIONS.LOSE_LAST_HALF;
            if (!isHalfHeart) {
                animationName = HEART_ANIMATIONS.LOSE_FIRST_HALF;
            }
            await new Promise((resolve) => {
                this.#hearts[heartIndex].play(animationName);
                this.#hearts[heartIndex].once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationName, () => {
                    resolve(undefined);
                });
            })
            health -= 1;
        }
    }

     #updateHeartFrame(): void {
        const { maxHealth, currentHealth } = DataManager.instance.data;
        const numberOfHeart = Math.floor(maxHealth / 2);
        const numberOfFullHeart = Math.floor(currentHealth / 2);
        const isHalfHeart = currentHealth % 2 === 1;

        this.#hearts.forEach((heart, i) => {
        let frame: string = HEART_TEXTURE_FRAME.NONE;
        
        if (i < numberOfFullHeart) {
            frame = HEART_TEXTURE_FRAME.FULL;
        } else if (i < numberOfHeart) {
            frame = HEART_TEXTURE_FRAME.EMPTY;
        }

        if (isHalfHeart && i === numberOfFullHeart) {
            frame = HEART_TEXTURE_FRAME.HALF;
        }
        
        heart.setFrame(frame);
    });
    }

    public showDialog(message: string): void {
        this.#dialogContainer.visible = true;
        this.#dialogContainerText.setText(message);

        this.time.delayedCall(3000, () => {
            this.#dialogContainer.visible = false;
            EVENT_BUS.emit(CUSTOM_EVENTS.DIALOG_CLOSE);
        })
    }

}
