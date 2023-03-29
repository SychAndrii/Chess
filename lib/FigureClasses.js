import { ROWS, COLS } from "./BoardAttributes";
import { ElephantValidator, FigureValidator, QueenValidator, SoldierValidator, TowerValidator } from "./FigurePathValidators";

export class FigureBase {
    constructor(color, cellRow, cellCol) {
        this.color = color;
        this.cellRow = cellRow;
        this.cellCol = cellCol;
    }

    copy() {
        return new this.constructor(this.color,
            this.cellRow, 
            this.cellCol);
    }

    getSVGPath() {
        const figureClassNameLower = this.constructor.name.toLowerCase();
        return `/figures/${this.color}_${figureClassNameLower}.svg`;
    }

    getPossibleMoves() {
        throw new Error('FigureBase is an abstract class. You have to implement it!');
    }

    getValidMoves(gameBoard) {
        throw new Error('FigureBase is an abstract class. You have to implement it!');
    }
}

export class Horse extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        return [{
            row: this.cellRow + 2,
            col: this.cellCol - 1
        },
        {
            row: this.cellRow + 2,
            col: this.cellCol + 1
        },
        {
            row: this.cellRow - 2,
            col: this.cellCol - 1
        },
        {
            row: this.cellRow - 2,
            col: this.cellCol + 1
        },
        {
            row: this.cellRow - 1,
            col: this.cellCol + 2
        },
        {
            row: this.cellRow + 1,
            col: this.cellCol + 2
        },
        {
            row: this.cellRow + 1,
            col: this.cellCol - 2
        },
        {
            row: this.cellRow - 1,
            col: this.cellCol - 2
        }];

    }

    getValidMoves(gameBoard) {
        return new FigureValidator(this, gameBoard).getValidMoves();
    }
}

export class Elephant extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        const possibleMoves = [];
        for (let col = this.cellCol + 1, row = this.cellRow + 1; col < COLS && row < ROWS; ++col, ++row) {
            possibleMoves.push({
                row,
                col
            });
        }
        for (let col = this.cellCol - 1, row = this.cellRow + 1; col >= 0 && row < ROWS; --col, ++row) {
            possibleMoves.push({
                row,
                col
            });
        }
        for (let col = this.cellCol - 1, row = this.cellRow - 1; col >= 0 && row >= 0; --col, --row) {
            possibleMoves.push({
                row,
                col
            });
        }
        for (let col = this.cellCol + 1, row = this.cellRow - 1; col < COLS && row >= 0; ++col, --row) {
            possibleMoves.push({
                row,
                col
            });
        }
        return possibleMoves;
    }

    getValidMoves(gameBoard) {
        return new ElephantValidator(this, gameBoard).getValidMoves();
    }
}

export class King extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        return [
            {
                row: this.cellRow + 1,
                col: this.cellCol + 1
            },
            {
                row: this.cellRow + 1,
                col: this.cellCol
            },
            {
                row: this.cellRow + 1,
                col: this.cellCol - 1
            },
            {
                row: this.cellRow,
                col: this.cellCol + 1
            },
            {
                row: this.cellRow,
                col: this.cellCol - 1
            },
            {
                row: this.cellRow - 1,
                col: this.cellCol + 1
            },
            {
                row: this.cellRow - 1,
                col: this.cellCol
            },
            {
                row: this.cellRow - 1,
                col: this.cellCol - 1
            }
        ];
    }

    getValidMoves(gameBoard) {
        return new FigureValidator(this, gameBoard).getValidMoves();
    }
}

export class Tower extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        const possibleMoves = [];

        for (let col = this.cellCol - 1, row = this.cellRow; col >= 0; --col) {
            possibleMoves.push({
                row,
                col
            })
        }
        for (let col = this.cellCol + 1, row = this.cellRow; col < COLS; ++col) {
            possibleMoves.push({
                row,
                col
            })
        }
        for (let col = this.cellCol, row = this.cellRow - 1; row >= 0; --row) {
            possibleMoves.push({
                row,
                col
            })
        }
        for (let col = this.cellCol, row = this.cellRow + 1; row < ROWS; ++row) {
            possibleMoves.push({
                row,
                col
            })
        }

        return possibleMoves;
    }

    getValidMoves(gameBoard) {
        return new TowerValidator(this, gameBoard).getValidMoves();
    }
}

export class Queen extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        const elephant = new Elephant(this.color, this.cellRow, this.cellCol);
        const tower = new Tower(this.color, this.cellRow, this.cellCol);
        return [...elephant.getPossibleMoves(), ...tower.getPossibleMoves()];
    }

    getValidMoves(gameBoard) {
        return new QueenValidator(this, gameBoard).getValidMoves();
    }
}

export class Soldier extends FigureBase {
    constructor(color, cellRow, cellCol) {
        super(color, cellRow, cellCol);
    }

    getPossibleMoves() {
        const possibleMoves = [{
            row: this.cellRow + 1,
            col: this.cellCol
        },
        {
            row: this.cellRow + 1,
            col: this.cellCol + 1
        },
        {
            row: this.cellRow + 1,
            col: this.cellCol - 1
        },
        {
            row: this.cellRow + 2,
            col: this.cellCol
        },
        {
            row: this.cellRow - 2,
            col: this.cellCol
        },
        {
            row: this.cellRow - 1,
            col: this.cellCol - 1
        },
        {
            row: this.cellRow - 1,
            col: this.cellCol + 1
        },
        {
            row: this.cellRow - 1,
            col: this.cellCol
        }];

        return possibleMoves;
    }

    getValidMoves(gameBoard) {
        return new SoldierValidator(this, gameBoard).getValidMoves();
    }
}