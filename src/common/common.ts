
import { ASSET_KEYS } from "./assets";

export const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
} as const;

export const CHEST_STATE = {
    HIDDEN: 'HIDDEN',
    REVEALED: 'REVEALED',
    OPEN: 'OPEN'
} as const;

export const INTERACTIVE_OBJECT_TYPE = {
    AUTO: 'AUTO',
    PICKUP: 'PICKUP',
    OPEN: 'OPEN',
    OPEN_MY_PORTFOLIO: 'OPEN_MY_PORTFOLIO'
} as const

export const LEVEL_NAME = {
    WORLD: 'WORLD',
    DUNGEON_1: 'DUNGEON_1'
} as const 


export const DUNGEON_ITEM = {
    SMALL_KEY: 'SMALL_KEY',
    BOSS_KEY: 'BOSS_KEY',
    MAP:'MAP',
    COMPASS: 'COMPASS',
} as const 

export const DEFAULT_UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    align: 'center',
    fontFamily: ASSET_KEYS.FONT_PRESS_START_2P,
    fontSize: 8,
    wordWrap: { width: 170 },
    color: '#FFFFFF'
}

export const COMPLETE_UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    align: 'center',
    fontFamily: ASSET_KEYS.FONT_PRESS_START_2P,
    fontSize: 16,
    lineSpacing: 10,
    wordWrap: { width: 220 },
    color: '#ffd700'
}

export const CHEST_REWARD_TO_DIALOG_MAP = {
    SMALL_KEY: 'You found a small key, you can use this to unlock a door',
    BOSS_KEY: 'You found a boss key, you can unlock the boss door now',
    MAP:'You found the Map of the dungeon',
    COMPASS: 'You found the Compass',
    NOTHING: 'Slay the eight-legged demons, Return when they fall',
    HEALTH: 'Your health has increased',
    ATTACK: 'Your damage has increased',
} as const 