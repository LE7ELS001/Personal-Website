import { InputComponent } from "./input-component";

interface WASDKeys {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
}

export class KeyboardComponent extends InputComponent { 
    //#cursorkeys: Phaser.Types.Input.Keyboard.CursorKeys;
    #wasdKeys: WASDKeys;
    #attackKey: Phaser.Input.Keyboard.Key;
    #actionKey: Phaser.Input.Keyboard.Key;
    #enterKey: Phaser.Input.Keyboard.Key;
    
    constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
        super();
        //this.#cursorkeys = keyboardPlugin.createCursorKeys();

        this.#wasdKeys = keyboardPlugin.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }) as WASDKeys;

        this.#attackKey =keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //this.#cursorkeys.up.isDown
        this.#wasdKeys.up.isDown;
    }

    get isUpDown(): boolean {
        //return this.#cursorkeys.up.isDown;
        return this.#wasdKeys.up.isDown;
    }

        get isUpJustDown(): boolean {
            //return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.up);
            return Phaser.Input.Keyboard.JustDown(this.#wasdKeys.up);
    }
  

    get isDownDown(): boolean {
        //return this.#cursorkeys.down.isDown;
        return this.#wasdKeys.down.isDown;
    }

        get isDownJustDown(): boolean {
            //return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.down);
            return Phaser.Input.Keyboard.JustDown(this.#wasdKeys.down);
    }
    
    get isLeftDown(): boolean {
        //return this.#cursorkeys.left.isDown;
        return this.#wasdKeys.left.isDown;
    }

    get isRightDown(): boolean {
        //return this.#cursorkeys.right.isDown;
        return this.#wasdKeys.right.isDown;
    }
    
    get isActionKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#actionKey);
    }

    get isAttackKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#attackKey);
    }

    get isSelectKeyJustDown(): boolean {
        //return Phaser.Input.Keyboard.JustDown(this.#cursorkeys.shift);
        return Phaser.Input.Keyboard.JustDown(this.#actionKey);
    }
    
     get isEnterKeyJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.#enterKey);
    }

   
}