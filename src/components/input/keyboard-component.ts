import { InputComponent } from "./input-component";

export class KeyboardComponent extends InputComponent { 
    #cursorkeys: Phaser.Types.Input.Keyboard.CursorKeys;
    #attackKey: Phaser.Input.Keyboard.Key;
    #actionKey: Phaser.Input.Keyboard.Key;
    #enterKey: Phaser.Input.Keyboard.Key;
    
    constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
        super();
       this.#cursorkeys = keyboardPlugin.createCursorKeys();
        this.#attackKey =keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.#cursorkeys.up.isDown
    }

    get isUpDown(): boolean {
        return this.#cursorkeys.up.isDown;
    }

        get isUpJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.up);
    }
  

    get isDownDown(): boolean {
        return this.#cursorkeys.down.isDown;
    }

        get isDownJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.down);
    }
    
    get isLeftDown(): boolean {
        return this.#cursorkeys.left.isDown;
    }

    get isRightDown(): boolean {
        return this.#cursorkeys.right.isDown;
    }
    
    get isActionKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#actionKey);
    }

    get isAttackKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#attackKey);
    }

    get isSelectKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.shift);
    }
    
     get isEnterKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#enterKey);
    }

   
}