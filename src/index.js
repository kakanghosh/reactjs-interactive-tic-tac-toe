import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
		<span className={props.winner ? 'winner' : ''}>
			{props.value}
		</span>
    </button>
  );
}
  
function Board (props) {

	const renderSquare = (i) => {
		let winner = false;
		if(props.winnerSquares && props.winnerSquares.indexOf(i) !== -1) {
			winner = true;
		}
		return (
		  <Square key={i}
			  value={props.squares[i]}
			  onClick={() => props.onClickHandler(i)}
			  winner={winner}
		  />
		);
	}

	const renderBoardRow  = () => {
		let count = 0;
		return [0, 1, 2].map(i => {
			return (
				<div key={i} className="board-row">
					{[0, 1, 2].map(j => renderSquare(count++))}
				</div>
			);
		});
	}
	
	return (
		<div>
			{renderBoardRow()}
		</div>
	);
}
  
class Game extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            history: [{squares: Array(9).fill(null), player: null, nextPlayer: 'X', row: null, col: null, createdAt: new Date()}],
			step: {row: null, col: null},
			historySortedBy: 'ASC'
        };
	}
	
	calculateWinner(squares) {
		const positions = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for(let i = 0; i < positions.length; ++i) {
			const [a, b, c] = positions[i];
			if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
				return {player: squares[a], position: positions[i]};
			}
		}
		return null;
	}

	onClickHandler(index) {

		let history;
		if (this.state.historySortedBy === 'ASC') {
			history = this.state.history.slice(0, this.getHistoryPositionByStep(this.state.step)+1);
		} else {
			history = this.state.history.slice(this.getHistoryPositionByStep(this.state.step), this.state.history.length);
		}
		const historyOfStep = this.getRecentHistoryByStepNumber(this.state.step);
		const squares = historyOfStep.squares.slice();
		if(this.calculateWinner(squares) || squares[index]) {
			return;
		}
		squares[index] = historyOfStep.nextPlayer;
		const rowCol = this.getRowCol(index + 1);
		const newHistory = this.getNewHistory(squares, squares[index], rowCol);
		let newStateHistory;
		if (this.state.historySortedBy === 'ASC') {
			newStateHistory = history.concat(newHistory);
		} else {
			history.splice(0, 0, newHistory);
			newStateHistory = history;
		}

		this.setState({
			history: newStateHistory,
			step: rowCol
		});
	}

	getNewHistory(squares, player, rowCol) {
		return {
			squares: squares,
			player: player,
			row: rowCol.row,
			col: rowCol.col,
			createdAt: new Date(),
			nextPlayer: player === 'X' ? 'O' : 'X'
		}
	}

	getRowCol(index) {
		const box = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
		for(let i = 0; i < box.length; ++i) {
			const [a, b, c] = box[i];
			if (a === index) return {row: i + 1, col: a % 3 === 0 ? 3: a % 3};
			if (b === index) return {row: i + 1, col: b % 3 === 0 ? 3: b % 3};
			if (c === index) return {row: i + 1, col: c % 3 === 0 ? 3: c % 3};
		}
	}

	getRecentHistoryByStepNumber(step) {
		return this.state.history.find(history => history.row === step.row && history.col === step.col);
	}

	getHistoryPositionByStep(step) {
		for(let i = 0; i < this.state.history.length; ++i) {
			const history = this.state.history[i];
			if(history.row === step.row && history.col === step.col) {
				return i;
			}
		}
	}

	backToMove(historyStep) {
		this.setState({
			step: historyStep
		})
	}

	getMoves() {
		const {history} = this.state;

		return history.map((step, move) => {
			const description = step.player ? `Go to move #${move} (${step.row},${step.col})` : 'Back to the Game';
			const historyStep = {row: step.row, col: step.col};
			
			const checkStepWithGameStep = (step) => {
				return step.row  === this.state.step.row && step.col === this.state.step.col;
			}

			return (
				<li key={move}>
					<button className={ checkStepWithGameStep(historyStep) ? 'selected-move' : ''}
						onClick={() => this.backToMove(historyStep)}>
						{description}
					</button>
				</li>
			);
		});
	}

	sortHistoryByASC = () => {
		const history = this.state.history.slice();
		history.sort(function(a,b) {
			var key1 = a.createdAt;
			var key2 = b.createdAt;

			if (key1 < key2) {
				return -1;
			} else if (key1 === key2) {
				return 0;
			} else {
				return 1;
			}
		});
		this.setState({
			history: history,
			historySortedBy: 'ASC'
		});
	}

	sortHistoryByDESC = () => {
		const history = this.state.history.slice();
		history.sort(function(a,b) {
			var key1 = a.createdAt;
			var key2 = b.createdAt;

			if (key1 > key2) {
				return -1;
			} else if (key1 === key2) {
				return 0;
			} else {
				return 1;
			}
		});
		this.setState({
			history: history,
			historySortedBy: 'DESC'
		});
	}

    render() {
		const moves = this.getMoves();
		const history = this.getRecentHistoryByStepNumber(this.state.step);
		const winner = this.calculateWinner(history.squares);
		let status;
		if (winner)  {
			status = 'Winner is: ' + winner.player;
		} else if (history.squares.indexOf(null) === -1) {
			status = 'Board is DRAW';
		} else {
			status = 'Next player: '.concat(history.nextPlayer);
		}
      	return (
        	<div className="game">
				<div className="game-board">
					<Board 
						squares={history.squares}
						onClickHandler={(index) => this.onClickHandler(index)}
						winnerSquares={winner ? winner.position : null}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<div>
						<button className={ this.state.historySortedBy === 'ASC' ? 'selected-move' : ''} onClick={this.sortHistoryByASC}>
							Sort Moves ASC
						</button>
						<button className={ this.state.historySortedBy === 'DESC' ? 'selected-move' : ''} onClick={this.sortHistoryByDESC}>
							Sort Moves DESC
						</button>
					</div>
					<ol>{moves}</ol>
				</div>
        	</div>
      	);
    }
}
  
  // ========================================
  
ReactDOM.render(
	<Game />,
	document.getElementById('root')
);
