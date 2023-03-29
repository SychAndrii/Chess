import Board from '@/components/Board'
import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import styles from '@/styles/Game.module.css'

export default function Game() {
    return (
        <Container fluid className='mt-5'>
            <Row>
                <Col className={`px-5 ${styles.boardContainer}`}>
                    <Board />
                </Col>
            </Row>
        </Container>
    )
}
