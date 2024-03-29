declare module "ts/model/coordinate" {
    export interface Coordinate {
        x: number;
        y: number;
    }
    export const moveRight: (coord: Coordinate) => {
        x: number;
        y: number;
    };
    export const moveUp: (coord: Coordinate) => {
        x: number;
        y: number;
    };
    export const moveLeft: (coord: Coordinate) => {
        x: number;
        y: number;
    };
    export const moveDown: (coord: Coordinate) => {
        x: number;
        y: number;
    };
}
declare module "ts/model/grid" {
    import { Coordinate } from "ts/model/coordinate";
    export class Grid {
        readonly width: number;
        readonly height: number;
        private readonly grid;
        constructor(width: number, height: number);
        private buildInitialGrid;
        getRandomEmptySpace(): Coordinate;
        private getRandomUpTo;
        moveCellTo(from: Coordinate, to: Coordinate): void;
        mergeCells(from: Coordinate, to: Coordinate): void;
        setValueAtCellTo(coord: Coordinate, value: number): void;
        getCell(coord: Coordinate): number;
    }
}
declare module "ts/render/gridview" {
    import { Grid } from "ts/model/grid";
    export class GridView {
        private readonly grid;
        private cells;
        constructor(element: HTMLElement, grid: Grid);
        private initCellElements;
        update(): void;
        private getCellValue;
    }
}
declare module "ts/render/notifier" {
    export class Notifier {
        private readonly gameDiv;
        private readonly displayDiv;
        private readonly messageDiv;
        constructor(gameDiv: HTMLElement);
        notifyDefeat(): void;
        notifyVictory(): void;
    }
}
declare module "ts/game/inputresult" {
    export enum InputResult {
        Continue = 0,
        GameDefeat = 1,
        GameVictory = 2,
        InvalidDirection = 3
    }
}
declare module "ts/game/gridcontrol" {
    import { Grid } from "ts/model/grid";
    import { InputResult } from "ts/game/inputresult";
    export class GridControl {
        private readonly grid;
        constructor(grid: Grid);
        private placeNewTile;
        private pickValueToAdd;
        moveRight(): InputResult;
        private canMoveRight;
        private shiftRowRight;
        private shiftCellRight;
        moveUp(): InputResult;
        private canMoveUp;
        private shiftColumnUp;
        private shiftCellUp;
        moveLeft(): InputResult;
        private canMoveLeft;
        private shiftRowLeft;
        private shiftCellLeft;
        moveDown(): InputResult;
        private canMoveDown;
        private shiftColumnDown;
        private shiftCellDown;
        private isDefeat;
        private isVictory;
    }
}
declare module "ts/game/inputdirection" {
    export enum InputDirection {
        Right = 0,
        Up = 1,
        Left = 2,
        Down = 3
    }
}
declare module "ts/game/gamecontrol" {
    import { GridView } from "ts/render/gridview";
    import { Notifier } from "ts/render/notifier";
    import { GridControl } from "ts/game/gridcontrol";
    import { InputDirection } from "ts/game/inputdirection";
    export class GameControl {
        private readonly gridControl;
        private readonly gridView;
        private readonly notifier;
        private running;
        constructor(gridControl: GridControl, gridView: GridView, notifier: Notifier);
        processInput(direction: InputDirection): void;
    }
}
declare module "ts/game/keylistener" {
    import { GameControl } from "ts/game/gamecontrol";
    export class KeyListener {
        constructor(game: GameControl);
    }
}
declare module "ts/game/touchlistener" {
    import { GameControl } from "ts/game/gamecontrol";
    export class TouchListener {
        private readonly game;
        private readonly MINIMUM_SWIPE_THRESHOLD_SQUARED;
        private touchStartX;
        private touchStartY;
        private touchEndX;
        private touchEndY;
        constructor(game: GameControl);
        private handleGesture;
    }
}
declare module "ts/game/2048game" {
    export class TwentyFourtyEightGame {
        constructor(element: HTMLElement);
    }
}
declare module "ts/index" { }
