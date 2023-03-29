import React from 'react'
import styles from '@/styles/Board.module.css'

export default function Figure({figureObject}) {
  return (
    <img src={figureObject.getSVGPath()} className={`mh-100 w-100`} alt="Figure" />
  )
}
