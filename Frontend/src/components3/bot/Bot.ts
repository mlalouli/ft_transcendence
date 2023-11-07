export class Bot {
  leftPaddle: any;
  rightPaddle: any;
  ball: any;
  canvasWidth: number;
  canvasHeight: number;
  isGameOver: boolean = false;
  winner: string = "";
  constructor(
    left: any,
    right: any,
    ball: any,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.leftPaddle = left;
    this.rightPaddle = right;
    this.ball = ball;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  updateCanvasDimensions(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  movePaddle() {
    const ballY = this.ball.ballY;
    const ballX = this.ball.ballX;
    const paddleY = this.leftPaddle.paddleY;
    const paddleHeight = this.leftPaddle.paddleHeight;

    if (this.canvasWidth >= this.canvasHeight) {
      // if (ballY < paddleY && paddleY > 0) {
      //   this.leftPaddle.paddleY =  ballY//Math.random() < 0.5 ? ballY + 0.03 : ballY ;
      // } else if (ballY > paddleY && paddleY * this.canvasHeight + paddleHeight < this.canvasHeight) {
      //   this.leftPaddle.paddleY = ballY//Math.random() < 0.5 ? ballY - 0.03 : ballY;
      // }
          let b = ballY / 1.27
          this.leftPaddle.paddleY = (b < 0.1) ? 0.1 : b
      } else {
      if (ballX < paddleY && paddleY > 0) {
        this.leftPaddle.paddleY = ballX;
      } else if (ballX > paddleY && paddleY * this.canvasWidth + paddleHeight < this.canvasWidth) {
        this.leftPaddle.paddleY = ballX;
      }
    }
  }

  paddleBallCollision() {
    let reflectionAngle = 0;

    let bX = this.ball.ballX * this.canvasWidth;
    let bY = this.ball.ballY * this.canvasHeight;

    let plY = this.leftPaddle.paddleY * this.canvasHeight;
    let prY = this.rightPaddle.paddleY * this.canvasHeight;

    let maxAngle =
      this.canvasWidth > 1300 || this.canvasHeight > 1000
        ? Math.PI / 4
        : Math.PI / 4;

    if (this.canvasWidth > this.canvasHeight) {
      if (bX < this.canvasWidth / 2) {
        // Ball collided with the left paddle
        const paddleCenterY = plY + this.leftPaddle.paddleHeight / 2;
        const relativeY = bY - paddleCenterY;
        const normalizedY = relativeY / (this.leftPaddle.paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      } else if (bX > this.canvasWidth / 2) {
        // Ball collided with the right paddle
        const paddleCenterY = prY + this.rightPaddle.paddleHeight / 2;
        const relativeY = bY - paddleCenterY;
        const normalizedY = relativeY / (this.rightPaddle.paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      }
    }
    // return;
    bX = this.ball.ballX * this.canvasWidth;
    bY = this.ball.ballY * this.canvasHeight;

    // plX = this.leftPaddle.paddleX * canvasHeight
    plY = this.leftPaddle.paddleY * this.canvasWidth;
    prY = this.rightPaddle.paddleY * this.canvasWidth;

    if (this.canvasWidth < this.canvasHeight) {
      if (bY < this.canvasHeight / 2) {
        // Ball collided with the Top paddle
        const paddleCenterY = plY + this.leftPaddle.paddleHeight / 2;
        const relativeY = bX - paddleCenterY;
        const normalizedY = relativeY / (this.leftPaddle.paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      } else if (bY > this.canvasHeight / 2) {
        // Ball collided with the Bottom paddle
        const paddleCenterY = prY + this.rightPaddle.paddleHeight / 2;
        const relativeY = bX - paddleCenterY;
        const normalizedY = relativeY / (this.rightPaddle.paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      }
    }

    const ballVelocity = this.canvasWidth >= this.canvasHeight ? 0.015 : 0.016;

    if (this.canvasWidth >= this.canvasHeight) {
      this.ball.xVelocity =
        this.ball.ballX * this.canvasWidth < this.canvasWidth / 2
          ? ballVelocity * Math.cos(reflectionAngle)
          : -ballVelocity * Math.cos(reflectionAngle);
      this.ball.yVelocity = ballVelocity * Math.sin(reflectionAngle);
    } else {
      this.ball.xVelocity = ballVelocity * Math.sin(reflectionAngle);
      this.ball.yVelocity =
        this.ball.ballY * this.canvasHeight < this.canvasHeight / 2
          ? ballVelocity * Math.cos(reflectionAngle)
          : -ballVelocity * Math.cos(reflectionAngle);
    }

    this.ball.color = this.randomColor();
  }

  ballPaddleFaceCollision = () =>
    this.isBallWithinPaddleRangeX() && this.isBallWithinPaddleRangeY();

  isBallWithinPaddleRangeX = () => {
    if (this.canvasWidth >= this.canvasHeight) {
      const left =
        this.ball.ballX * this.canvasWidth - this.ball.radius <=
        this.leftPaddle.paddleX * this.canvasWidth + this.leftPaddle.paddleWidth;
      const right =
        this.ball.ballX * this.canvasWidth + this.ball.radius >=
        this.rightPaddle.paddleX * this.canvasWidth;

      return left || right;
    }
    const top =
      this.ball.ballY * this.canvasHeight - this.ball.radius <=
      this.leftPaddle.paddleX * this.canvasHeight + this.leftPaddle.paddleWidth;
    const bottom =
      this.ball.ballY * this.canvasHeight + this.ball.radius >=
      this.rightPaddle.paddleX * this.canvasHeight;
    return top || bottom;
  };

  // check if ball is within paddle interval, not off the edges of the paddle
  isBallWithinPaddleRangeY = () => {
    if (this.canvasWidth >= this.canvasHeight) {
      const left =
        this.ball.ballY * this.canvasHeight + this.ball.radius > this.leftPaddle.paddleY * this.canvasHeight &&
        this.ball.ballY * this.canvasHeight - this.ball.radius < this.leftPaddle.paddleY * this.canvasHeight + this.leftPaddle.paddleHeight;

      const right =
        this.ball.ballY * this.canvasHeight + this.ball.radius >
          this.rightPaddle.paddleY * this.canvasHeight &&
        this.ball.ballY * this.canvasHeight - this.ball.radius <
          this.rightPaddle.paddleY * this.canvasHeight +
            this.rightPaddle.paddleHeight;

      if (this.ball.ballX * this.canvasWidth < this.canvasWidth / 2)
        return left;
      return right;
    } else {
      const top =
        this.ball.ballX * this.canvasWidth + this.ball.radius >
          this.leftPaddle.paddleY * this.canvasWidth &&
        this.ball.ballX * this.canvasWidth - this.ball.radius <
          this.leftPaddle.paddleY * this.canvasWidth +
            this.leftPaddle.paddleHeight;

      const bottom =
        this.ball.ballX * this.canvasWidth + this.ball.radius >
          this.rightPaddle.paddleY * this.canvasWidth &&
        this.ball.ballX * this.canvasWidth - this.ball.radius <
          this.rightPaddle.paddleY * this.canvasWidth +
            this.rightPaddle.paddleHeight;

      if (this.ball.ballY * this.canvasHeight < this.canvasHeight / 2)
        return top;
      return bottom;
    }
  };

  getRandomVelocity() {
    const angle = [0, 1, 2];
    const ang = angle[Math.floor(Math.random() * angle.length)];

    const velocities: any = {
      0: [-0.005, 0.004],
      1: [-0.004, 0.004],
      2: [-0.005, 0.004],
    };

    const direction = Math.random() < 0.5 ? 1 : -1;
    const [ball_vel_y, ball_vel_x] = velocities[ang].map(
      (vel: any ) => vel * direction
    );

    if (this.canvasWidth >= this.canvasHeight)
      return { xV: ball_vel_x, yV: ball_vel_y };
    else return { xV: ball_vel_y, yV: ball_vel_x };
  }

   randomColor = () => {
    const min = 0;
    const max = 255;
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    const g = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    return `rgb(${r}, ${g}, ${b})`;
  };

  resetGame = () => {
    if (this.canvasWidth >= this.canvasHeight) 
    {
      const minY = 0.4;
      const maxY = 0.7;
      const randomY = Math.random() * (maxY - minY) + minY;
  
      this.ball.ballX = 0.5;
      this.ball.ballY = randomY;
      const { xV, yV } = this.getRandomVelocity();
      this.ball.xVelocity = xV;
      this.ball.yVelocity = yV;
      this.ball.color = this.randomColor();
    } 
    else 
    {
      const minX = 0.3;
      const maxX = 0.8;
      const randomX = Math.random() * (maxX - minX) + minX;
  
      this.ball.ballX = randomX;
      this.ball.ballY = 0.5;
      const { xV, yV } = this.getRandomVelocity();
      this.ball.xVelocity = xV;
      this.ball.yVelocity = yV;
      this.ball.color = this.randomColor();
    }
  };

  ballTopBottomCollision() {
    if (
      this.ball.ballY * this.canvasHeight +
        this.ball.radius +
        this.ball.yVelocity * this.canvasHeight >
        this.canvasHeight ||
      this.ball.ballY * this.canvasHeight - this.ball.radius < 0
    ) {
      this.ball.yVelocity = -this.ball.yVelocity;
    }
  }

  ballRightLeftCollision() {
    if (
      this.ball.ballX * this.canvasWidth + this.ball.radius >
        this.canvasWidth ||
      this.ball.ballX * this.canvasWidth - this.ball.radius < 0
    )
      this.ball.xVelocity = -this.ball.xVelocity;
  }

  handleCollisions() {
    // Top-bottom/Left-right collision
    if (this.canvasWidth >= this.canvasHeight) 
        this.ballTopBottomCollision();
    else this.ballRightLeftCollision();
      // Paddle-Ball collision
    if (this.ballPaddleFaceCollision()) {

      this.paddleBallCollision();
        
    } else if (this.isBallWithinPaddleRangeX()) 
    {
      this.resetGame();
    }

    this.ball.ballX += this.ball.xVelocity;
    this.ball.ballY += this.ball.yVelocity;
  }
}
