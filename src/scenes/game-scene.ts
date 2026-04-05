import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, CHEST_REWARD_TO_TEXTURE_FRAME } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { CHEST_REWARD_TO_DIALOG_MAP, CHEST_STATE, DIRECTION, LEVEL_NAME } from '../common/common';
import * as CONFIG from '../common/config';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { ChestState, DungeonItem, GameObject, LevelData } from '../common/types';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { exhaustiveGuard, getDirectionOfObjectFromAnotherObject, isArcadePhysicsBody, isLevelName } from '../common/utils';
import { Crystal } from '../game-objects/objects/crystal';
import { MoveState } from '../components/state-machine/states/character/move-state';
import { TiledRoomObject } from '../common/tiled/types';
import { CHEST_REWARD, DOOR_TYPE, SWITCH_ACTION, SWITCH_TEXTURE, TILED_LAYER_NAMES, TILED_SWITCH_OBJECT_PROPERTY, TRAP_TYPE } from '../common/tiled/common';
import { getAllLayerNamesWithPrefix, getTiledChestObjectsFromMap, getTiledDoorObjectsFromMap, getTiledEnemyObjectsFromMap, getTiledPotObjectsFromMap, getTiledRoomObjectsFromMap, getTiledSwitchObjectsFromMap } from '../common/tiled/tiled-utils';
import { Door } from '../game-objects/objects/door';
import { Button } from '../game-objects/objects/button';
import { InventoryManager } from '../components/inventory/inventory-manager';
import { CHARACTER_STATES } from '../components/state-machine/states/character/character-states';
import { WeaponComponent } from '../components/game-object/weapon-component';
import { DataManager } from '../common/data-manager/data-manager';
import { Drow } from '../game-objects/enemies/boss/drow';
import { PLAYER_HEALTH_INCREASE_AMOUNT, POT_DAMAGE } from '../common/config';

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
      switches: Button[],
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
  #lockedDoorGroup!: Phaser.GameObjects.Group;
  #switchesGroup!: Phaser.GameObjects.Group;
  #rewardItem!: Phaser.GameObjects.Image;


  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  get player(): Player{
    return this.#player;
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


    this.#showObjectsInRoomById(this.#levelData.roomId);
    this.#setUpPlayer();
    this.#setUpCamera();

    this.#rewardItem = this.add.image(0, 0, ASSET_KEYS.UI_ICONS, 0).setVisible(false).setOrigin(0, 1);



    this.#registerColliders();
    this.#registerCustomEvents();

    this.scene.launch(SCENE_KEYS.UI_SCENE);
  } 


  // add collision
  #registerColliders(): void {
    this.#collisionLayer.setCollision(this.#collisionLayer.tileset[0].firstgid);
    this.#enemiesCollisionLayer.setCollision([this.#enemiesCollisionLayer.tileset[0].firstgid]);
      this.physics.add.collider(this.#player, this.#collisionLayer);

    //collision between player and transition object
     this.physics.add.overlap(this.#player, this.#doorTransitionGroup, (playerObj, doorObj) => {
      this.#handleRoomTransition(doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
     });
    
    //collision between player and game object like doors, pots, chests
    this.physics.add.collider(this.#player, this.#blockingGroup, (player, gameObject) => {
      this.#player.collideWithGameObject(gameObject as GameObject);
    })

    //collision between player and switch
    this.physics.add.overlap(this.#player, this.#switchesGroup, (playerObj, switchObj) => {
      this.#handleButtonPress(switchObj as Button);
    });
    

    //collision between player and doors that can be unlocked
    this.physics.add.collider(this.#player, this.#lockedDoorGroup, (player, gameObject) => {
      const doorObject = gameObject as Phaser.Types.Physics.Arcade.GameObjectWithBody;
      const door = this.#objectByRoomId[this.#currentRoomId].doorMap[doorObject.name] as Door;
      
      if (door.doorType !== DOOR_TYPE.LOCK && door.doorType !== DOOR_TYPE.BOSS) {
        return;
      }

      const areaInventroy = InventoryManager.instance.getAreaInventory(this.#levelData.level);
      if (door.doorType === DOOR_TYPE.LOCK) {
        if (areaInventroy.keys > 0) {
          InventoryManager.instance.useAreaSmallKey(this.#levelData.level);
          door.open();

          //use data manager to keep the door state
          DataManager.instance.updateDoortData(this.#currentRoomId, door.id, true);
        }

        return;
      }

      if (!areaInventroy.bossKey) {
        return;
      }
      door.open();

    });

    Object.keys(this.#objectByRoomId).forEach((key) => {
      const roomId = parseInt(key, 10);

      //room id not exist 
      if (this.#objectByRoomId[roomId] === undefined) {
        return;
      }

      
      
      if (this.#objectByRoomId[roomId].enemyGroup !== undefined) {
        this.physics.add.collider(this.#objectByRoomId[roomId].enemyGroup, this.#enemiesCollisionLayer);
        
        this.physics.add.overlap(this.#player, this.#objectByRoomId[roomId].enemyGroup, () => {
          this.#player.hit(DIRECTION.DOWN, 1);
        });

        //use pot to hit enemy 
        const roomPots = this.#objectByRoomId[roomId].pots;
        const enemyGroup = this.#objectByRoomId[roomId].enemyGroup;

        if (roomPots.length > 0 && enemyGroup !== undefined) { 
          this.physics.add.overlap(enemyGroup, roomPots, (enemy, pot) => {
            if (enemy instanceof Wisp) {
              return;
            }
            const potObj = pot as Pot;
            const body = potObj.body as Phaser.Physics.Arcade.Body;

            if (body.velocity.x !== 0 || body.velocity.y !== 0) {
                const enemyGameObject = enemy as CharacterGameObject;
                
                
                enemyGameObject.hit(this.#player.direction, POT_DAMAGE);     
                potObj.break();
            }
        });
        }


        this.physics.add.collider(this.#objectByRoomId[roomId].enemyGroup, this.#blockingGroup, (enemy, gameObject) => {
          // if (gameObject instanceof Pot && isArcadePhysicsBody(gameObject.body) && (gameObject.body.velocity.x !== 0 || gameObject.body.velocity.y !== 0)) {
          //   const enemyGameObject = enemy as CharacterGameObject;
          //   if (enemyGameObject instanceof CharacterGameObject) {
          //     enemyGameObject.hit(this.#player.direction, 1);
          //     gameObject.break();
          //   }
          //   return;
          // };

          
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
        
        //collide with player weapon
          this.physics.add.overlap(
            this.#objectByRoomId[roomId].enemyGroup,
            this.#player.WeaponComponent.body,
            (enemy) => {
            (enemy as CharacterGameObject).hit(this.#player.direction, this.#player.WeaponComponent.weaponDamage);

          },   
          );

          const enemyWeapons = this.#objectByRoomId[roomId].enemyGroup.getChildren().flatMap((enemy) => {
              const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(enemy as GameObject);
            if (weaponComponent !== undefined) {
              return [weaponComponent.body];
            }
            return [];
          });
        
          if (enemyWeapons.length > 0) {
            this.physics.add.overlap(enemyWeapons,
            this.#player,
            (enemyWeaponBody) => {
            const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(enemyWeaponBody as GameObject);
              if (weaponComponent === undefined || weaponComponent.weapon === undefined)
              {
                return;
              }
              weaponComponent.weapon.onCollisionCallback();
              this.#player.hit(DIRECTION.DOWN, weaponComponent.weaponDamage);
          },   
          );
        }

      }

      //collision between pots and current room
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

    
   
  }

  #registerCustomEvents(): void {
    EVENT_BUS.on(CUSTOM_EVENTS.OEPNED_CHEST, this.#handleOpenChest, this);
    EVENT_BUS.on(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
    EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
    EVENT_BUS.on(CUSTOM_EVENTS.DIALOG_CLOSE, this.#handleDialogClose, this);
    EVENT_BUS.on(CUSTOM_EVENTS.BOSS_DEFEATED, this.#handleBossDefeated, this);


    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.OEPNED_CHEST, this.#handleOpenChest, this);
      EVENT_BUS.off(CUSTOM_EVENTS.OEPNED_CHEST, this.#checkForAllEnemiesAreDefeated, this);
      EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
      EVENT_BUS.off(CUSTOM_EVENTS.DIALOG_CLOSE, this.#handleDialogClose, this);
      EVENT_BUS.off(CUSTOM_EVENTS.BOSS_DEFEATED, this.#handleBossDefeated, this);


    })
  }

  #handleOpenChest(chest: Chest): void {
    //use data manager to keep the door state
    DataManager.instance.updateChestData(this.#currentRoomId, chest.id, true, true);

    //test health increase and attack increase function 
    if (chest.contents === CHEST_REWARD.HEALTH) {
      this.#startRewardAnimation(chest);
      this.#player.increasePlayerMaxLife(PLAYER_HEALTH_INCREASE_AMOUNT);

      return;
    } 
    
    if (chest.contents === CHEST_REWARD.ATTACK) {
      this.#startRewardAnimation(chest);
      this.#player.increasePlayerAttack(CONFIG.PLAYER_ATTACK_INCREASE_AMOUNT);
        return; 
    }


    if (chest.contents !== CHEST_REWARD.NOTHING) {
      InventoryManager.instance.addDungeonItem(this.#levelData.level, chest.contents );
    }
    this.#startRewardAnimation(chest);


  }

  #startRewardAnimation(chest: Chest): void {
    this.#rewardItem
      .setFrame(CHEST_REWARD_TO_TEXTURE_FRAME[chest.contents])
      .setVisible(true)
      .setPosition(chest.x, chest.y);

    this.tweens.add({
      targets: this.#rewardItem,
      y: this.#rewardItem.y - 16,
      duration: 500,
      onComplete: () => {
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, CHEST_REWARD_TO_DIALOG_MAP[chest.contents]);
        this.scene.pause();
      }
    });
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
    this.#lockedDoorGroup = this.add.group([]);
    this.#switchesGroup = this.add.group([]);


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


    // console.log(layerName, roomId);
    const validTileObjects = getTiledDoorObjectsFromMap(map, layerName);
    
    validTileObjects.forEach((tileObejct) => {
      const door = new Door(this, tileObejct, roomId);
      this.#objectByRoomId[roomId].doors.push(door);
      this.#objectByRoomId[roomId].doorMap[tileObejct.id] = door;
      this.#doorTransitionGroup.add(door.doorTransitionZone);

      if (door.doorObejct === undefined) {
        return;
      }

      const existingDoorsData =
          DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name][roomId]
            ?.doors[tileObejct.id];
            if (existingDoorsData !== undefined && existingDoorsData.unlocked) {
            door.open();
          }
      

      if (door.doorType === DOOR_TYPE.LOCK || door.doorType === DOOR_TYPE.BOSS) {
        this.#lockedDoorGroup.add(door.doorObejct);
        return;
      }

      this.#blockingGroup.add(door.doorObejct);

    });
  
  }


  #createButtons(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    const validTileObjects = getTiledSwitchObjectsFromMap(map, layerName);
     validTileObjects.forEach((tileObejct) => {
      const button = new Button(this, tileObejct);
      this.#objectByRoomId[roomId].switches.push(button);
      this.#switchesGroup.add(button);
    });
  }



  #createChests(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    const validTileObjects = getTiledChestObjectsFromMap(map, layerName);
    validTileObjects.forEach((tileObejct) => {
      const chest = new Chest(this, tileObejct);
      this.#objectByRoomId[roomId].chests.push(chest)
      this.#objectByRoomId[roomId].chestMap[chest.id] = chest;
      this.#blockingGroup.add(chest);

        const existingChestsData =
          DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name][roomId]
            ?.chests[tileObejct.id];
            if (existingChestsData !== undefined) {
              if (existingChestsData.revealed) {
                chest.reveal();
              };
              if (existingChestsData.opened) {
                chest.open();
              }
          }
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

  //create enemies
  #createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTileObjects = getTiledEnemyObjectsFromMap(map, layerName);
    if (this.#objectByRoomId[roomId].enemyGroup === undefined) {
      this.#objectByRoomId[roomId].enemyGroup = this.add.group([], {
        runChildUpdate: true,
      });
    }
    for (const tileObject of validTileObjects) {
      if (tileObject.type !== 1 && tileObject.type !== 2 && tileObject.type !== 3 && tileObject.type !== 4) {
        continue;
      }
      if (tileObject.type === 1) {
        const spider = new Spider({
          scene: this,
          position: { x: tileObject.x, y: tileObject.y },
        });
        this.#objectByRoomId[roomId].enemyGroup.add(spider);
        continue;
      }
      if (tileObject.type === 2) {
        const wisp = new Wisp({
          scene: this,
          position: { x: tileObject.x, y: tileObject.y },
        });
        this.#objectByRoomId[roomId].enemyGroup.add(wisp);
        continue;
      }
      if (tileObject.type === 3 &&
        !DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name].bossDefeated
      ) {
        const drow = new Drow({ scene: this, position: { x: tileObject.x, y: tileObject.y } });
        this.#objectByRoomId[roomId].enemyGroup.add(drow);
        continue
      }
       if (tileObject.type === 4) {
        //TODO crystal
      }
    }
  }

  #handleRoomTransition(doorTrigger: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {

    this.#controls.isMovementLocked = true;


    const door = this.#objectByRoomId[this.#currentRoomId].doorMap[doorTrigger.name] as Door;

    //player finish playing 
    if (door.targetRoomId === 900) {

      if (doorTrigger.body) {
            doorTrigger.body.enable = false; 
      }
      
      this.scene.stop(SCENE_KEYS.UI_SCENE);
        this.cameras.main.fadeOut(1000, 0, 0, 0); 
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.GAME_COMPLETE_SCENE);
        });
      
        return; 
    }

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
    this.#showObjectsInRoomById(targetdoor.roomId);

    targetdoor.disableObject(); 

    this.#player.stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

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
        this.#hideObjectsInRoomById(door.roomId);
        this.#currentRoomId = targetdoor.roomId;
        this.#checkForAllEnemiesAreDefeated();
        this.cameras.main.startFollow(this.#player);
        this.#controls.isMovementLocked = false;
        
      },
    })

  }


  #handleButtonPress(button: Button): void {
    const buttonPressedData = button.press(); 
    if (buttonPressedData.targetIds.length === 0 || buttonPressedData.action === SWITCH_ACTION.NOTHING)
    {
      return;
    }
    switch (buttonPressedData.action) {
      case SWITCH_ACTION.OPEN_DOOR:
        buttonPressedData.targetIds.forEach((id) => this.#objectByRoomId[this.#currentRoomId].doorMap[id].open());
        break;
      case SWITCH_ACTION.REVEAL_CHEST:
        buttonPressedData.targetIds.forEach((id) => {
          this.#objectByRoomId[this.#currentRoomId].chestMap[id].reveal();
          //use data manager to keep the door state
          const existingChestData = DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name][this.#currentRoomId]
            ?.chests[id];
          if (!existingChestData || !existingChestData.revealed) {
            DataManager.instance.updateChestData(this.#currentRoomId, id, true, false);
          }
        });
        break;
      case SWITCH_ACTION.REVEAL_KEY:
        break;
      default:
        exhaustiveGuard(buttonPressedData.action);
      
    }

  }

  #checkForAllEnemiesAreDefeated(): void {
    const enemyGroup = this.#objectByRoomId[this.#currentRoomId].enemyGroup;
    if (enemyGroup === undefined) {
      return;
    }
    const allRequiredEnemiesDefeated = enemyGroup.getChildren().every((child) => {
      if (!child.active) {
        return true;
      }
      if (child instanceof Wisp) {
        return true;
      }
      return false;
    });
    if (allRequiredEnemiesDefeated) {
      this.#handleAllEnemiesDefeated();
    }
  }

  #handleAllEnemiesDefeated(): void{


    this.#objectByRoomId[this.#currentRoomId].chests.forEach((chest) => {
      if (chest.revealTrigger === TRAP_TYPE.ENEMIES_DEFEATED) {
        chest.reveal();

        const existingChestData =
          DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name][this.#currentRoomId]
            ?.chests[chest.id];
          if (!existingChestData || !existingChestData.revealed) {
            DataManager.instance.updateChestData(this.#currentRoomId, chest.id, true, false);
          }
      } 
    });

    this.#objectByRoomId[this.#currentRoomId].doors.forEach((door) => {
      if (door.trapDoorTrigger === TRAP_TYPE.ENEMIES_DEFEATED) {
        door.open();
      } 
      if (door.trapDoorTrigger === TRAP_TYPE.BOSS_DEFEATED && 
        DataManager.instance.data.areaDetails[DataManager.instance.data.currentArea.name].bossDefeated
      ) {
        door.open();
      } 
    });
  }

  #showObjectsInRoomById(roomId: number): void{
    this.#objectByRoomId[roomId].doors.forEach((door) => door.enableObject());
    this.#objectByRoomId[roomId].pots.forEach((pot) => pot.resetPosition());
    this.#objectByRoomId[roomId].switches.forEach((button) => button.enableObject());
    this.#objectByRoomId[roomId].chests.forEach((chest) => chest.enableObject());

    if (this.#objectByRoomId[roomId].enemyGroup === undefined) {
      return;
    }
    for (const child of this.#objectByRoomId[roomId].enemyGroup.getChildren())
    {
      (child as CharacterGameObject).enableObject();
    }
  }

  #hideObjectsInRoomById(roomId: number): void{
        this.#objectByRoomId[roomId].doors.forEach((door) => door.disableObject());
    this.#objectByRoomId[roomId].pots.forEach((pot) => pot.disableObject());
    this.#objectByRoomId[roomId].switches.forEach((button) => button.disableObject());
    this.#objectByRoomId[roomId].chests.forEach((chest) => chest.disableObject());

    if (this.#objectByRoomId[roomId].enemyGroup === undefined) {
      return;
    }
    for (const child of this.#objectByRoomId[roomId].enemyGroup.getChildren())
    {
      (child as CharacterGameObject).disableObject();
    }
  }

  #handlePlayerDefeatedEvent(): void {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.GAME_OVER_SCENE);
    });
    this.cameras.main.fadeOut(1000, 0, 0, 0);
  }

  #handleDialogClose(): void {
    this.#rewardItem.setVisible(false);
    this.scene.resume();
  }

  #handleBossDefeated(): void {
    DataManager.instance.defeatedCurrentAreaBoss();
    this.#handleAllEnemiesDefeated();
  }
}
