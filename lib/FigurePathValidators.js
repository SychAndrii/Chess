import { ROWS, COLS } from "./BoardAttributes";
import { getEntityAt } from "@/components/Board";
import { FigureBase } from "./FigureClasses";
import FigureColor from "./FigureColor";
import WalkableFigure from "./WalkableFigure";
import Walkable from "./Walkable";
import { Atom } from "jotai";

/**
 * Base figure moves validator, that ensures moves to be within game board coordinates and not 
 * target figures on the same team.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
export class FigureValidator {
    constructor(figure, gameBoard) {
        this.figure = figure;
        this.gameBoard = gameBoard;
    }

    /**
     * Ensures that posssible moves of figure are within board and not targeting the allies.
     * 
     * @returns {Array} {row: , col: } objects which represent valid moves.
     */
    getValidMoves() {
        return this.figure.getPossibleMoves(this.figure.cellRow, this.figure.cellCol)
            .filter(move => this.isWithinBoardEdges(move))
            .filter(move => !this.containsFriendFigure(move));
    }

    /**
     * Ensures that move is not targeting an ally.
     * 
     * @param {Object} move {row: , col: } object, which represents a single move.
     * @returns {Boolean} true, if targets an ally.
     */
    containsFriendFigure(move) {
        const currentEntity = getEntityAt(this.gameBoard, move.row, move.col);
        return currentEntity instanceof FigureBase && currentEntity.color == this.figure.color;
    }

    /**
     * Ensures that move is within gameBoard borders defined in @lib/BoardAttributes.js.
     * 
     * @param {Object} move {row: , col: } object, which represents a single move.
     * @returns {Boolean} true, if within borders.
     */
    isWithinBoardEdges(move) {
        return move.row >= 0 && move.row < ROWS && move.col >= 0 && move.col < COLS
    }
}

/**
 * Validator for figures, that display their moves in lines - line of rows or (and) line of columns.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
class LineValidator extends FigureValidator {
    constructor(figure, gameBoard) {
        super(figure, gameBoard);
    }

    /**
     * Checks that currentCell contains an enemy (can be either a walkable figure or figure).
     * 
     * @param {Object} currentCell {row: , col: } object, which represents a single move.
     * @returns {Boolean} true if currentCell contains an enemy figure.
     */
    encounteredEnemy(currentCell) {
        const currentCellEntity = getEntityAt(this.gameBoard, currentCell.row, currentCell.col);
        const entityIsEnemy = (currentCellEntity instanceof FigureBase && currentCellEntity.color != this.figure.color)
            || (currentCellEntity instanceof WalkableFigure && currentCellEntity.figure.color != this.figure.color);
        return entityIsEnemy;
    }
}

/**
 * Validator for Tower.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
export class TowerValidator extends LineValidator {
    constructor(figure, gameBoard) {
        super(figure, gameBoard);
    }

    /**
     * Gets all the valid moves on the right side of figure.
     * 
     * @param {Array} {row: , col: } objects, which represent moves sorted by columns. We need a column sorted array to ensure that our paths are in lines.
     * @returns {Array} {row: , col: } objects, which represent valid moves on the right side.
     */
    rightColumnMoves(columnSortedMoves) {
        const res = [];
        let index;
        if ((index = columnSortedMoves.findIndex(cell => cell.col - 1 == this.figure.cellCol && cell.row == this.figure.cellRow)) != -1) {
            let currentCell = columnSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index >= 0 && previousCol + 1 == currentCell.col && previousRow == currentCell.row) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = columnSortedMoves[--index];
            }
        }
        return res;
    }

    /**
     * Gets all the valid moves on the left side of figure.
     * 
     * @param {Array} {row: , col: } objects, which represent moves sorted by columns. We need a column sorted array to ensure that our paths are in lines.
     * @returns {Array} {row: , col: } objects, which represent valid moves on the left side.
     */
    leftColumnMoves(columnSortedMoves) {
        const res = [];
        let index;

        if ((index = columnSortedMoves.findIndex(cell => cell.col + 1 == this.figure.cellCol && cell.row == this.figure.cellRow)) != -1) {
            let currentCell = columnSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < columnSortedMoves.length && previousCol - 1 == currentCell.col && previousRow == currentCell.row) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = columnSortedMoves[++index];
            }
        }

        return res;
    }

    /**
     * Gets all valid moves on the x axis.
     * 
     * @param {Array} {row: , col: } objects, which have been validated by the parent class (LineValidator).
     * @returns {Array} {row: , col: } objects, which represent valid moves on the left and right sides.
     */
    x_axisMoves(parentValidMoves) {
        const columnSortedMoves = [...parentValidMoves].sort((cell1, cell2) => {
            if (cell1.row !== cell2.row) {
                return cell1.row - cell2.row;
            } else {
                return cell2.col - cell1.col;
            }
        });

        return [...this.rightColumnMoves(columnSortedMoves),
        ...this.leftColumnMoves(columnSortedMoves)];
    }

    /**
     * Ensures that the usage of this class is not broken by Queen class.
     * 
     * @param {Array} {row: , col: } objects, which represent moves sorted by rows. We need a row sorted array to ensure that our paths are in lines.
     * @returns {Array} {row: , col: } objects, which represent moves, valid only for Tower.
     */
    queenProtection(allValidMovesRows) {
        let validMovesTopRows = [];

        allValidMovesRows.forEach(cell => {
            const sameRowMoves = allValidMovesRows.filter(move => cell.row == move.row);
            const towerColumnMove = sameRowMoves.find(move => move.col == this.figure.cellCol);
            if (towerColumnMove != undefined &&
                validMovesTopRows.find(move =>
                    move.row == towerColumnMove.row
                    && move.col == towerColumnMove.col) == undefined) {
                validMovesTopRows.push(towerColumnMove);
            }
        });

        return validMovesTopRows;
    }

    /**
     * Gets all the valid moves on the top side of figure.
     * 
     * @param {Array} {row: , col: } objects, which represent valid moves obtained from the parent class (LineValidator).
     * @returns {Array} {row: , col: } objects, which represent valid moves on the top side.
     */
    topRowMoves(parentValidMoves) {
        let index;
        const res = [];

        const allValidMovesTopRows = parentValidMoves.sort((cell1, cell2) => {
            if (cell1.row !== cell2.row) {
                return cell2.row - cell1.row;
            } else {
                return cell1.col - cell2.col;
            }
        });

        const validMovesTopRows = this.queenProtection(allValidMovesTopRows);

        if ((index = validMovesTopRows.findIndex(cell => cell.col == this.figure.cellCol && cell.row + 1 == this.figure.cellRow)) != -1) {
            let currentCell = validMovesTopRows[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < validMovesTopRows.length && previousRow - 1 == currentCell.row && previousCol == currentCell.col) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = validMovesTopRows[++index];
            }
        }

        return res;
    }

    /**
     * Gets all the valid moves on the bottom side of figure.
     * 
     * @param {Array} {row: , col: } objects, which represent valid moves obtained from the parent class (LineValidator).
     * @returns {Array} {row: , col: } objects, which represent valid moves on the bottom side.
     */
    bottomRowMoves(parentValidMoves) {
        const res = [];
        let index;

        const allValidMovesBottomRows = parentValidMoves.sort((cell1, cell2) => {
            if (cell1.row !== cell2.row) {
                return cell1.row - cell2.row;
            } else {
                return cell2.col - cell1.col;
            }
        });

        const validMovesBottomRows = this.queenProtection(allValidMovesBottomRows);

        if ((index = validMovesBottomRows.findIndex(cell => cell.col == this.figure.cellCol && cell.row - 1 == this.figure.cellRow)) != -1) {
            let currentCell = validMovesBottomRows[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < validMovesBottomRows.length && previousRow + 1 == currentCell.row && previousCol == currentCell.col) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = validMovesBottomRows[++index];
            }
        }

        return res;
    }

    /**
     * Gets all valid moves on the y axis.
     * 
     * @param {Array} {row: , col: } objects, which have been validated by the parent class (LineValidator).
     * @returns {Array} {row: , col: } objects, which represent valid moves on the top and bottom sides.
     */
    y_axisMoves(parentValidMoves) {
        return [...this.topRowMoves(parentValidMoves),
        ...this.bottomRowMoves(parentValidMoves)];
    }

    /**
     * Gets all valid moves for current tower object.
     * 
     * @returns {Array} {row: , col: } objects, which represent valid moves for the tower.
     */
    getValidMoves() {
        const parentValidMoves = super.getValidMoves();
        return [...this.x_axisMoves(parentValidMoves),
        ...this.y_axisMoves(parentValidMoves)];
    }
}

/**
 * Validator for Elephant.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
export class ElephantValidator extends LineValidator {
    constructor(figure, gameBoard) {
        super(figure, gameBoard);
    }

    /**
     * Gets all the valid moves on the upper right side of figure.
     * 
     * @param {Array} rightUpperSortedMoves {row: , col: } objects, which represent valid moves obtained from the parent class (LineValidator).
     * @returns {Array} {row: , col: } objects, which represent valid moves on the bottom side.
     */
    upperRightMoves(rightUpperSortedMoves) {
        const res = [];
        let index;

        if ((index = rightUpperSortedMoves.findIndex(cell => cell.col - 1 == this.figure.cellCol && cell.row + 1 == this.figure.cellRow)) != -1) {
            let currentCell = rightUpperSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < rightUpperSortedMoves.length && previousCol + 1 == currentCell.col && previousRow == currentCell.row + 1) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = rightUpperSortedMoves[++index];
            }
        }
        return res;
    }

    upperLeftMoves(leftUpperSortedMoves) {
        const res = [];
        let index;

        if ((index = leftUpperSortedMoves.findIndex(cell => cell.col + 1 == this.figure.cellCol && cell.row + 1 == this.figure.cellRow)) != -1) {
            let currentCell = leftUpperSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < leftUpperSortedMoves.length && previousCol - 1 == currentCell.col && previousRow == currentCell.row + 1) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = leftUpperSortedMoves[++index];
            }
        }
        return res;
    }

    upperMoves(parentValidMoves) {
        const leftUpperSorted = [...parentValidMoves]
            .filter(cell => cell.row < this.figure.cellRow
                && cell.col < this.figure.cellCol)
            .sort((cell1, cell2) => {
                if (cell1.row !== cell2.row) {
                    return cell2.row - cell1.row;
                } else {
                    return cell1.col - cell2.col;
                }
            });

        const rightUpperSorted = [...parentValidMoves]
            .filter(cell => cell.row < this.figure.cellRow
                && cell.col > this.figure.cellCol)
            .sort((cell1, cell2) => {
                if (cell1.row !== cell2.row) {
                    return cell2.row - cell1.row;
                } else {
                    return cell1.col - cell2.col;
                }
            });

        return [...this.upperLeftMoves(leftUpperSorted),
        ...this.upperRightMoves(rightUpperSorted)];
    }

    bottomLeftMoves(leftBottomSortedMoves) {
        let index;
        const res = [];

        if ((index = leftBottomSortedMoves.findIndex(cell => cell.col + 1 == this.figure.cellCol && cell.row - 1 == this.figure.cellRow)) != -1) {
            let currentCell = leftBottomSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < leftBottomSortedMoves.length && previousRow + 1 == currentCell.row && previousCol - 1 == currentCell.col) {

                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = leftBottomSortedMoves[++index];
            }
        }

        return res;
    }

    bottomRightMoves(rightBottomSortedMoves) {
        const res = [];
        let index;

        if ((index = rightBottomSortedMoves.findIndex(cell => cell.col - 1 == this.figure.cellCol && cell.row - 1 == this.figure.cellRow)) != -1) {
            let currentCell = rightBottomSortedMoves[index];
            let previousRow = this.figure.cellRow;
            let previousCol = this.figure.cellCol;

            while (index < rightBottomSortedMoves.length && previousRow + 1 == currentCell.row && previousCol + 1 == currentCell.col) {
                res.push(currentCell);
                if (this.encounteredEnemy(currentCell))
                    break;

                previousRow = currentCell.row;
                previousCol = currentCell.col;
                currentCell = rightBottomSortedMoves[++index];
            }
        }
        return res;
    }

    bottomMoves(parentValidMoves) {
        const leftBottomSorted = [...parentValidMoves]
            .filter(cell => cell.row > this.figure.cellRow
                && cell.col < this.figure.cellCol)
            .sort((cell1, cell2) => {
                if (cell1.col !== cell2.col) {
                    return cell2.col - cell1.col;
                } else {
                    return cell1.row - cell2.row;
                }
            });

        const rightBottomSorted = [...parentValidMoves]
            .filter(cell => cell.row > this.figure.cellRow
                && cell.col > this.figure.cellCol)
            .sort((cell1, cell2) => {
                if (cell1.row !== cell2.row) {
                    return cell1.row - cell2.row;
                } else {
                    return cell1.col - cell2.col;
                }
            });

        return [...this.bottomLeftMoves(leftBottomSorted),
        ...this.bottomRightMoves(rightBottomSorted)];
    }

    getValidMoves() {
        const parentValidMoves = super.getValidMoves();
        return [...this.upperMoves(parentValidMoves),
        ...this.bottomMoves(parentValidMoves)];
    }
}

/**
 * Validator for Queen.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
export class QueenValidator extends FigureValidator {
    constructor(figure, gameBoard) {
        super(figure, gameBoard);
    }

    getValidMoves() {
        const elephantValidMoves = new ElephantValidator(this.figure, this.gameBoard).getValidMoves();
        const towerValidMoves = new TowerValidator(this.figure, this.gameBoard).getValidMoves();
        return [...towerValidMoves, ...elephantValidMoves];
    }
}

/**
 * Validator for Soldier.
 *
 * @class
 * @constructor
 * @param {FigureBase} figure - Figure.
 * @param {Atom} gameBoard - gameBoardAtom defined in /appState.js.
 */
export class SoldierValidator extends FigureValidator {
    constructor(figure, gameBoard) {
        super(figure, gameBoard);
    }

    getValidMoves() {
        const res = [];
        const that = this;
        let colorSpecificMoves = [];
        let colorSpecificMultiplier;
        const parentValidMoves = super.getValidMoves();


        if (this.figure.color == FigureColor.DARK) {
            colorSpecificMoves = parentValidMoves.filter(move => move.row > this.figure.cellRow);
            colorSpecificMultiplier = 1;
        }
        else {
            colorSpecificMoves = parentValidMoves.filter(move => move.row < this.figure.cellRow);
            colorSpecificMultiplier = -1;
        }

        const forwardTwoCells = { row: this.figure.cellRow + 2 * colorSpecificMultiplier, col: this.figure.cellCol };
        const forwardOneCell = { row: this.figure.cellRow + 1 * colorSpecificMultiplier, col: this.figure.cellCol };

        if (this.figure.cellRow == ROWS - 2 || this.figure.cellRow == 1) {
            addMoveIfNoEntity(forwardTwoCells.row, forwardTwoCells.col);
        }

        addMoveIfNoEntity(forwardOneCell.row, forwardOneCell.col);
        addMoveIfEnemyEntity(forwardOneCell.row, forwardOneCell.col - 1);
        addMoveIfEnemyEntity(forwardOneCell.row, forwardOneCell.col + 1);
        return res;

        function addMoveIfNoEntity(row, col) {
            const targetCellEntity = getEntityAt(that.gameBoard, row, col);
            if (targetCellEntity == undefined || targetCellEntity instanceof Walkable) {
                const move = colorSpecificMoves.find(move => move.row == row && move.col == col);
                if (move != undefined)
                    res.push(move);
            }
        }

        function addMoveIfEnemyEntity(row, col) {
            const targetCellEntity = getEntityAt(that.gameBoard, row, col);
            if (targetCellEntity != undefined && targetCellEntity.color != that.figure.color)
                res.push(colorSpecificMoves.find(move => move.row == row && move.col == col));
        }
    }
}