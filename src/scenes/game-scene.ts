import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { CHEST_STATE, DIRECTION } from '../common/common';
import * as CONFIG from '../common/config';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { ChestState, GameObject, LevelData } from '../common/types';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { exhaustiveGuard, getDirectionOfObjectFromAnotherObject, isArcadePhysicsBody, isLevelName } from '../common/utils';
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
  #blockingGroup!: Phaser.GameObjects.Group
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



    this.#registerColliders();
    this.#registerCustomEvents();

  
  } 


  // add collision
  #registerColliders(): void {
    this.#collisionLayer.setCollision(this.#collisionLayer.tileset[0].firstgid);
    this.#enemiesCollisionLayer.setCollision([this.#enemiesCollisionLayer.tileset[0].firstgid]);
      this.physics.add.collider(this.#player, this.#collisionLayer);

     this.physics.add.overlap(this.#player, this.#doorTransitionGroup, (playerObj, doorObj) => {
      this.#handleRoomTransition(doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
     });
    
    this.physics.add.collider(this.#player, this.#blockingGroup, (player, gameObject) => {
      this.#player.collideWithGameObject(gameObject as GameObject);
    })

    Object.keys(this.#objectByRoomId).forEach((key) => {
      const roomId = parseInt(key, 10);

      //room id not exist 
      if (this.#objectByRoomId[roomId] === undefined) {
        return;
      }
      
      if (this.#objectByRoomId[roomId].enemyGroup !== undefined) {
        this.physics.add.collider(this.#objectByRoomId[roomId].enemyGroup, this.#collisionLayer);
        
        this.physics.add.overlap(this.#player, this.#objectByRoomId[roomId].enemyGroup, (player, enemy) => {
          this.#player.hit(DIRECTION.DOWN, 1);
          const enemyGameObject = enemy as CharacterGameObject;
          enemyGameObject.hit(this.#player.direction, 1);
        });
        this.physics.add.collider(this.#objectByRoomId[roomId].enemyGroup, this.#blockingGroup, (enemy, gameObject) => {
          if (gameObject instanceof Pot && isArcadePhysicsBody(gameObject.body) && (gameObject.body.velocity.x !== 0 || gameObject.body.velocity.y !== 0)) {
            const enemyGameObject = enemy as CharacterGameObject;
            if (enemyGameObject instanceof CharacterGameObject) {
              enemyGameObject.hit(this.#player.direction, 1);
              gameObject.break();
            }
            return;
          };

          if (gameObject instanceof Crystal) {
            console.log('enemy hit the crystal');
          }
      
      
        },

      
          (enemy, gameObject) => {
            const body = (gameObject as unknown as GameObject).body
            if (enemy instanceof Wisp) {
        
              if (isArcadePhysicsBody(body) &&
                (body.velocity.x !== 0 || body.velocity.y !== 0)) {
                return false;
              }
        
              if (gameObject instanceof Crystal) { return false };
            }
       
            return true;
          });

      }


      if (this.#objectByRoomId[roomId].pots.length > 0) {
        this.physics.add.collider(this.#objectByRoomId[roomId].pots, this.#blockingGroup, (pot) => {
          if (!(pot instanceof Pot)) {
            return;
          }
          pot.break();
        });

        if (this.#objectByRoomId[roomId].pots.length > 0) {
          this.physics.add.collider(this.#objectByRoomId[roomId].pots, this.#collisionLayer, (pot) => {
            if (!(pot instanceof Pot)) {
              return;
            }
            pot.break();
          });
        }
      }
    });


  
    
    

    this.physics.add.collider(this.#player, this.#blockingGroup, (player, gameObject) => {
      this.#player.collideWithGameObject(gameObject as GameObject);
    })


    //register collisions between player and blocking game objects
    this.physics.add.overlap(this.#player, this.#doorTransitionGroup, (playerObj, doorObj) => {
      this.#handleRoomTransition(doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
    });

   
    

    //add layer collision
      this.#collisionLayer.setCollision(this.#collisionLayer.tileset[0].firstgid);
      this.physics.add.collider(this.#player, this.#collisionLayer);
    
   
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
    this.#collisionLayer.setDepth(2).setAlpha(CONFIG.DEBUG_COLLISION_ALPHA);

    const enemyCollisionLayer = map.createLayer(TILED_LAYER_NAMES.ENEMY_COLLISION, collisionTiles, 0, 0);
    if (enemyCollisionLayer === null) {
      console.log('error while creating enemies collision layer');
      return;
    }
    this.#enemiesCollisionLayer = enemyCollisionLayer;
    this.#enemiesCollisionLayer.setDepth(2).setVisible(CONFIG.ENABLE_ENEMIES_COLLISION_LAYER);

    
    //initialize objects
    this.#objectByRoomId = {};
    this.#doorTransitionGroup = this.add.group([]);
    this.#blockingGroup = this.add.group([]);


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

    //set up player starting position
    const startingDoor = this.#objectByRoomId[this.#levelData.roomId].doorMap[this.#levelData.doorId];
    const playerStartPosition = {
      x: startingDoor.x + startingDoor.doorTransitionZone.width / 2,
      y: startingDoor.y - startingDoor.doorTransitionZone.height /2,
    }
    switch (startingDoor.direction) {
      case DIRECTION.UP:
        playerStartPosition.y += 40;
        break;
      case DIRECTION.DOWN:
        playerStartPosition.y -= 40;
        break;
      case DIRECTION.LEFT:
        playerStartPosition.x += 40;
        break;
      case DIRECTION.RIGHT:
        playerStartPosition.x -= 40;
        break;
      default:
        exhaustiveGuard(startingDoor.direction);
    }


    this.#player = new Player({
      scene: this,
      position: { x: playerStartPosition.x, y: playerStartPosition.y },
      controls: this.#controls,
      maxLife: CONFIG.PLAYER_START_MAX_HEALTH,
      currentLife: CONFIG.PLAYER_START_MAX_HEALTH
    });
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
    const validTileObjects = getTiledChestObjectsFromMap(map, layerName);
    validTileObjects.forEach((tileObejct) => {
      const chest = new Chest(this, tileObejct);
      this.#objectByRoomId[roomId].chests.push(chest)
      this.#objectByRoomId[roomId].chestMap[chest.id] = chest;
      this.#blockingGroup.add(chest);
    });
  }

  //create pots
  #createPots(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    const validTileObjects = getTiledPotObjectsFromMap(map, layerName);
    validTileObjects.forEach((tileObejct) => {
      const pot = new Pot(this, tileObejct);
      this.#objectByRoomId[roomId].pots.push(pot);
      this.#blockingGroup.add(pot);
    });
  }

  //TODO
  #createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledEnemyObjectsFromMap(map, layerName);
  }

  #handleRoomTransition(doorTrigger: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    console.log(doorTrigger.name);
    this.#controls.isMovementLocked = true;
    const door = this.#objectByRoomId[this.#currentRoomId].doorMap[doorTrigger.name] as Door;

    //transition to another level 
    const modifiedLevelName = door.targetLevel.toUpperCase();
    if (isLevelName(modifiedLevelName)) {
      const sceneData = {
      level: modifiedLevelName,
      roomId: door.targetRoomId,
      doorId: door.targetDoorId
      }
      this.scene.start(SCENE_KEYS.GAME_SCENE, sceneData);
      return;
    };

    //transition to another room 
    const targetdoor = this.#objectByRoomId[door.targetRoomId].doorMap[door.targetDoorId];

    door.disableObject();
    targetdoor.disableObject(); 

    //calculate the transit distance
    const targetDirection = getDirectionOfObjectFromAnotherObject(door, targetdoor);
    const doorDistance = {
      x: Math.abs((door.doorTransitionZone.x - targetdoor.doorTransitionZone.x) / 2),
      y: Math.abs((door.doorTransitionZone.y - targetdoor.doorTransitionZone.y) / 2)
    };
    if (targetDirection === DIRECTION.LEFT) {
      doorDistance.x *= -1;
    }
    if (targetDirection === DIRECTION.UP) {
      doorDistance.y *= -1;
    }

    const playerTargetPosition = {
      x: door.x + door.doorTransitionZone.width / 2 + doorDistance.x,
      y: door.y - door.doorTransitionZone.height / 2 + doorDistance.y,
    }
    this.tweens.add({
      targets: this.#player,
      y: playerTargetPosition.y,
      x: playerTargetPosition.x,
      duration: CONFIG.ROOM_TRANSITION_PLAYER_INTO_HALL_DURATION,
      delay: CONFIG.ROOM_TRANSITION_PLAYER_INTO_HALL_DELAY,
    })

    //camera movement 
    const roomSize = this.#objectByRoomId[targetdoor.roomId].room;
    this.cameras.main.setBounds(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      this.cameras.main.worldView.width,
      this.cameras.main.worldView.height,
    );
    this.cameras.main.stopFollow();
    const bounds = this.cameras.main.getBounds();
    this.tweens.add({
      targets: bounds,
      x: roomSize.x,
      y: roomSize.y - roomSize.height,
      duration: CONFIG.ROOM_TRANSITION_CAMERA_ANIMATION_DURATION,
      delay: CONFIG.ROOM_TRANSITION_CAMERA_ANIMATION_DELAY,
      onUpdate: () => {
        this.cameras.main.setBounds(
          bounds.x,
          bounds.y,
          roomSize.width,
          roomSize.height,
        )
      },
    });

    //player animation(move in the new room)
    const playerDistanceToMoveIntoRoom = {
      x: doorDistance.x * 2,
      y: doorDistance.y * 2
    }
    if (targetDirection === DIRECTION.UP || targetDirection === DIRECTION.DOWN) {
      playerDistanceToMoveIntoRoom.y = Math.max(Math.abs(playerDistanceToMoveIntoRoom.y), 32);
      if (targetDirection === DIRECTION.UP) {
        playerDistanceToMoveIntoRoom.y *= -1;
      }
    } else {
      playerDistanceToMoveIntoRoom.x = Math.max(Math.abs(playerDistanceToMoveIntoRoom.x), 32);
      if (targetDirection === DIRECTION.LEFT) {
        playerDistanceToMoveIntoRoom.x *= -1;
      }
    }

    this.tweens.add({
      targets: this.#player,
      y: playerTargetPosition.y + playerDistanceToMoveIntoRoom.y,
      x: playerTargetPosition.x + playerDistanceToMoveIntoRoom.x,
      duration: CONFIG.ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DURATION,
      delay: CONFIG.ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DELAY,
      onComplete: () => {
        targetdoor.enableObject();
        this.#currentRoomId = targetdoor.roomId;
        this.cameras.main.startFollow(this.#player);
         this.#controls.isMovementLocked = false;
      },
    })

  }

}
