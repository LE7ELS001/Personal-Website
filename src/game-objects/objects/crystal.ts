import * as Phaser from 'phaser'
import { Position } from '../../common/types';
import { ASSET_KEYS, CRYSTAL_ANIMATION_KEYS, CRYSTAL_FRAME_KEYS } from '../../common/assets';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';
import { INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../common/event-bus';
import { ASSET_SCALE_MAP, CHECK_INTERVAL, HOVER_TEXT_POSITION_OFFSET_Y, TEXT_REVEAL_DISTANCE } from '../../common/config';
import { portfolioProjects } from '../../portfolioData';


type CrystalConfig = {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    portfolioId: string;
}

const CRYSTAL_ANIM_MAP: Record<string, string> = {
    [ASSET_KEYS.EARTH]: 'earth',       
    [ASSET_KEYS.CONTROLLER]: 'controller',       
    [ASSET_KEYS.MAP]: 'map',
    [ASSET_KEYS.BOOK]: 'book'
};

export class Crystal extends Phaser.Physics.Arcade.Sprite {
    #position: Position;
    #portfolioId: string;
    #glowEffect?: Phaser.FX.Glow;
    #labelContainer?: Phaser.GameObjects.Container;
    #baseScale: number;

    #isMouseOver: boolean = false;
    #isPlayerNear: boolean = false;
    #isHighlighted: boolean = false;

    #checkTimer: number = 0;


    constructor(config: CrystalConfig) {
        const { scene, position, assetKey, portfolioId } = config;
        super(scene, position.x, position.y, assetKey, 0);

        this.#portfolioId = portfolioId;
        this.#baseScale = ASSET_SCALE_MAP[assetKey] || ASSET_SCALE_MAP['default'] || 1;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(this.#baseScale);
        this.setOrigin(0, 1).setImmovable(true);

        this.#position = { x: position.x, y: position.y }

        const animKey = CRYSTAL_ANIM_MAP[assetKey];
        if (animKey && scene.anims.exists(animKey)) {
            this.play({ key: animKey, repeat: -1 });
        } else {
            console.error(`can't find animation "${animKey}"`);
        }
        
        //create label
        this.#createHoverLabel();




        
        /* key board interaction*/ 
        //add components 
        const interactComponent =new InteractiveObjectComponent(this, INTERACTIVE_OBJECT_TYPE.OPEN_MY_PORTFOLIO,
            () => this.#isPlayerNear,
            () => { this.#triggerPortfolio(); },
        );

        if ((scene as any).addInteractiveComponent) {
            (scene as any).addInteractiveComponent(interactComponent);
        }

    
        /* mouse interaction */
        this.setInteractive({ useHandCursor: true });

        this.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, pointerEvent: Phaser.Types.Input.EventData) => {
            console.log(`[Crystal] mouse click: ${this.#portfolioId}`); 

            if (pointerEvent) {
                pointerEvent.stopPropagation();
                this.#triggerPortfolio();
            }

        });

        
        // mouse hover    
    
        this.on('pointerover', () => {
            this.#isMouseOver = true;
            this.#updateHighlightState();
            
        });

        // hover out
        this.on('pointerout', () => {
            this.#isMouseOver = false;
            this.#updateHighlightState();

        });


    }


    #triggerPortfolio(): void {
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_PORTFOLIO, this.#portfolioId);
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


    /**
     * Hover label
     */
    #createHoverLabel(): void {
        const project = portfolioProjects.find(p => p.id === this.#portfolioId);
        const labelText = project?.label || "VIEW PROJECT";

        
        const text = this.scene.add.text(0, 0, labelText, {
            fontSize: '14px',
            color: '#00ffff',
            fontStyle: 'bold',
            padding: { x: 8, y: 4 },
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }).setOrigin(0.5);

         const centerX = this.getCenter().x;
        const centerY = this.getCenter().y;
        
        this.#labelContainer = this.scene.add.container(
            centerX, 
            centerY, 
            [text]
        );

        this.#labelContainer.setAlpha(0); 
        this.#labelContainer.setDepth(2000); 
    }


    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

         this.#checkTimer += delta;
        if (this.#checkTimer >= CHECK_INTERVAL) {
            this.#checkTimer = 0;
            this.#checkProximity();
        }
    }

    //check player position to reaveal text 
    #checkProximity(): void {
        const player = (this.scene as any).player || this.scene.children.list.find(child => child.constructor.name === 'Player');
        
        if (player) {
            const distance = Phaser.Math.Distance.Between(this.getCenter().x, this.getCenter().y, player.x, player.y);
            const isNear = distance < TEXT_REVEAL_DISTANCE;

            if (this.#isPlayerNear !== isNear) {
                this.#isPlayerNear = isNear;
                this.#updateHighlightState();
            }
        }
    }


    #updateHighlightState(): void {
        const shouldHighlight = this.#isMouseOver || this.#isPlayerNear;

        if (this.#isHighlighted === shouldHighlight) return;
        this.#isHighlighted = shouldHighlight;

        if (shouldHighlight) {
            this.#showEffects();
        } else {
            this.#hideEffects();
        }
    }

    #showEffects(): void {
        this.scene.tweens.killTweensOf([this, this.#labelContainer]);

        
        this.setTint(0xFFF5F5); 
        if (this.postFX) {
            this.postFX.clear(); 
            this.postFX.addGlow(0x00ffff, 2, 0);
        }

        
        this.scene.tweens.add({
            targets: this,
            scale: this.#baseScale * 1.1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        
        if (this.#labelContainer) {
            this.scene.tweens.add({
                targets: this.#labelContainer,
                alpha: 1,
                y: this.getCenter().y,
                duration: 250,
                ease: 'Cubic.easeOut'
            });
        }
    }

    #hideEffects(): void {
        this.scene.tweens.killTweensOf([this, this.#labelContainer]);

        this.scene.tweens.add({
            targets: this,
            scale: this.#baseScale,
            duration: 200,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.clearTint(); 
                if (this.postFX) this.postFX.clear();
            }
        });

        if (this.#labelContainer) {
            this.scene.tweens.add({
                targets: this.#labelContainer,
                alpha: 0,
                y: this.getCenter().y + 10,
                duration: 150,
                ease: 'Cubic.easeIn'
            });
        }
    }

}