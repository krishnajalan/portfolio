import React from 'react';
import Snake from 'react-simple-snake'
import './snakeGame.css';

const SnakeGame = () => {
    let width = "1000px";
    return (
        <div className = "snakeGame main">
            <br></br>
            <br></br>
            <br></br>
            <Snake width={width} />
        </div>
    )
}

export default SnakeGame;
