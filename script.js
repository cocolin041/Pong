var canvas, canvasContext, paddleLeft, paddleRight, ball, gameID

let currentLevel = 0
const totalLevels = 3

// score
var playerLeftScore = 0
var playerRightScore = 0
const winningScore = 3

// paddle & ball initial values
const PADDLE_HEIGHT = [200, 150, 100]
const PADDLE_THICKNESS = 10
const BALL_RADIUS = 10
const ballSpeedX = [10, 15, 20]
const ballSpeedY = [10, 15, 20]
const paddleSpeed = ballSpeedY[currentLevel] + 5

// game status
var nextLevel = false
var gameOver = false
var gameWin = false
var pauseGame = false

window.onload = () => {
  canvas = document.getElementById('gameCanvas')
  canvasContext = canvas.getContext('2d')
  paddleLeft = {x: 0, y: 250}
  paddleRight = {x: canvas.width - PADDLE_THICKNESS, y: 250}
  ball = ballInit()

  // update everything every fixed seconds
  gameID = startGame()

  // handle left paddle movement
  canvas.addEventListener('mousemove', (event) => {
    let mousePos = calculateMousePos(event)
    paddleLeft.y = mousePos.y - PADDLE_HEIGHT[currentLevel] / 2
  })
}

startGame = () => {
  gameOver = false
  gameWin = false
  let framesPerSecond = 30
  let gameID = setInterval(() => {
    updateBall()
    setGameObjects()
    moveRightPaddle()
  }, 1000 / framesPerSecond)
  return gameID
}

/**
 * Draw objects on canvas
*/
setGameObjects = () => {

  drawRect(0, 0, canvas.width, canvas.height, 'black') // game box

  if (gameOver || gameWin) {
    clearInterval(gameID)
    let clickBtn = document.getElementById('clickBtn')
    clickBtn.innerText = 'Restart'
    drawResult()
    return
  }

  let levelElment = document.getElementById('level')
  levelElment.innerText = currentLevel + 1

  drawMiddleLine()
  drawRect(paddleLeft.x, paddleLeft.y, PADDLE_THICKNESS, PADDLE_HEIGHT[currentLevel], 'white') // left player paddle
  drawRect(canvas.width-PADDLE_THICKNESS, paddleRight.y, PADDLE_THICKNESS, PADDLE_HEIGHT[currentLevel], 'white') // right player paddle
  drawCircle(ball.centerX, ball.centerY, ball.radius, 'red') // ball
  drawScore()
}

/**
 * Move the ball and update properties of it
*/
updateBall = () => {
  if (gameOver || gameWin || pauseGame) {
    return
  }
  // move ball
  ball.centerX += ball.speedX
  ball.centerY += ball.speedY

  if (ball.centerX - ball.radius <= 0) {
    let hitLeftPaddle = ball.centerY > paddleLeft.y && ball.centerY < paddleLeft.y + PADDLE_HEIGHT[currentLevel]
    if (hitLeftPaddle) {

      // change ball X direction
      ball.speedX = -ball.speedX

      // change ball Y speed
      let deltaY = ball.centerY - (paddleLeft.y + PADDLE_HEIGHT[currentLevel]/2)
      ball.speedY += 0.3 * deltaY

    } else {
      // Reset ball when it hits left wall
      playerRightScore++
      handleResult()
    }
  }

  if (ball.centerX >= canvas.width) {
    let hitRightPaddle = ball.centerY > paddleRight.y && ball.centerY < paddleRight.y + PADDLE_HEIGHT[currentLevel]
    if (hitRightPaddle) {
      ball.speedX = -ball.speedX
      let deltaY = ball.centerY - (paddleRight.y + PADDLE_HEIGHT[currentLevel]/2)
      ball.speedY += 0.3 * deltaY
    } else {
      playerLeftScore++
      handleResult()
    }
  }

  if (ball.centerY > canvas.height || ball.centerY < 0) {
    // change ball Y direction
    ball.speedY = -ball.speedY
  }
}

/**
 * Auto move the right paddle according to position of the ball
*/
moveRightPaddle = () => {
  let paddleRightYCenter = paddleRight.y + PADDLE_HEIGHT[currentLevel]/2
  if (paddleRightYCenter > ball.centerY) {
    paddleRight.y -= paddleSpeed
  }
  if (paddleRightYCenter + PADDLE_HEIGHT[currentLevel]/2 < ball.centerY) {
    paddleRight.y += paddleSpeed
  }
}

handleResult = () => {
  if (playerLeftScore === winningScore || playerRightScore === winningScore) {
    // if left won
    if (playerLeftScore === winningScore) {
      if (currentLevel < totalLevels-1) {
        currentLevel++
      } else {
        gameWin = true
      }
      nextLevel = true
    }
    // if right won
    if (playerRightScore === winningScore) {
      gameOver = true
    }
    playerLeftScore = 0
    playerRightScore = 0
  }
  ball = ballInit()
}

ballInit = () => {
  let ball = {
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    radius: BALL_RADIUS,
    speedX: ballSpeedX[currentLevel],
    speedY: ballSpeedY[currentLevel]
  }
  return ball
}

/**
 * When click the button, either pause/continue/restart the game
 */
handleClick = () => {
  let clickBtn = document.getElementById('clickBtn')
  if (gameOver || gameWin) {
    clickBtn.innerText = 'Pause'
    gameID = startGame()
  } else {
    pauseGame = !pauseGame
    clickBtn.innerText = pauseGame ? 'Continue' : 'Pause'
  }
}

/** 
 * Helper function to draw scores
*/
drawScore = () => {
  canvasContext.fillStyle = 'white'
  canvasContext.font = '20px Arial'
  canvasContext.textAlign = 'center'
  canvasContext.fillText(playerLeftScore, canvas.width/4, 50)
  canvasContext.fillText(playerRightScore, 3*canvas.width/4, 50)
}

/** 
 * Helper function to draw winning result
*/
drawResult = () => {
  canvasContext.fillStyle = 'white'
  if (gameOver) {
    canvasContext.fillText('Game Over', canvas.width/2, canvas.height/2)
  }
  if (gameWin) {
    canvasContext.fillText('You won!', canvas.width/2, canvas.height/2)  
  }
}

drawMiddleLine = () => {
  for (let i = 0; i < canvas.height; i+=40) {
    drawRect(canvas.width/2-1, i, 2, 20, 'white')
  }
}

/**
 * Calculate mouse position
 * @returns {object} - mouse position {x, y}
*/
calculateMousePos = (event) => {
  let rect = canvas.getBoundingClientRect()
  let root = document.documentElement
  let mouseX = event.clientX - rect.left - root.scrollLeft
  let mouseY = event.clientY - rect.top - root.scrollTop
  return {
    x: mouseX,
    y: mouseY
  }
}

/** 
 * Helper function to draw rectangle
*/
drawRect = (leftX, topY, width, height, color) => {
  canvasContext.fillStyle = color
  canvasContext.fillRect(leftX, topY, width, height)
}

/** 
 * Helper function to draw circle
 * @param {nunmber} centerX - x-axis center coordinate of the circle
 * @param {nunmber} centerY - y-axis center coordinate of the circle
*/
drawCircle = (centerX, centerY, radius, color) => {
  canvasContext.beginPath()
  canvasContext.fillStyle = color
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2)
  canvasContext.fill()
}