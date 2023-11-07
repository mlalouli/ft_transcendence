export class Ball {
    ballX: number;
    ballY: number;
    radius: number;
    xVelocity: number;
    yVelocity: number;
    color: string;

    constructor(x: number, y: number, radius: number, dx: number, dy: number, color: string)
    {
      this.ballX = x;
      this.ballY = y;
      this.radius = radius;
      this.xVelocity = dx;
      this.yVelocity = dy;
      this.color = color;
    }
    
    initializeBallState(canvasWidth: number, canvasHeight: number) {
        this.ballX = 0.5;
        this.ballY = 0.5;
        this.radius = 0.019 * ((canvasWidth + canvasHeight) / 2);
        this.xVelocity = Math.random() < 0.5 ? -0.005 : 0.005;
        this.yVelocity = 0.005;
        this.color = "tomato";
    }
  }