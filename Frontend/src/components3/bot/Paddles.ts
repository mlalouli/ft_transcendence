export class Paddles {
    paddleX: number;
    paddleY: number;
    paddleWidth: number;
    paddleHeight: number;
    paddleRadius: number;
    paddleColor: string;
    side: string;
    score: number;
    margin: number;
    constructor(x: number, y: number, side: string) {
      this.paddleX = x;
      this.paddleY = y;
      this.paddleWidth = 0;
      this.paddleHeight = 0;
      this.paddleRadius = 0;
      this.paddleColor = "tomato";
      this.side = side;
      this.score = 0;
      this.margin = 20;
    }
  
    updateScore = () => (this.score += 1);
  
    movePaddleUp() {
      this.paddleY = this.paddleY - 0.05 < 0 ? 0 : this.paddleY - 0.08; //0.012
    }
  
    movePaddleDown() {
        this.paddleY = this.paddleY  + 0.05 > 0.85 ? 0.85 : this.paddleY + 0.08; //0.012
    }
  
    initializePaddles(canvasWidth: number, canvasHeight: number) 
    {
      if (canvasWidth >= canvasHeight) {
        this.paddleWidth = 0.012 * canvasWidth;
        this.paddleHeight = 0.15 * canvasHeight;
        this.margin = 0.024;
        this.paddleRadius = canvasWidth * 0.01;
        this.score = 0;
  
        this.paddleX = this.side === "left" ? 0.015 : 0.97;
        this.paddleY = 0.425;
  
      } else {
        this.paddleWidth = 0.012 * canvasHeight;
        this.paddleHeight = 0.15 * canvasWidth;
        this.margin = 0.024;
        this.paddleRadius = canvasWidth * 0.01;
        this.score = 0;
  
        this.paddleX = this.side === "left" ? 0.015 : 0.96;
        this.paddleY = 0.425; // 0.835
      }
  
    }
    
    // updatePaddlesUponResize() 
    updatePaddlesUponResize(canvasWidth: number, canvasHeight: number) 
    {
      if (canvasWidth >= canvasHeight) 
      {
        this.paddleWidth = 0.012 * canvasWidth;
        this.paddleHeight = 0.15 * canvasHeight;
        this.margin = 0.024;
        this.paddleRadius = canvasWidth * 0.01;
      } else 
      {
        this.paddleWidth = 0.012 * canvasHeight;
        this.paddleHeight = 0.15 * canvasWidth;
        this.margin = 0.024;
        this.paddleRadius = canvasWidth * 0.01;
      }
    }
  }