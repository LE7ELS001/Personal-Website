import * as Phaser from 'phaser'

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
    OEPNED_CHEST: 'OPENED_CHEST',
    ENEMY_DESTROYED: 'ENEMY_DESTROYED',
    PLAYER_DEFEATED: 'PLAYER_DEFEATED',
    OPENED_PORTFOLIO: 'OPENED_PORTFOLIO'
} as const;