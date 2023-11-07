
export class Game {
    public canvasElement: HTMLCanvasElement | null
    public context: CanvasRenderingContext2D | null
    constructor() {
      this.canvasElement = <HTMLCanvasElement>document.getElementById("game-canvas");
      this.context = this.canvasElement.getContext("2d");
    }
  
    // drawCanvas(canvasWidth: number, canvasHeight: number) {
    //   if (this.canvasElement) {
    //     if (this.context) {
    //       // this.context.fillStyle = "green";
    //       // this.context.fillRect(0, 0, canvasWidth, canvasHeight);
    //     }
    //   }
    // }
  
    drawPaddles(paddle: any, canvasWidth: number, canvasHeight: number) {
      this.context!.fillStyle = paddle.paddleColor;
      this.context?.beginPath();
  
        const newX = paddle.paddleX * canvasWidth;
        const newY = paddle.paddleY * canvasHeight;
        paddle.side === "left" && this.context?.rect(newX, newY, paddle.paddleWidth, paddle.paddleHeight);
        paddle.side === "right" && this.context?.rect(newX, newY, paddle.paddleWidth, paddle.paddleHeight);
  
      this.context?.closePath();
      this.context?.fill();
    }
  
    scoreBoard = (paddles: any, canvasWidth: number, canvasHeight: number) => {
      const paddleL = paddles.left;
      const paddleR = paddles.right;
      this.context!.font = "30px Arial";
      this.context!.fillStyle = "black";
      this.context!.fillText(paddleL.score, canvasWidth / 2 - 100, canvasHeight / 2);
      this.context!.fillText(paddleR.score, canvasWidth / 2 + 80, canvasHeight / 2);
    };
  
    drawDashedCenterLine(canvasWidth: number, canvasHeight: number) {
      this.context?.setLineDash([8, 10]); // [lineLength, spaceLength]
      this.context!.strokeStyle = "white";
      this.context!.lineWidth = 0.004 * canvasWidth; //4context?.beginPath();
      this.context?.beginPath();

        this.context?.moveTo(canvasWidth / 2, 0);
        this.context?.lineTo(canvasWidth / 2, canvasHeight);
        this.context?.stroke();
      this.context?.closePath();
    }
  
    drawBall(ball: any, canvasWidth: number, canvasHeight: number) {
      const newX = ball.ballX * canvasWidth;
      const newY = ball.ballY * canvasHeight;
      this.context?.beginPath();
      ball.radius = 0.019 * ((canvasWidth + canvasHeight) / 2);
      this.context?.arc(newX, newY, ball.radius, 0, 2 * Math.PI, false);
      this.context!.fillStyle = ball.color;
      this.context?.fill();
      this.context?.closePath();
    }
  
    updateGameState(paddles: any, ball: any, canvasWidth: number, canvasHeight: number) {
      this.context?.clearRect(0, 0, canvasWidth, canvasHeight);
      this.drawDashedCenterLine(canvasWidth, canvasHeight);
      this.drawPaddles(paddles.left, canvasWidth, canvasHeight);
      this.drawPaddles(paddles.right, canvasWidth, canvasHeight);
      this.drawBall(ball, canvasWidth, canvasHeight);
    }
  
    // updateGameStateUponResize(Paddles: any, ball: any, canvasWidth: number, canvasHeight: number) {
    //   this.context?.clearRect(0, 0, canvasWidth, canvasHeight);
    //   this.drawPaddles(Paddles.left, canvasWidth, canvasHeight);
    //   this.drawPaddles(Paddles.right, canvasWidth, canvasHeight);
    //   this.drawBall(ball, canvasWidth, canvasHeight);
    // }
  
      
  
  
  }
  