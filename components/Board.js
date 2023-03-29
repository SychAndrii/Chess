import { Container, Row, Col } from 'react-bootstrap'
import BoardCell from './BoardCell';
import styles from '@/styles/Board.module.css'
import { useState, useEffect } from 'react';
import { gameBoardAtom, selectedFigureAtom, eatHistoryAtom } from '@/appState';
import { useAtom } from 'jotai';
import { ROWS, COLS } from '@/lib/BoardAttributes';
import Walkable from '@/lib/Walkable';
import WalkableFigure from '@/lib/WalkableFigure';

export default function Board() {
    const [boardFigures, setBoardFigures] = useAtom(gameBoardAtom);
    const [selectedFigure, setSelectedFigure] = useAtom(selectedFigureAtom);
    const [board, setBoard] = useState([]);
    const [eatHistory, setEatHistory] = useAtom(eatHistoryAtom);

    console.log(eatHistory);
    useEffect(() => {
        function createBoardCellNumbers() {
            const newBoard = [];
            for (let i = 0; i < ROWS; ++i) {
                newBoard.push([]);
                for (let j = 0; j < COLS; ++j) {
                    newBoard[i].push(j);
                }
            }
            setBoard(newBoard);
        }

        createBoardCellNumbers();
    }, []);

    let rowCounter = 0;

    if (!board) {
        return <p>Loading...</p>
    }

    return (
        <Container fluid className={`${styles.board}`}>
            {
                board.map((row, rowIndex) => {
                    return (
                        <Row key={rowCounter++}>
                            {
                                row.map((cell, cellIndex) => {
                                    return (
                                        <BoardCell key={cellIndex} entity={getEntityAt(boardFigures, rowIndex, cellIndex)} rowIndex={rowIndex} colIndex={cellIndex} />
                                    )
                                })
                            }
                        </Row>
                    );
                })
            }
        </Container>
    )
}

export function getEntityAt(boardFigures, rowIndex, colIndex) {
    return boardFigures[rowIndex + '-' + colIndex];
}

export function removeOldWalkables(newBoard, previousBoard) {
    for (const cell in newBoard) {
        const currentCellEntity = previousBoard[cell];

        const isWalkableFigure = currentCellEntity instanceof WalkableFigure;
        const isWalkable = currentCellEntity instanceof Walkable;

        if (isWalkable)
            newBoard[cell] = undefined;
        else if (isWalkableFigure)
            newBoard[cell] = previousBoard[cell].figure;
    }
}

export function addNewWalkables(newBoard, possibleMoves) {
    for (const move of possibleMoves) {
        const position_string = `${move.row}-${move.col}`;

        const currentCellEntity = getEntityAt(newBoard, move.row, move.col);
        const isEnemy = currentCellEntity != undefined;

        if (isEnemy)
            newBoard[position_string] = new WalkableFigure(currentCellEntity);
        else
            newBoard[position_string] = new Walkable();
    }
}

export function moveFigure(newBoard, previousBoard, fromCoords, toCoords, selectedFigure, setSelectedFigure) {
    const movedFigure = selectedFigure.copy(); 
    movedFigure.cellRow = toCoords.row;
    movedFigure.cellCol = toCoords.col;

    removeOldWalkables(newBoard, previousBoard);
    newBoard[`${fromCoords.row}-${fromCoords.col}`] = undefined;
    newBoard[`${toCoords.row}-${toCoords.col}`] = movedFigure;
    setSelectedFigure(movedFigure);
}