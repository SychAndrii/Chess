import React, {useRef} from 'react';
import { Col } from 'react-bootstrap';
import styles from '@/styles/Board.module.css';

import { FigureBase } from '@/lib/FigureClasses';
import Walkable from '@/lib/Walkable';
import WalkableFigure from '@/lib/WalkableFigure';

import EmptyCellBody from './CellBodyComponents/EmptyCellBody';
import FigureCellBody from './CellBodyComponents/FigureCellBody';
import WalkableEmptyCellBody from './CellBodyComponents/WalkableEmptyCellBody';
import WalkableFigureCellBody from './CellBodyComponents/WalkableFigureCellBody';

export default function BoardCell({ rowIndex, colIndex, entity }) {
    const cellColorClass = getCellColor();
    const cellBodyRef = useRef(null);

    let child = <EmptyCellBody ref={cellBodyRef} />;
    
    if(cellContainsFigure()) {
        child = <FigureCellBody ref={cellBodyRef} getCellCoords={getCellCoords} figureObject={entity} />
    }
    else if(cellContainsMoveIcon()) {
        child = <WalkableEmptyCellBody getCellCoords={getCellCoords} ref={cellBodyRef} />
    }
    else if(cellContainsFigureMoveIcon()) {
        child = <WalkableFigureCellBody getCellCoords={getCellCoords} ref={cellBodyRef} figureObject={entity.figure} />
    }

    return (
        <Col onClick={(cellClicked)} className={`${styles.board_cell} ${styles[cellColorClass]} d-flex justify-content-center align-items-center`}>
            {
                child
            }
        </Col>
    )

    function cellClicked() {
        cellBodyRef.current.callback();
    }

    function cellContainsMoveIcon() {
        return entity instanceof Walkable;
    }

    function cellContainsFigure() {
        return entity instanceof FigureBase;
    }

    function cellContainsFigureMoveIcon() {
        return entity instanceof WalkableFigure;
    }

    function getCellColor() {
        const cell_color_class = (rowIndex % 2 == 0 && colIndex % 2 != 0 ||
            rowIndex % 2 != 0 && colIndex % 2 == 0)
            ? 'dark_cell' : 'light_cell';
        return cell_color_class;
    }

    function getCellCoords() {
        return {
            row: rowIndex,
            col: colIndex
        }
    }
}