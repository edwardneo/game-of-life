const rows = 20; // Alter number of rows here
const cols = 50; // Alter number of columns here

let grid = Array(rows).fill().map(() => Array(cols).fill(false));
let gameLoop = undefined;
let memory = [];

let running = false;

$(document).ready(function() { // Set up board
	// Add cells
	const cellSize = $('#board').width()/cols;

	for(i=0; i<rows; i++) {
		// Create a row
		let row = jQuery('<div/>', {
			'class': 'row',
		});

		row.appendTo('#board');

		for(j=0; j<cols; j++) {
			// Create a cell
			let cell = jQuery('<div/>', {
				'class': 'col border border-dark cell dead',
				'id': `cell-${i}-${j}`, // Unique ID
				height: `${cellSize}px`,
			});
		
			cell.appendTo(row);
		}
	}

	// Bind toggle state on click
	for (let cell of $('.cell')) {
		cell.addEventListener('click', () => {
			if(running) return; // Prevent toggling cells when running

			// Toggle cell visually
			if(cell.classList.contains('live')) {
				cell.classList.remove('live');
				cell.classList.add('dead');
			} else if(cell.classList.contains('dead')) {
				cell.classList.remove('dead');
				cell.classList.add('live');
			} else {
				console.error('Cell lacks status class.');
				return;
			}

			// Change state in backend grid
			let coords = [cell.id.split('-')[1].toString(), cell.id.split('-')[2].toString()];
			grid[coords[0]][coords[1]] = !grid[coords[0]][coords[1]];

			// Reset memory
			memory = [];
		});
	}
}, false);

$('#start-stop').bind('click', () => { // For Start/Stop button – Starts/Stops the game
	running = !running; // Toggle running state

	// Toggle button visually
	if($('#start-stop').hasClass('btn-primary')) {
		$('#start-stop').html('Stop')
			.removeClass('btn-primary')
			.addClass('btn-danger');
	} else if ($('#start-stop').hasClass('btn-danger')) {
		$('#start-stop').html('Start')
			.removeClass('btn-danger')
			.addClass('btn-primary');
	} else {
		console.error('Button lacks color class.');
		return;
	}

	// Start or stop game loop
	if(running) {
		gameLoop = setInterval(() => {
			stepForward();
		}, 1000/$('#fps').val());
	} else {
		clearInterval(gameLoop);
	}
});

$('#forward').bind('click', () => { // For Forward button – Steps the game forward one tick
	if(!running) {
		stepForward();
	}
}); 

$('#backward').bind('click', () => { // For Backward button – Steps the game backward one tick if possible
	if(!running) {
		if(memory.length != 0) {
			grid = memory.pop();
			displayGrid();
		}
	}
});

$('#clear').bind('click', () => { // For Clear button – Resets the grid and memory and clears the board
	if(!running) {
		grid = Array(rows).fill().map(() => Array(cols).fill(false));
		memory = [];
		clearBoard();
	}
});

function stepForward() { // Steps the game forward one tick
	memory.push(grid); // Add current board to memory

	let newGrid = Array(rows).fill().map(() => Array(cols).fill(false));
	let life = [];

	for(r=0; r<rows; r++) {
		for(c=0; c<cols; c++) {
			// Count the number of neighbors for a given cell
			let neighbors = 0;
			for(dr of [-1, 0, 1]) {
				for(dc of [-1, 0, 1]) {
					if(0 <= r+dr && r+dr < rows && 0 <= c+dc && c+dc < cols && dr*dc+dr+dc != 0 && grid[r+dr][c+dc]) {
						neighbors++;
					}
				}
			}

			// Store if cell is to be turned on
			if((grid[r][c] && 2 <= neighbors && neighbors <= 3) || (!grid[r][c] && neighbors == 3)) {
				newGrid[r][c] = true;
				life.push([r, c]);
			}
		}
	}

	grid = newGrid; // Update the backend grid

	displayChanges(life); // Displace the grid given what cells should be live
}

function displayGrid() { // Display the current grid
	clearBoard();

	for(r=0; r<rows; r++) {
		for(c=0; c<cols; c++) {
			if(grid[r][c]) {
				$(`#cell-${r}-${c}`).removeClass('dead');
				$(`#cell-${r}-${c}`).addClass('live');
			}
		}
	}
}

function displayChanges(life) { // Display the live cells specified
	clearBoard();

	for(cell of life) {
		$(`#cell-${cell[0]}-${cell[1]}`).removeClass('dead');
		$(`#cell-${cell[0]}-${cell[1]}`).addClass('live');
	}
}

function clearBoard() { // Clear the board visually
	for(cell of $('.live')) {
		cell.classList.remove('live');
		cell.classList.add('dead');
	}
}