import React, { useImperativeHandle, forwardRef } from 'react';
import { useAtom } from 'jotai';
import { gameBoardAtom, selectedFigureAtom } from '@/appState';
import { removeOldWalkables, addNewWalkables } from '../Board';
import Empty from './BodyComponents/Empty';
import Figure from './BodyComponents/Figure';

function FigureCellBody({ figureObject, getCellCoords }, ref) {
  const [gameBoard, setGameBoard] = useAtom(gameBoardAtom);
  const [selectedFigure, setSelectedFigure] = useAtom(selectedFigureAtom);

  useImperativeHandle(
    ref,
    () => {
      return {
        callback: showPossiblePaths
      }
    }
  );

  return (
    <Empty>
      <Figure figureObject={figureObject} />
    </Empty>
  );

  function showPossiblePaths() {
    const parentCellCoords = getCellCoords();
    const cellRow = parentCellCoords.row;
    const cellCol = parentCellCoords.col;
    const possibleMoves = figureObject.getValidMoves(gameBoard, cellRow, cellCol);

    setGameBoard(previousBoard => {
      const hasFigureSelected = selectedFigure != null;
      const newBoard = { ...previousBoard };

      if(hasFigureSelected) {
        removeOldWalkables(newBoard, previousBoard);
      }
      addNewWalkables(newBoard, possibleMoves);

      return newBoard;
    });
    setSelectedFigure(figureObject);
  }
}

export default forwardRef(FigureCellBody);