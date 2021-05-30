let rows = undefined;
let cols = undefined;

let grid = undefined;
let gameLoop = undefined;
let memory = undefined;

let running = false;

$(document).ready(() => { // Set up board
	setDimensions();
}, false);

$(window).resize(() => {
	setDimensions();
	displayGrid();
})

$('#start-stop').click(() => { // For Start/Stop button – Starts/Stops the game
	running = !running; // Toggle running state

	// If running, start game loop
	if(running) {
		start();
		run();
	} else {
		stop();
	}
});

$('#forward').click(() => { // For Forward button – Resets the dimensions if needed and steps the game forward one tick
	redefineGrid();
	stepForward();
}); 

$('#backward').click(() => { // For Backward button – Resets the dimensions if needed and steps the game backward one tick if possible
	redefineGrid();
	if(memory.length != 0) {
		grid = memory.pop();
		displayGrid();
	}
});

$('#clear').click(() => { // For Clear button – Resets the grid and memory and clears the board
	if(running) {
		running = false;
		stop();
	}

	grid = Array(rows).fill().map(() => Array(cols).fill(false));
	memory = [];
	clearBoard();
});

$('#rows').change(() => { // For row range slider – Changes the front-end grid to the new number of rows
	rows = $('#rows').val();
	setDimensions();
	displayGrid();
});

$('#cols').change(() => { // For column range slider – Changes the front-end grid to the new number of columns
	cols = $('#cols').val();
	setDimensions();
	displayGrid();
});

function start() { // Changes the start/stop button to stop, disables the controls, and resets the back-end grid if needed
	$('#start-stop').html('Stop')
		.removeClass('btn-primary')
		.addClass('btn-danger');

	for(element of ['forward', 'backward', 'rows', 'cols']) {
		$(`#${element}`).attr('disabled', true);
	}

	redefineGrid();
}

function stop() { // Changes the start/stop button to start and reenables the controls
	$('#start-stop').html('Start')
		.removeClass('btn-danger')
		.addClass('btn-primary');

	for(element of ['forward', 'backward', 'rows', 'cols']) {
		$(`#${element}`).attr('disabled', false);
	}
}

function run() { // Steps the game forward at a certain speed
	if(running) {
		setTimeout(() => {
			stepForward();
			run(); // Recursion used to allow the frame rate to change with the FPS slider in real time
		}, 1000/$('#fps').val());
	}
}

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

	grid = newGrid; // Update the back-end grid

	displayChanges(life); // Displace the grid given what cells should be live
}

function setDimensions() { // Resets front-end grid and creates back-end grid if non-existent
	// Set number of rows and columns
	rows = parseInt($('#rows').val());
	cols = parseInt($('#cols').val());

	// Make back-end grid if nonexistent
	if(!grid) {
		grid = Array(rows).fill().map(() => Array(cols).fill(false));
	}

	// Clear cells
	$('#board').empty();

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
				cell.classList.remove('live')
				cell.classList.add('dead');
			} else if(cell.classList.contains('dead')) {
				cell.classList.remove('dead')
				cell.classList.add('live');
			} else {
				console.error('Cell lacks status class.');
				return;
			}

			// Change state in back-end grid
			let coords = [cell.id.split('-')[1].toString(), cell.id.split('-')[2].toString()];
			grid[coords[0]][coords[1]] = !grid[coords[0]][coords[1]];

			// Reset memory
			memory = [];
		});
	}
}

function redefineGrid() { // Changes dimensions of back-end grid to front-end grid and resets memory
	if(grid.length != rows || grid[0].length != cols) {
		// Maps old grid to new grid and updates the old grid
		let newGrid = Array(rows).fill().map(() => Array(cols).fill(false));
		for(r=0; r<(rows<grid.length ? rows : grid.length); r++) {
			for(c=0; c<(cols<grid[0].length ? cols : grid[0].length); c++) {
				if(grid[r][c]) {
					newGrid[r][c] = true;
				}
			}
		}
		grid = newGrid;

		memory = []; // Reset memory
	}
}

function displayGrid() { // Display the current grid
	clearBoard();

	for(r=0; r<(rows<grid.length ? rows : grid.length); r++) {
		for(c=0; c<(cols<grid[0].length ? cols : grid[0].length); c++) {
			if(grid[r][c]) {
				$(`#cell-${r}-${c}`).removeClass('dead')
					.addClass('live');
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

function clearBoard() { // Clear the front-end board
	for(cell of $('.live')) {
		cell.classList.remove('live');
		cell.classList.add('dead');
	}
}