import { atom } from "jotai";
import { Tower, Horse, Elephant, Queen, King, Soldier } from '@/lib/FigureClasses';
import { COLS, ROWS } from "./lib/BoardAttributes";
import FigureColor from '@/lib/FigureColor';

export const gameBoardAtom = atom(getBoardAtom());
export const selectedFigureAtom = atom(null);
export const eatHistoryAtom = atom({
    [FigureColor.DARK]: {},
    [FigureColor.LIGHT]: {}
});

function getBoardAtom() {
    const board = {
        '0-0': new Tower(FigureColor.DARK, 0, 0),
        '0-1': new Horse(FigureColor.DARK, 0, 1),
        '0-2': new Elephant(FigureColor.DARK, 0, 2),
        '0-3': new King(FigureColor.DARK, 0, 3),
        '0-4': new Queen(FigureColor.DARK, 0, 4),
        '0-5': new Elephant(FigureColor.DARK, 0, 5),
        '5-3': new Horse(FigureColor.DARK, 5, 3),
        '4-6': new Tower(FigureColor.DARK, 4, 6),
        '7-1': new Tower(FigureColor.LIGHT, 7, 1),
        '7-0': new Horse(FigureColor.LIGHT, 7, 0),
        '3-5': new Elephant(FigureColor.LIGHT, 3, 5),
        '0-7': new King(FigureColor.LIGHT, 0, 7),
        '7-4': new Queen(FigureColor.LIGHT, 7, 4),
        '7-6': new Horse(FigureColor.LIGHT, 7, 6),
        '7-7': new Tower(FigureColor.LIGHT, 7, 7),
    };

    placeSoliders();

    return board;

    function placeSoliders() {
        const soliderRows = [{
            rowNumber: 1,
            color: FigureColor.DARK
        },
        {
            rowNumber: 6,
            color: FigureColor.LIGHT
        }];

        for (const { rowNumber, color } of soliderRows) {
            for (let col = 0; col < COLS; ++col) {
                board[rowNumber + '-' + col] = new Soldier(color, rowNumber, col);
            }
        }
    }

    /*
    board.boardStructure = [];

    for (let i = 0; i < ROWS; ++i) {
        board.boardStructure.push([]);
        for (let j = 0; j < COLS; ++j) {
            board.boardStructure[i].push(j);
        }
    }
    */
}