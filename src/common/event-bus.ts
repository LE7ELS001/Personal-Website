import * as Phaser from 'phaser'

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
    OEPNED_CHEST: 'OPENED_CHEST',
    ENEMY_DESTROYED: 'ENEMY_DESTROYED',
    PLAYER_DEFEATED: 'PLAYER_DEFEATED',
    OPENED_PORTFOLIO: 'OPENED_PORTFOLIO',
    PLAYER_HEALTH_UPDATE: 'PLAYER_HEALTH_UPDATE',
    SHOW_DIALOG: 'SHOW_DIALOG',
    DIALOG_CLOSE: 'DIALOG_CLOSE',
    BOSS_DEFEATED: 'BOSS_DEFEATED',
    PLAYER_ATTACK_UPDATE: 'PLAYER_ATTACK_UPDATE',
} as const;

export const PLAYER_HEALTH_UPDATE_TYPE = {
    INCREASE:'INCREASE',
    DECREASE:'DECREASE',
} as const

export type PlayerHealthUpdateType = keyof typeof PLAYER_HEALTH_UPDATE_TYPE;

export type PlayerHealthUpdated = {
    currentHealth: number;
    previousHealth: number;
    type: PlayerHealthUpdateType;
}