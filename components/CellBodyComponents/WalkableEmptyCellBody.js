import React, { forwardRef, useImperativeHandle } from 'react'
import Empty from './BodyComponents/Empty';
import Walk from './BodyComponents/Walk';
import { useAtom } from 'jotai';
import { selectedFigureAtom } from '@/appState';
import { gameBoardAtom } from '@/appState';
import { moveFigure } from '../Board';

function WalkableEmptyCellBody({getCellCoords}, ref) {
    const [gameBoard, setGameBoard] = useAtom(gameBoardAtom);
    const [selectedFigure, setSelectedFigure] = useAtom(selectedFigureAtom);

    useImperativeHandle(
        ref,
        () => {
            return {
                callback: walkableEmptyCellClicked
            }
        }
    );
    return (
        <Empty>
            <Walk />
        </Empty>
    )

    function walkableEmptyCellClicked() {
        setGameBoard(previousBoard => {
            const newBoard = {...previousBoard};

            const currentCellCoords = getCellCoords();
            moveFigure(newBoard, previousBoard, {
                row: selectedFigure.cellRow,
                col: selectedFigure.cellCol
            }, currentCellCoords, selectedFigure, setSelectedFigure);

            return newBoard;
        });
    }
}

export default WalkableEmptyCellBody = forwardRef(WalkableEmptyCellBody);