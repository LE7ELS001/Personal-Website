import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { CHEST_STATE, DIRECTION } from '../common/common';
import { DEBUG_COLLISION_ALPHA, LIFT_ITEM_ANIMATION_DELAY, PLAYER_START_MAX_HEALTH } from '../common/config';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { ChestState, GameObject, LevelData } from '../common/types';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { isArcadePhysicsBody } from '../common/utils';
import { Crystal } from '../game-objects/objects/crystal';
import { MoveState } from '../components/state-machine/states/character/move-state';
import { TiledRoomObject } from '../common/tiled/types';
import { TILED_LAYER_NAMES } from '../common/tiled/common';
import { getAllLayerNamesWithPrefix, getTiledChestObjectsFromMap, getTiledDoorObjectsFromMap, getTiledEnemyObjectsFromMap, getTiledPotObjectsFromMap, getTiledRoomObjectsFromMap, getTiledSwitchObjectsFromMap } from '../common/tiled/tiled-utils';
import { Door } from '../game-objects/objects/door';

export class GameScene extends Phaser.Scene {
  #levelData!: LevelData;
  #controls!: KeyboardComponent;
  #player!: Player;
  #enemyGroup!: Phaser.GameObjects.Group;
  #blockingGroup!: Phaser.GameObjects.Group
  #potGameObject!: Pot[];
  #objectByRoomId!: {
    [key: number]: {
      chestMap: { [key: number]: Chest },
      doorMap: { [key: number]: Door },
      doors: Door[],
      switches: unknown[],
      pots: Pot[],
      chests: Chest[],
      enemyGroup?: Phaser.GameObjects.Group,
      room: TiledRoomObject;
    };
  };

  #collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #enemiesCollisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #doorTransitionGroup!: Phaser.GameObjects.Group;
  #currentRoomId!: number;


  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }
  
  public init(data): void {
    this.#levelData = data;
    this.#currentRoomId = data.roomId;
  }
  
  public create(): void {
    if (!this.input.keyboard) {
      console.warn("Phaser keyboard is not set up properly")
      return;
    }    
    this.#controls = new KeyboardComponent(this.input.keyboard);

    this.#createLevel();

    if (this.#collisionLayer === undefined || this.#enemiesCollisionLayer === undefined) {
      console.log('Mission collision layer')
      return;
    }

    this.#setUpPlayer();
    this.#setUpCamera();

    this.#tempCode();// TODO


    this.#registerColliders();
    this.#registerCustomEvents();

  
  } 


  // add collision
  #registerColliders(): void {
    this.#enemyGroup.getChildren().forEach((enemy) => {
      const gameObject = enemy as Phaser.GameObjects.Sprite;
      const body = gameObject.body as Phaser.Physics.Arcade.Body;
      
      if (body) {
        body.setCollideWorldBounds(true);
      }
      
    });
    
    this.physics.add.overlap(this.#player, this.#enemyGroup, (player, enemy) => {
      this.#player.hit(DIRECTION.DOWN,1);
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.hit(this.#player.direction,1);
    })

    this.physics.add.collider(this.#player, this.#blockingGroup, (player, gameObject) => {
      this.#player.collideWithGameObject(gameObject as GameObject);
    })

    this.physics.add.collider(this.#enemyGroup, this.#blockingGroup, (enemy, gameObject) => {
      if (gameObject instanceof Pot && isArcadePhysicsBody(gameObject.body) && (gameObject.body.velocity.x !== 0 || gameObject.body.velocity.y !== 0)) {
        const enemyGameObject = enemy as CharacterGameObject;
        if (enemyGameObject instanceof CharacterGameObject) {
          enemyGameObject.hit(this.#player.direction, 1);
          gameObject.break();
        }
        return;
      }

      if (gameObject instanceof Crystal) {
      console.log('enemy hit the crystal');
      }
      
      
  },

      
     (enemy, gameObject) => {
      const body = (gameObject as unknown as GameObject).body
       if (enemy instanceof Wisp) {
        
          if(isArcadePhysicsBody(body) &&
            (body.velocity.x !== 0 || body.velocity.y !== 0)) {
            return false;
          }
        
          if (gameObject instanceof Crystal) { return false };
       } 
       
      return true;
    });

    if (this.#potGameObject.length > 0) {
      this.physics.add.collider(this.#potGameObject, this.#blockingGroup, (pot) => {
        if (!(pot instanceof Pot)) {
          return; 
        }
        pot.break();
      })
    }

    //add layer collision
      this.#collisionLayer.setCollision(this.#collisionLayer.tileset[0].firstgid);
      this.physics.add.collider(this.#player, this.#collisionLayer);
    
    this.#enemiesCollisionLayer.setCollision([this.#enemiesCollisionLayer.tileset[0].firstgid]);
    this.physics.add.collider(this.#enemyGroup, this.#collisionLayer);
  }

  #registerCustomEvents(): void {
    EVENT_BUS.on(CUSTOM_EVENTS.OEPNED_CHEST, this.#handleOpenChest, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.OEPNED_CHEST, this.#handleOpenChest, this);
    })
  }

  #handleOpenChest(chest: Chest): void {
    console.log('chest opened');

  }

  #createLevel(): void {
    // this.add.image(0, -20, "TEST_BG", 0).setOrigin(0);
    this.add.image(0, 0, ASSET_KEYS[`${this.#levelData.level}_BACKGROUND`], 0).setOrigin(0);
    this.add.image(0, 0, ASSET_KEYS[`${this.#levelData.level}_FOREGROUND`], 0).setOrigin(0).setDepth(2);
    
    const map = this.make.tilemap({
      key: ASSET_KEYS[`${this.#levelData.level}_LEVEL`],
    });

    const collisionTiles = map.addTilesetImage(TILED_LAYER_NAMES.COLLISION, ASSET_KEYS.COLLISION);
    if (collisionTiles === null) {
      console.log('error while creating collision tiled');
      return;
    }


    //collision layer 
    const collisionLayer = map.createLayer(TILED_LAYER_NAMES.COLLISION, collisionTiles, 0, 0);
    if (collisionLayer === null) {
      console.log('error while creating collision layer');
      return;
    }
    this.#collisionLayer = collisionLayer;
    this.#collisionLayer.setDepth(2).setAlpha(DEBUG_COLLISION_ALPHA);

    const enemyCollisionLayer = map.createLayer(TILED_LAYER_NAMES.ENEMY_COLLISION, collisionTiles, 0, 0);
    if (enemyCollisionLayer === null) {
      console.log('error while creating enemies collision layer');
      return;
    }
    this.#enemiesCollisionLayer = collisionLayer;
    this.#enemiesCollisionLayer.setDepth(2).setVisible(false);

    
    //initialize objects
    this.#objectByRoomId = {};
    this.#doorTransitionGroup = this.add.group([]);


    this.#createRooms(map, TILED_LAYER_NAMES.ROOMS);

    console.log(this.#objectByRoomId);

    const rooms = getAllLayerNamesWithPrefix(map, TILED_LAYER_NAMES.ROOMS).map((layerName: string) => {
      return {
        name: layerName,
        roomId: parseInt(layerName.split('/')[1], 10),
      }
    });

    //get the layer name 
    const switchLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.SWITCHES}`));
    const potLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.POTS}`));
    const doorLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.DOORS}`));
    const chestLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.CHESTS}`));
    const enemyLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.ENEMIES}`));

    // get the layer data
    doorLayerNames.forEach((layer) => this.#createDoors(map, layer.name, layer.roomId));
    switchLayerNames.forEach((layer) => this.#createButtons(map, layer.name, layer.roomId));
    potLayerNames.forEach((layer) => this.#createPots(map, layer.name, layer.roomId));
    chestLayerNames.forEach((layer) => this.#createChests(map, layer.name, layer.roomId));
    enemyLayerNames.forEach((layer) => this.#createEnemies(map, layer.name, layer.roomId));



  }

  
  #setUpCamera(): void { 
    const roomSize = this.#objectByRoomId[this.#levelData.roomId].room;
    this.cameras.main.setBounds(roomSize.x , roomSize.y - roomSize.height, roomSize.width, roomSize.height );
    this.cameras.main.startFollow(this.#player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  
  #setUpPlayer(): void {
    this.#player = new Player({
      scene: this,
      position: { x: this.scale.width / 2, y: this.scale.height / 2 },
      controls: this.#controls,
      maxLife: PLAYER_START_MAX_HEALTH,
      currentLife: PLAYER_START_MAX_HEALTH
    });
  }

  #tempCode(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Game Scene 2', { fontFamily: ASSET_KEYS.FONT_PRESS_START_2P })
      .setOrigin(0.5);
    

   

    this.#enemyGroup = this.add.group([
      new Spider({
        scene: this,
        position: { x: this.scale.width / 2, y: this.scale.height / 2 + 50 },
      }),

      new Wisp({
        scene: this,
        position: { x: this.scale.width / 2, y: this.scale.height / 2 - 50 },
      })
      
    ], {
      runChildUpdate: true
    }
    );

    //initialize pot 
    this.#potGameObject = [];
    const pot = new Pot({
      scene: this,
      position: { x: this.scale.width / 2 + 90, y: this.scale.height / 2 },
    })
    this.#potGameObject.push(pot);


    //add blocking group
    this.#blockingGroup = this.add.group([
      //pot
      pot,
  
      //crystal
      new Crystal({
        scene: this,
        position: { x: this.scale.width / 2 - 120, y: this.scale.height / 2 },
      }),

      //chest
      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 },
        requireBossKey: false,
      }),
  
      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 - 80 },
        requireBossKey: true,
      }),
    ]);   
  }

  #createRooms(map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    const validTileObjects = getTiledRoomObjectsFromMap(map, layerName);
    console.log(validTileObjects);
    validTileObjects.forEach((tiledObject) => {
      this.#objectByRoomId[tiledObject.id] = {
        switches: [],
        pots: [],
        doors: [],
        chests: [],
        room: tiledObject,
        chestMap: {},
        doorMap: {},

      };
    });
  }
  
  #createDoors(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledDoorObjectsFromMap(map, layerName);
    
    validTileObjects.forEach((tileObejct) => {
      const door = new Door(this, tileObejct, roomId);
      this.#objectByRoomId[roomId].doors.push(door);
      this.#objectByRoomId[roomId].doorMap[tileObejct.id] = door;
      this.#doorTransitionGroup.add(door.doorTransitionZone);
    })
  
  }

  #createButtons(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledSwitchObjectsFromMap(map, layerName);
  }
  #createChests(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledChestObjectsFromMap(map, layerName);
  }
  #createPots(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledPotObjectsFromMap(map, layerName);
  }
  #createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledEnemyObjectsFromMap(map, layerName);
  }

}
