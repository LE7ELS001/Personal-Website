import * as Phaser from 'phaser'

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
    OEPNED_CHEST: 'OPENED_CHEST',
    OPENED_PORTFOLIO: 'OPENED_PORTFOLIO'
} as const;