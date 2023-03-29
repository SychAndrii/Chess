import React from 'react'
import styles from '@/styles/Board.module.css'

export default function Empty({ children }) {
    return (
        <div className={`h-100 d-flex align-items-center justify-content-center`}>
            {children}
        </div>
    )
}
