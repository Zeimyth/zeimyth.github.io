define("ts/model/coordinate", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.moveDown = exports.moveLeft = exports.moveUp = exports.moveRight = void 0;
    const moveRight = (coord) => {
        return { x: coord.x + 1, y: coord.y };
    };
    exports.moveRight = moveRight;
    const moveUp = (coord) => {
        return { x: coord.x, y: coord.y - 1 };
    };
    exports.moveUp = moveUp;
    const moveLeft = (coord) => {
        return { x: coord.x - 1, y: coord.y };
    };
    exports.moveLeft = moveLeft;
    const moveDown = (coord) => {
        return { x: coord.x, y: coord.y + 1 };
    };
    exports.moveDown = moveDown;
});
define("ts/model/grid", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Grid = void 0;
    class Grid {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.grid = this.buildInitialGrid();
        }
        buildInitialGrid() {
            const grid = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                grid[y] = new Array(this.width);
                for (let x = 0; x < this.width; x++) {
                    grid[y][x] = 0;
                }
            }
            return grid;
        }
        getRandomEmptySpace() {
            let x = 0, y = 0;
            // TODO: Don't infinitely loop
            do {
                x = this.getRandomUpTo(this.width);
                y = this.getRandomUpTo(this.height);
            } while (this.grid[y][x] !== 0);
            return { x, y };
        }
        getRandomUpTo(exclusiveMax) {
            return Math.floor(Math.random() * exclusiveMax);
        }
        moveCellTo(from, to) {
            if (from.x === to.x && from.y === to.y) {
                return;
            }
            this.grid[to.y][to.x] = this.grid[from.y][from.x];
            this.grid[from.y][from.x] = 0;
        }
        mergeCells(from, to) {
            if (from.x === to.x && from.y === to.y) {
                return;
            }
            this.grid[to.y][to.x] *= 2;
            this.grid[from.y][from.x] = 0;
        }
        setValueAtCellTo(coord, value) {
            this.grid[coord.y][coord.x] = value;
        }
        getCell(coord) {
            if (coord.x < this.width && coord.y < this.height) {
                return this.grid[coord.y][coord.x];
            }
            else {
                throw new Error(`Cell out of bounds: Requested (${coord.x}, ${coord.y}) but grid is ${this.width}x${this.height}`);
            }
        }
    }
    exports.Grid = Grid;
});
define("ts/render/gridview", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridView = void 0;
    class GridView {
        constructor(element, grid) {
            this.grid = grid;
            this.cells = this.initCellElements(element);
            this.update();
        }
        initCellElements(element) {
            const cells = new Array(this.grid.height);
            for (let y = 0; y < this.grid.height; y++) {
                const row = document.createElement('div');
                row.classList.add('grid-row');
                cells[y] = new Array(this.grid.width);
                for (let x = 0; x < this.grid.width; x++) {
                    const cell = document.createElement('div');
                    cell.classList.add('grid-cell');
                    cell.innerText = this.getCellValue({ x, y });
                    row.appendChild(cell);
                    cells[y][x] = cell;
                }
                element.appendChild(row);
            }
            return cells;
        }
        update() {
            for (let y = 0; y < this.grid.height; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const cellDom = this.cells[y][x];
                    const cellValue = this.getCellValue({ x, y });
                    cellDom.classList.forEach(className => {
                        if (className.startsWith('value-')) {
                            cellDom.classList.remove(className);
                        }
                    });
                    if (cellValue !== ' ') {
                        cellDom.classList.add(`value-${cellValue}`);
                    }
                    cellDom.innerText = cellValue;
                }
            }
        }
        getCellValue(coord) {
            const numberAtCell = this.grid.getCell(coord);
            if (numberAtCell > 0) {
                return numberAtCell.toString();
            }
            else {
                return ' ';
            }
        }
    }
    exports.GridView = GridView;
});
define("ts/game/inputresult", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputResult = void 0;
    var InputResult;
    (function (InputResult) {
        InputResult[InputResult["Continue"] = 0] = "Continue";
        InputResult[InputResult["InvalidDirection"] = 1] = "InvalidDirection";
    })(InputResult = exports.InputResult || (exports.InputResult = {}));
});
define("ts/game/gridcontrol", ["require", "exports", "ts/game/inputresult", "ts/model/coordinate"], function (require, exports, inputresult_1, coordinate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridControl = void 0;
    class GridControl {
        constructor(grid) {
            this.grid = grid;
            this.placeNewTile(2);
            this.placeNewTile(2);
        }
        placeNewTile(valueOverride) {
            const valueToAdd = valueOverride || this.pickValueToAdd();
            const coord = this.grid.getRandomEmptySpace();
            this.grid.setValueAtCellTo(coord, valueToAdd);
        }
        pickValueToAdd() {
            if (Math.random() > 0.9) {
                return 4;
            }
            else {
                return 2;
            }
        }
        moveRight() {
            if (this.canMoveRight()) {
                for (let y = 0; y < this.grid.height; y++) {
                    this.shiftRowRight(y);
                }
                this.placeNewTile();
                return inputresult_1.InputResult.Continue;
            }
            else {
                return inputresult_1.InputResult.InvalidDirection;
            }
        }
        canMoveRight() {
            for (let y = 0; y < this.grid.height; y++) {
                // Skip rightmost column, since those cells will never move
                for (let x = 0; x < this.grid.width - 1; x++) {
                    const coord = { x, y };
                    const valueAtCell = this.grid.getCell(coord);
                    if (valueAtCell > 0) {
                        const valueAtNeighbor = this.grid.getCell((0, coordinate_1.moveRight)(coord));
                        if (valueAtNeighbor === 0 || valueAtNeighbor === valueAtCell) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        shiftRowRight(y) {
            const merged = new Set();
            for (let x = this.grid.width - 2; x >= 0; x--) {
                const coord = { x, y };
                if (this.grid.getCell(coord) !== 0) {
                    const mergedTarget = this.shiftCellRight(coord, merged);
                    if (mergedTarget !== null) {
                        merged.add(mergedTarget);
                    }
                }
            }
        }
        shiftCellRight(coord, mergedCells) {
            const target = { x: coord.x, y: coord.y };
            const valueAtCell = this.grid.getCell(coord);
            for (let targetX = coord.x + 1; targetX < this.grid.width; targetX++) {
                const valueAtTarget = this.grid.getCell({ x: targetX, y: coord.y });
                if (valueAtTarget === 0) {
                    target.x = targetX;
                }
                else if (valueAtTarget === valueAtCell && !mergedCells.has(targetX)) {
                    target.x = targetX;
                    this.grid.mergeCells(coord, target);
                    // TODO: Handle scoring
                    return target.x;
                }
                else {
                    this.grid.moveCellTo(coord, target);
                    return null;
                }
            }
            this.grid.moveCellTo(coord, target);
            return null;
        }
        moveUp() {
            if (this.canMoveUp()) {
                for (let x = 0; x < this.grid.width; x++) {
                    this.shiftColumnUp(x);
                }
                this.placeNewTile();
                return inputresult_1.InputResult.Continue;
            }
            else {
                return inputresult_1.InputResult.InvalidDirection;
            }
        }
        canMoveUp() {
            // Skip topmost row, since those cells will never move
            for (let y = 1; y < this.grid.height; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const coord = { x, y };
                    const valueAtCell = this.grid.getCell(coord);
                    if (valueAtCell > 0) {
                        const valueAtNeighbor = this.grid.getCell((0, coordinate_1.moveUp)(coord));
                        if (valueAtNeighbor === 0 || valueAtNeighbor === valueAtCell) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        shiftColumnUp(x) {
            const merged = new Set();
            for (let y = 1; y < this.grid.height; y++) {
                const coord = { x, y };
                if (this.grid.getCell(coord) !== 0) {
                    const mergedTarget = this.shiftCellUp(coord, merged);
                    if (mergedTarget !== null) {
                        merged.add(mergedTarget);
                    }
                }
            }
        }
        shiftCellUp(coord, mergedCells) {
            const target = { x: coord.x, y: coord.y };
            const valueAtCell = this.grid.getCell(coord);
            for (let targetY = coord.y - 1; targetY >= 0; targetY--) {
                const valueAtTarget = this.grid.getCell({ x: coord.x, y: targetY });
                if (valueAtTarget === 0) {
                    target.y = targetY;
                }
                else if (valueAtTarget === valueAtCell && !mergedCells.has(targetY)) {
                    target.y = targetY;
                    this.grid.mergeCells(coord, target);
                    // TODO: Handle scoring
                    return target.y;
                }
                else {
                    this.grid.moveCellTo(coord, target);
                    return null;
                }
            }
            this.grid.moveCellTo(coord, target);
            return null;
        }
        moveLeft() {
            if (this.canMoveLeft()) {
                for (let y = 0; y < this.grid.height; y++) {
                    this.shiftRowLeft(y);
                }
                this.placeNewTile();
                return inputresult_1.InputResult.Continue;
            }
            else {
                return inputresult_1.InputResult.InvalidDirection;
            }
        }
        canMoveLeft() {
            for (let y = 0; y < this.grid.height; y++) {
                // Skip leftmost column, since those cells will never move
                for (let x = 1; x < this.grid.width; x++) {
                    const coord = { x, y };
                    const valueAtCell = this.grid.getCell(coord);
                    if (valueAtCell > 0) {
                        const valueAtNeighbor = this.grid.getCell((0, coordinate_1.moveLeft)(coord));
                        if (valueAtNeighbor === 0 || valueAtNeighbor === valueAtCell) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        shiftRowLeft(y) {
            const merged = new Set();
            for (let x = 1; x < this.grid.width; x++) {
                const coord = { x, y };
                if (this.grid.getCell(coord) !== 0) {
                    const mergedTarget = this.shiftCellLeft(coord, merged);
                    if (mergedTarget !== null) {
                        merged.add(mergedTarget);
                    }
                }
            }
        }
        shiftCellLeft(coord, mergedCells) {
            const target = { x: coord.x, y: coord.y };
            const valueAtCell = this.grid.getCell(coord);
            for (let targetX = coord.x - 1; targetX >= 0; targetX--) {
                const valueAtTarget = this.grid.getCell({ x: targetX, y: coord.y });
                if (valueAtTarget === 0) {
                    target.x = targetX;
                }
                else if (valueAtTarget === valueAtCell && !mergedCells.has(targetX)) {
                    target.x = targetX;
                    this.grid.mergeCells(coord, target);
                    // TODO: Handle scoring
                    return target.x;
                }
                else {
                    this.grid.moveCellTo(coord, target);
                    return null;
                }
            }
            this.grid.moveCellTo(coord, target);
            return null;
        }
        moveDown() {
            if (this.canMoveDown()) {
                for (let x = 0; x < this.grid.width; x++) {
                    this.shiftColumnDown(x);
                }
                this.placeNewTile();
                return inputresult_1.InputResult.Continue;
            }
            else {
                return inputresult_1.InputResult.InvalidDirection;
            }
        }
        canMoveDown() {
            // Skip bottommost row, since those cells will never move
            for (let y = 0; y < this.grid.height - 1; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const coord = { x, y };
                    const valueAtCell = this.grid.getCell(coord);
                    if (valueAtCell > 0) {
                        const valueAtNeighbor = this.grid.getCell((0, coordinate_1.moveDown)(coord));
                        if (valueAtNeighbor === 0 || valueAtNeighbor === valueAtCell) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        shiftColumnDown(x) {
            const merged = new Set();
            for (let y = this.grid.height - 2; y >= 0; y--) {
                const coord = { x, y };
                if (this.grid.getCell(coord) !== 0) {
                    const mergedTarget = this.shiftCellDown(coord, merged);
                    if (mergedTarget !== null) {
                        merged.add(mergedTarget);
                    }
                }
            }
        }
        shiftCellDown(coord, mergedCells) {
            const target = { x: coord.x, y: coord.y };
            const valueAtCell = this.grid.getCell(coord);
            for (let targetY = coord.y + 1; targetY < this.grid.height; targetY++) {
                const valueAtTarget = this.grid.getCell({ x: coord.x, y: targetY });
                if (valueAtTarget === 0) {
                    target.y = targetY;
                }
                else if (valueAtTarget === valueAtCell && !mergedCells.has(targetY)) {
                    target.y = targetY;
                    this.grid.mergeCells(coord, target);
                    // TODO: Handle scoring
                    return target.y;
                }
                else {
                    this.grid.moveCellTo(coord, target);
                    return null;
                }
            }
            this.grid.moveCellTo(coord, target);
            return null;
        }
    }
    exports.GridControl = GridControl;
});
define("ts/game/inputdirection", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputDirection = void 0;
    var InputDirection;
    (function (InputDirection) {
        InputDirection[InputDirection["Right"] = 0] = "Right";
        InputDirection[InputDirection["Up"] = 1] = "Up";
        InputDirection[InputDirection["Left"] = 2] = "Left";
        InputDirection[InputDirection["Down"] = 3] = "Down";
    })(InputDirection = exports.InputDirection || (exports.InputDirection = {}));
});
define("ts/game/gamecontrol", ["require", "exports", "ts/game/inputdirection", "ts/game/inputresult"], function (require, exports, inputdirection_1, inputresult_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameControl = void 0;
    class GameControl {
        constructor(gridControl, gridView) {
            this.gridControl = gridControl;
            this.gridView = gridView;
        }
        processInput(direction) {
            let result = inputresult_2.InputResult.InvalidDirection;
            if (direction === inputdirection_1.InputDirection.Right) {
                result = this.gridControl.moveRight();
            }
            else if (direction === inputdirection_1.InputDirection.Up) {
                result = this.gridControl.moveUp();
            }
            else if (direction === inputdirection_1.InputDirection.Left) {
                result = this.gridControl.moveLeft();
            }
            else if (direction === inputdirection_1.InputDirection.Down) {
                result = this.gridControl.moveDown();
            }
            this.gridView.update();
            return result;
        }
    }
    exports.GameControl = GameControl;
});
define("ts/game/keylistener", ["require", "exports", "ts/game/inputdirection"], function (require, exports, inputdirection_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyListener = void 0;
    class KeyListener {
        constructor(game) {
            document.onkeydown = event => {
                if (event.key === 'ArrowRight') {
                    game.processInput(inputdirection_2.InputDirection.Right);
                }
                else if (event.key === 'ArrowUp') {
                    game.processInput(inputdirection_2.InputDirection.Up);
                }
                else if (event.key === 'ArrowLeft') {
                    game.processInput(inputdirection_2.InputDirection.Left);
                }
                else if (event.key === 'ArrowDown') {
                    game.processInput(inputdirection_2.InputDirection.Down);
                }
            };
        }
    }
    exports.KeyListener = KeyListener;
});
define("ts/game/touchlistener", ["require", "exports", "ts/game/inputdirection"], function (require, exports, inputdirection_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TouchListener = void 0;
    class TouchListener {
        constructor(game) {
            this.game = game;
            this.MINIMUM_SWIPE_THRESHOLD_SQUARED = 10 * 10;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            document.addEventListener('touchstart', event => {
                this.touchStartX = event.changedTouches[0].screenX;
                this.touchStartY = event.changedTouches[0].screenY;
            }, false);
            document.addEventListener('touchend', event => {
                this.touchEndX = event.changedTouches[0].screenX;
                this.touchEndY = event.changedTouches[0].screenY;
                this.handleGesture();
            }, false);
        }
        handleGesture() {
            const x1 = this.touchStartX;
            const x2 = this.touchEndX;
            const y1 = this.touchStartY;
            const y2 = this.touchEndY;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const squareDistance = dx * dx + dy * dy;
            if (squareDistance < this.MINIMUM_SWIPE_THRESHOLD_SQUARED) {
                // Tap
            }
            else if (dx === 0) {
                if (dy > 0) {
                    this.game.processInput(inputdirection_3.InputDirection.Up);
                }
                else {
                    this.game.processInput(inputdirection_3.InputDirection.Down);
                }
            }
            else {
                const slope = dy / dx;
                if (slope > -1 && slope <= 1) {
                    if (dx > 0) {
                        this.game.processInput(inputdirection_3.InputDirection.Right);
                    }
                    else {
                        this.game.processInput(inputdirection_3.InputDirection.Left);
                    }
                }
                else {
                    if (dy < 0) {
                        this.game.processInput(inputdirection_3.InputDirection.Up);
                    }
                    else {
                        this.game.processInput(inputdirection_3.InputDirection.Down);
                    }
                }
            }
        }
    }
    exports.TouchListener = TouchListener;
});
define("ts/game/2048game", ["require", "exports", "ts/model/grid", "ts/render/gridview", "ts/game/gamecontrol", "ts/game/gridcontrol", "ts/game/keylistener", "ts/game/touchlistener"], function (require, exports, grid_1, gridview_1, gamecontrol_1, gridcontrol_1, keylistener_1, touchlistener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TwentyFourtyEightGame = void 0;
    class TwentyFourtyEightGame {
        constructor(element) {
            const gridElement = document.createElement('div');
            gridElement.classList.add('grid');
            element.appendChild(gridElement);
            /* eslint-disable no-unused-vars */
            const grid = new grid_1.Grid(4, 4);
            const gridControl = new gridcontrol_1.GridControl(grid);
            const gridView = new gridview_1.GridView(gridElement, grid);
            const gameControl = new gamecontrol_1.GameControl(gridControl, gridView);
            const keyListener = new keylistener_1.KeyListener(gameControl);
            const touchListener = new touchlistener_1.TouchListener(gameControl);
            /* eslint-enable no-unused-vars */
        }
    }
    exports.TwentyFourtyEightGame = TwentyFourtyEightGame;
});
define("ts/index", ["require", "exports", "ts/game/2048game"], function (require, exports, _2048game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    window.addEventListener('load', () => {
        const body = document.querySelector('body');
        if (body) {
            // eslint-disable-next-line no-unused-vars
            const game = new _2048game_1.TwentyFourtyEightGame(body);
        }
        else {
            console.error('No DOM body detected!');
        }
    });
});
//# sourceMappingURL=2048.js.map