import React, { forwardRef, useImperativeHandle } from 'react'
import Empty from './BodyComponents/Empty';
import Walk from './BodyComponents/Walk';
import Figure from './BodyComponents/Figure';
import { useAtom } from 'jotai';
import { gameBoardAtom, selectedFigureAtom, eatHistoryAtom } from '@/appState';
import { getEntityAt, moveFigure } from '../Board';

function WalkableFigureCellBody({figureObject, getCellCoords}, ref) {
    const [gameBoard, setGameBoard] = useAtom(gameBoardAtom);
    const [selectedFigure, setSelectedFigure] = useAtom(selectedFigureAtom);
    const [eatHistory, setEatHistory] = useAtom(eatHistoryAtom);

    useImperativeHandle(
        ref,
        () => {
            return {
                callback: walkableFigureCellClicked
            }
        }
    );

    return (
        <Empty>
            <Walk />
            <Figure figureObject={figureObject}/>
        </Empty>
    )

    function walkableFigureCellClicked() {
        setGameBoard(previousBoard => {
            const newBoard = {...previousBoard};

            const currentCellCoords = getCellCoords();
            const currentCellEntity = getEntityAt(newBoard, currentCellCoords.row, currentCellCoords.col);

            setEatHistory(previousHistory => {
                const newHistory = {...previousHistory};
                const currentFigureClass = currentCellEntity.figure.constructor.name;
                const selectedFigureTeam = selectedFigure.color;
                newHistory[selectedFigureTeam][currentFigureClass] = newHistory[selectedFigureTeam][currentFigureClass] ? previousHistory[selectedFigureTeam][currentFigureClass] + 1 : 1;

                return newHistory;
            });
            moveFigure(newBoard, previousBoard, {
                row: selectedFigure.cellRow,
                col: selectedFigure.cellCol
            }, currentCellCoords, selectedFigure, setSelectedFigure);

            return newBoard;
        });
    }
}

export default WalkableFigureCellBody = forwardRef(WalkableFigureCellBody);