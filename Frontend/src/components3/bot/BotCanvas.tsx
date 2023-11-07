"use client";

import { useEffect, useState } from "react";
import { Game } from "./Game";
import { Paddles } from "./Paddles";
import { Ball } from "./Ball";
import { Bot } from "./Bot";
import GameCanvas from "../multiplayers/GameCanvas";

type paddles = {
  left: Paddles;
  right: Paddles;
};

export default function StartGame() {
  // let bot;
  
  const [gameEngine, setGameEngine] = useState<null | Game>(null);
  const [paddle, setPaddle] = useState<null | paddles>(null);
  const [ball, setBall] = useState<null | Ball>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>(
    { x: 0, y: 0 }
  );
  let [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [pressedButton, setPressedButton] = useState(false);

  let [bot, setBot] = useState<null | Bot>(null);

  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    setGameEngine(new Game());
    setPaddle({
      left: new Paddles(0, 0, "left"),
      right: new Paddles(0, 0, "right"),
    });
    setBall(new Ball(0, 0, 0, 0, 0, "black"));
    // setIsGameOver(false);
    setBot(new Bot(paddle?.left, paddle?.right, ball, canvasSize.width, canvasSize.height));

    const canvasWidth = window.innerWidth * 0.61;
    const canvasHeight = window.innerHeight * 0.53;
    setCanvasSize({ width: canvasWidth, height: canvasHeight });

    const handleResize = () => {
      const updatedCanvasWidth = window.innerWidth * 0.61;
      const updatedCanvasHeight = window.innerHeight * 0.53;
      setCanvasSize({ width: updatedCanvasWidth, height: updatedCanvasHeight });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key);
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp); 
    window.addEventListener("mousemove", handleMouseMove);

    // Apply CSS styles to the canvas element
    const canvasElement = document.getElementById("game-canvas");
    if (canvasElement) {
      const canvasRadius = Math.min(canvasWidth, canvasHeight) * 0.09;
      canvasElement.style.borderRadius = `${canvasRadius}px`;
      canvasElement.style.border = "3px solid #000000";
      //   canvasElement.style.opacity = '0';
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);



  useEffect(() => {
    if (gameEngine) {
      // alert("Initialize Game");
      // gameEngine.drawCanvas(canvasSize.width, canvasSize.height);
      paddle?.left.initializePaddles(canvasSize.width, canvasSize.height);
      paddle?.right.initializePaddles(canvasSize.width, canvasSize.height);
      ball?.initializeBallState(canvasSize.width, canvasSize.height);

      bot = new Bot(
        paddle?.left,
        paddle?.right,
        ball,
        canvasSize.width,
        canvasSize.height
      );

      setBot(bot);
      // console.log("paddle", paddle);
      // console.log("ball", ball);
      // console.log("bot", bot);

      gameEngine.updateGameState(
        paddle,
        ball,
        canvasSize.width,
        canvasSize.height
      );

      setIsGameOver(false);
    }
  }, [gameEngine, isGameOver]);

  useEffect(() => {
    if (gameEngine) {
      // gameEngine.drawCanvas(canvasSize.width, canvasSize.height);
      paddle?.left.updatePaddlesUponResize(canvasSize.width, canvasSize.height);
      paddle?.right.updatePaddlesUponResize(canvasSize.width, canvasSize.height);
      gameEngine.updateGameState(
        paddle,
        ball,
        canvasSize.width,
        canvasSize.height
        );
        bot?.updateCanvasDimensions(canvasSize.width, canvasSize.height);
    }
  }, [gameEngine, canvasSize]);

  useEffect(() => {
    if (pressedKey) {
      console.log("key is pressed", pressedKey);
      // if (pressedKey === "q") {
      //   paddle?.left.movePaddleUp();
      // } else if (pressedKey === "a") {
      //   paddle?.left.movePaddleDown();
      // }
      if (pressedKey === "ArrowUp") {
        console.log("ArrowUp");

        paddle?.right.movePaddleUp();
      } else if (pressedKey === "ArrowDown") {
        console.log("ArrowDown");
        paddle?.right.movePaddleDown();
      }
    }

    if (mousePosition) {
      
      if (gameEngine) {
        const canvas = gameEngine?.canvasElement;
    
        let relativeX = mousePosition.x - canvas!.offsetLeft;
        let relativeY = mousePosition.y - canvas!.offsetTop - 70;
        
        if (canvasSize.width >= canvasSize.height)
        {
          if (relativeY > 0 && relativeY < canvasSize.height * 0.85) {
            if (relativeX > canvasSize.width / 2) {
              const newPaddleY = relativeY / canvasSize.height;
              paddle!.right.paddleY = newPaddleY;
            }
          }
        }
        else
        {
          if (relativeX > 0 && relativeX < canvasSize.width * 0.85 ) {
            if (relativeY > canvasSize.height / 2 ) {
              const newPaddleX = relativeX / canvasSize.width ;
              paddle!.right.paddleY = newPaddleX;
            }
          }
        }
      }
    }
  }, [pressedKey, mousePosition]);

  useEffect(() => {
    let animationFrameId: number;

    const startAnimation = () => {
      bot?.movePaddle();
      bot?.handleCollisions();
      gameEngine?.updateGameState(
        paddle,
        ball,
        canvasSize.width,
        canvasSize.height
      );

      animationFrameId = requestAnimationFrame(startAnimation);
    };

    startAnimation();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameEngine, canvasSize, paddle, ball]);

  return (
    <div>
      {!pressedButton ? (
        <div>

          <div className=" flex items-center justify-center mb-5 " >
            <canvas
            id="game-canvas"
            className="game-canvas"
            width={canvasSize.width}
            height={canvasSize.height}
            ></canvas>
            </div>
            <div className="h-[10rem] flex items-center justify-around ">
            <button className="glowing-button" onClick={() => setPressedButton(true)}>
              Go Back 
            </button>
          </div>
        </div>
        ): (
          <GameCanvas privateGame ={false}/>
          ) } 
    </div>
  );
}