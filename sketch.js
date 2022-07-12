// Follow along from codings trains video on Wave Function Collapse.

const tiles = []

let grid = []

const DIM = 10

const BLANK = 0
const UP = 1
const RIGHT = 2
const DOWN = 3
const LEFT = 4

const rules = [
  // BLANK - U, R, D, L
  [
    [BLANK, UP],
    [BLANK, RIGHT],
    [BLANK, DOWN],
    [BLANK, LEFT]
  ],
  // UP - U, R, D, L
  [
    [RIGHT, LEFT, DOWN],
    [LEFT, UP, DOWN],
    [BLANK, DOWN]
  ],
  // RIGHT - U, R, D, L
  [
    [RIGHT, LEFT, DOWN],
    [LEFT, UP, DOWN],
    [RIGHT, LEFT, UP],
    [BLANK, LEFT]
  ],
  //DOWN - U, R, D, L
  [
    [BLANK, UP],
    [LEFT, UP, DOWN],
    [RIGHT, LEFT, UP],
    [RIGHT, UP, DOWN]
  ],
  //lEFT - U, R, D, L
  [
    [RIGHT, LEFT, DOWN],
    [BLANK, RIGHT],
    [RIGHT, LEFT, UP],
    [UP, DOWN, RIGHT]
  ]
]

function preload () {
  tiles[0] = loadImage('tiles/polka/blank.png')
  tiles[1] = loadImage('tiles/polka/up.png')
  tiles[2] = loadImage('tiles/polka/right.png')
  tiles[3] = loadImage('tiles/polka/down.png')
  tiles[4] = loadImage('tiles/polka/left.png')
}

function setup () {
  createCanvas(800, 800)
  // Seed for the mapping
  // randomSeed(10)
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = {
      collapsed: false,
      options: [BLANK, UP, RIGHT, DOWN, LEFT]
    }
  }
}

function checkValid (arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i]
    if (!valid.includes(element)) {
      // Remove from the array
      arr.splice(i, 1)
    }
  }
}

function mousePressed () {
  redraw()
}

function draw () {
  background(0)

  const w = width / DIM
  const h = height / DIM
  // Run through all squares
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      // Get current cell from 2D grid
      let cell = grid[i + j * DIM]
      // If cell HAS collapsed - show a tile
      if (cell.collapsed) {
        let index = cell.options[0]
        image(tiles[index], i * w, j * h, w, h)
      } else {
        // If it is not yet collapsed - show a blank square.
        fill(0)
        stroke(255)
        rect(i * w, j * h, w, h)
      }
    }
  }

  // Get all cells that have not collapsed
  let gridCopy = grid.slice()
  gridCopy = gridCopy.filter(a => !a.collapsed)

  // If grid copy is empty
  if (gridCopy.length == 0) {
    return
  }

  // Sort by how many options are left (entropy)
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length
  })

  //
  let len = gridCopy[0].options.length
  let stopIndex = 0
  // Loop through all grid from 1
  for (let i = 1; i < gridCopy.length; i++) {
    // If this cells options length is > grid[0] stop as we have found one with a higher entropy???
    if (gridCopy[i].options.length > len) {
      stopIndex = i
      break
    }
  }

  // Remove the cell  at stop index
  if (stopIndex > 0) gridCopy.splice(stopIndex)
  // Create a new cell
  const cell = random(gridCopy)
  cell.collapsed = true
  const pick = random(cell.options)
  cell.options = [pick]

  const nextGrid = []
  // Loop through grid
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM

      // If the cell has collaposed add this to the next grid.
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index]
      } else {
        // If the cell has not collapsed
        let options = [BLANK, UP, RIGHT, DOWN, LEFT]

        if (j > 0) {
          let up = grid[i + (j - 1) * DIM]
          let validOptions = []
          for (let option of up.options) {
            // Loops all options in the cell
            // eg. 0, 1, 2
            // Then grabs the 3rd value in each array and ads to total valid options.
            // Check valid will check all the tile options and keeps only 'valid' ones.
            // Splices the origin options..
            let valid = rules[option][2] // Blank or down
            validOptions = validOptions.concat(valid)
          }
          checkValid(options, validOptions)
        }

        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM]
          let validOptions = []
          for (let option of right.options) {
            let valid = rules[option][3] // Up, down or right
            validOptions = validOptions.concat(valid)
          }
          checkValid(options, validOptions)
        }

        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM]
          let validOptions = []
          for (let option of down.options) {
            if (!(option in rules)) {
              console.log(down)
              console.log(i, j + 1)
            }
            let valid = rules[option][0]
            validOptions = validOptions.concat(valid)
          }
          checkValid(options, validOptions)
        }

        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM]
          let validOptions = []
          for (let option of left.options) {
            let valid = rules[option][1] //
            validOptions = validOptions.concat(valid)
          }
          checkValid(options, validOptions)
        }

        // Add the new configued options for this tile into the array
        // Set it to not be collapsed as we are no here yet, we just needed to edit its entripy.
        nextGrid[index] = {
          options,
          collapsed: false
        }
      }
    }
  }

  // Run the next grid
  grid = nextGrid
}
