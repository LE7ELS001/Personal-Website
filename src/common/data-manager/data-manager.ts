import { Player } from "../../game-objects/player/player";
import { LEVEL_NAME } from "../common";
import { PLAYER_ATTACK_DAMAGE, PLAYER_START_MAX_HEALTH } from "../config";
import { CUSTOM_EVENTS, EVENT_BUS, PLAYER_HEALTH_UPDATE_TYPE, PlayerHealthUpdated, PlayerHealthUpdateType } from "../event-bus";
import { LevelName } from "../types";

export type PlayerData = {
    currentHealth: number;
    maxHealth: number;
    baseAttack: number;
    currentArea: {
        name: LevelName;
        startRoomId: number;
        startDoorId: number;
    };
    areaDetails: {
        [key in LevelName]: {
            [key: number]: {
                chests: {
                    [key: number]: {
                        revealed: boolean;
                        opened: boolean;
                    };
                };
                doors: {
                    [key: string]: {
                        unlocked: boolean;
                    };
                };
            };
            bossDefeated?: boolean;
        };

    };

};


export class DataManager {
    static #instance: DataManager;

        #data: PlayerData;
        private constructor() {
            this.#data = {
                currentHealth: PLAYER_START_MAX_HEALTH,
                maxHealth: PLAYER_START_MAX_HEALTH,
                baseAttack: PLAYER_ATTACK_DAMAGE,
                currentArea: {
                    name: LEVEL_NAME.DUNGEON_1,
                    startRoomId: 1,
                    startDoorId:99,
                },
                areaDetails: {
                    DUNGEON_1: {
                        bossDefeated: false
                    },
                    WORLD: {
                        
                    }
                }
            }
        }
    
    public static get instance(): DataManager{
            if (!this.#instance) {
                DataManager.#instance = new DataManager();   
            }
            return DataManager.#instance;
    }

    public defeatedCurrentAreaBoss(): void {
        this.#data.areaDetails[this.#data.currentArea.name].bossDefeated = true;
    }
    
    get data(): PlayerData{
        return{...this.#data}
    }

    set data(data: PlayerData) {
        this.#data = { ...data };
    }

    public updateAreaData(area: LevelName, startRoomId: number, startDoorId: number):void {
        this.#data.currentArea = {
            name: area,
            startRoomId,
            startDoorId
        };
    }

    public updateChestData(roomId: number, chestId: number, revealed: boolean, opened: boolean): void {
        this.#populateDefaultRoomData(roomId);
        this.#data.areaDetails[this.#data.currentArea.name][roomId].chests[chestId] = {
            revealed,
            opened,
        };
    }

    public updateDoortData(roomId: number, doorId: number, unlocked: boolean): void {
        this.#populateDefaultRoomData(roomId);
        this.#data.areaDetails[this.#data.currentArea.name][roomId].doors[doorId] = {
            unlocked,
        };
    }

    

    public resetPlayerHealthToMin(): void{
        this.#data.currentHealth = PLAYER_START_MAX_HEALTH;
    }

    public updatePlayerCurrentHealth(health: number): void {
        if (health === this.#data.currentHealth) {
            return;
        }
        let healthUpdateType: PlayerHealthUpdateType = PLAYER_HEALTH_UPDATE_TYPE.DECREASE;
        if (health > this.#data.currentHealth) {
            healthUpdateType = PLAYER_HEALTH_UPDATE_TYPE.INCREASE;
        }
        const dataToPass: PlayerHealthUpdated = {
            previousHealth: this.#data.currentHealth,
            currentHealth: health,
            type: healthUpdateType,
        }
        this.#data.currentHealth = health;
        EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATE, dataToPass);
    }

    public updatePlayerMaxHealth(maxHealth: number): void {
        this.#data.maxHealth = maxHealth;
    }

    public updatePlayerAttack(attack: number): void {
        const previousAttack = this.#data.baseAttack;

        this.#data.baseAttack += attack;

        EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_ATTACK_UPDATE, {
            newAttack: this.#data.baseAttack,
            previousAttack: previousAttack
        });

        console.log(`player attack updated, current attack: ${this.data.baseAttack}`, `previous attack: ${previousAttack}`);
    }

    #populateDefaultRoomData(roomId: number): void{
        if (this.#data.areaDetails[this.#data.currentArea.name][roomId] === undefined) {
            this.#data.areaDetails[this.#data.currentArea.name][roomId] = {
                chests: {},
                doors: {},
            };
        }
    }
}