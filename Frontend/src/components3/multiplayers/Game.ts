import { CanvasSize, GameData } from "./interface/game.interface";

export class Game {
  public canvasElement: HTMLCanvasElement | null
  public context: CanvasRenderingContext2D | null
  constructor() {
    this.canvasElement = <HTMLCanvasElement>document.getElementById("game-canvas");
    this.context = this.canvasElement.getContext("2d");
  }

  drawPaddles(gameObjs: GameData, canvasSize: CanvasSize, color: string) {
    if (gameObjs == null) return;

    this.context!.fillStyle = color;
    this.context?.beginPath();

    const canvasWidth = canvasSize.width;
    const canvasHeight = canvasSize.height;
    
    const paddleLeftX = 0.015;
    const paddleRightX = 0.97;
    const paddleWidth = 0.012 * canvasWidth;
    const paddleHeight = 0.15 * canvasHeight;

      const leftX = paddleLeftX * canvasWidth;
      const rightX = paddleRightX * canvasWidth;

      const leftY = gameObjs.leftPaddleY * canvasHeight;

      this.context?.rect(leftX, leftY, paddleWidth, paddleHeight);
      const rightY = gameObjs.rightPaddleY * canvasHeight;
      this.context?.rect(rightX, rightY, paddleWidth, paddleHeight);

    this.context?.closePath();
    this.context?.fill();
  }

  scoreBoard = (gameObjs: GameData, canvasSize: CanvasSize) => {
    if (gameObjs == null) return;

    let canvasWidth = canvasSize.width;
    let canvasHeight = canvasSize.height;

    this.context!.font = "30px Arial";
    this.context!.fillStyle = "black";
    this.context!.fillText(gameObjs.player1Score.toString(), canvasWidth / 2 - 100, canvasHeight / 2);
    this.context!.fillText(gameObjs.player2Score.toString(), canvasWidth / 2 + 80, canvasHeight / 2);
  };

  drawDashedCenterLine(canvasWidth: number, canvasHeight: number) {
    this.context?.setLineDash([8, 10]); // [lineLength, spaceLength]
    this.context!.strokeStyle = "yellow";
    this.context!.lineWidth = 0.004 * canvasWidth; //4context?.beginPath();
    this.context?.beginPath();
      this.context?.moveTo(canvasWidth / 2, 0);
      this.context?.lineTo(canvasWidth / 2, canvasHeight);
      this.context?.stroke();
    this.context?.closePath();
  }

  drawBall(gameObjs: GameData, canvasSize: CanvasSize) {
    if (gameObjs == null) return;
    
    const newX = gameObjs.ballX * canvasSize.width;
    const newY = gameObjs.ballY * canvasSize.height;
    const radius = 0.019 * ((canvasSize.width + canvasSize.height) / 2);

    this.context?.beginPath();
    this.context?.arc(newX, newY, radius, 0, 2 * Math.PI, false);
    this.context!.fillStyle = gameObjs.color;
    this.context?.fill();
    this.context?.closePath();
  }

  updateGameState(gameObjs: GameData, canvasSize: CanvasSize, color : string){
    if (gameObjs == null) return;
    
    this.context?.clearRect(0, 0, canvasSize.width, canvasSize.height);
    this.drawDashedCenterLine(canvasSize.width, canvasSize.height);
    this.scoreBoard(gameObjs, canvasSize);
    this.drawPaddles(gameObjs, canvasSize, color);
    this.drawBall(gameObjs, canvasSize);
  }

  printMsg(msg: number, canvasSize: CanvasSize) {
    let canvasWidth = canvasSize.width;
    let canvasHeight = canvasSize.height;

    this.context!.font = "40px Arial";
    this.context!.fillStyle = "green";
    let message : string;

    switch(msg) {
      case 0:
        message = 'Use The Mouse For Moving !';
        break;
      case 1:
        message = 'Waiting for an Opponent to Start  !';
        break;
      case 2:
        message = 'You Win  !';
        break;    
      case 3:
        message = 'You Lose !';
        break;    
      case 4:
        message = 'Waiting for your Opponent to Accept !';
        break;    
      case 5:
        message = 'Please Finish your Current Game !';
        break;    
      default:
        message = 'Error !';
    }
    message = message.replace(/\d/g, "");
    // this.context!.fillText(message, canvasWidth / 9 , canvasHeight / 2 - 40);

    const textPositionX = (canvasWidth > 500) ? canvasWidth * 0.2 : canvasWidth * 0.1;
    const textPositionY = canvasHeight / 2 - 40;
    this.context?.beginPath();
    msg === 2 ?  this.context!.fillStyle = "green" 
              :  msg === 3 ?  this.context!.fillStyle = "red"
              :   this.context!.fillStyle = "white";
    const textWidth = (canvasWidth > 500) ? 40 : 20;
    this.context!.font = `${textWidth}px Arial`;

    this.context?.fillText(message, textPositionX, textPositionY);
    this.context?.fill();
    this.context?.closePath();
  }


  remindPlayerToFinishCurrentGame(message: string, canvasSize: CanvasSize) {
    let canvasWidth = canvasSize.width;
    let canvasHeight = canvasSize.height;
  
    const textPositionX = (canvasWidth > 500) ? canvasWidth * 0.2 : canvasWidth * 0.1;
    const textPositionY = canvasHeight / 2 - 40;
  
    this.context?.beginPath(); 
    this.context!.fillStyle = "green";
    const textWidth = (canvasWidth > 500) ? (canvasWidth + canvasHeight) / 2 * 0.05 : 18;
    this.context!.font = `${textWidth}px Arial`;

    this.context?.fillText(message, textPositionX, textPositionY);
    this.context?.closePath();
    this.context?.fill();
  }

}