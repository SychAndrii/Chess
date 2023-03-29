import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import Empty from './BodyComponents/Empty';
import { useAtom } from 'jotai';
import { gameBoardAtom, selectedFigureAtom } from '@/appState';
import WalkableFigure from '@/lib/WalkableFigure';
import Walkable from '@/lib/Walkable';
import { removeOldWalkables } from '../Board';

function EmptyCellBody(props, ref) {
  const [gameBoard, setGameBoard] = useAtom(gameBoardAtom);
  const [selectedFigure, setSelectedFigure] = useAtom(selectedFigureAtom);

  useImperativeHandle(
    ref,
    () => {
      return {
        callback: emptyCellClicked
      }
    }
  );

  return (
    <Empty />
  );

  function emptyCellClicked() {
    if (selectedFigure != null) {
      setGameBoard(previousBoard => {
        const newBoard = { ...previousBoard };
        removeOldWalkables(newBoard, previousBoard);
        return newBoard;
      });
    }
  }
}

export default forwardRef(EmptyCellBody);