"use client";

import { useContext, useEffect, useState } from "react";
import { Game } from "./Game";
import { initializeSocket } from "@/pages/Socket/socket";
import { CanvasSize, GameData, Player } from "./interface/game.interface";
import { getUserAvatar } from "@/queries/avatarQueries";
import { NotifCxt } from "@/pages/App";
import { Socket, io } from "socket.io-client";
import BotCanvas from "../bot/BotCanvas";
import { Navigate } from "react-router-dom";

function StartButton({
  showStart,
  startButtonHandler,
  buttonState,
}: {
  showStart: boolean;
  startButtonHandler: (e: any) => void;
  buttonState: string;
}) {
  const [button, setButton] = useState(true);
  const [text, setText] = useState("Start");

  useEffect(() => {
    setButton(showStart);
    setText(buttonState);
  }, [showStart, buttonState]);

  const btn = button ? "unset" : "none";
  return (
    <button
      onClick={startButtonHandler}
      style={{ display: btn }}
      className="glowing-button"
    >
      {text}
    </button>
  );
}

export default function StartGame({ privateGame }: { privateGame: boolean }) {
  const notif = useContext(NotifCxt);
  const socketOptions = {
    transportOptions: {
      polling: {
        extraHeaders: {
          Token: localStorage.getItem("userToken"),
        },
      },
    },
  };

  let fetchedAvatars = false;

  let initData: GameData = {
    leftPaddleY: 0.425,
    rightPaddleY: 0.425,
    ballX: 0.5,
    ballY: 0.4,
    player1Name: "player1",
    player2Name: "player2",
    player1Avatar: 0,
    player2Avatar: 0,
    player1Score: 0,
    player2Score: 0,
    roomId: 0,
    color: "transparent",
  };
  const [socket, setSocket] = useState<Socket>(initializeSocket());
  const [gameData, setGameData] = useState<GameData>(initData);
  const [player, setPlayer] = useState<{ playerNb: number; roomId: number }>({
    playerNb: 0,
    roomId: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [msg, setMsg] = useState(0);
  const [gameList, setGameList] = useState([]);
  const [shownSettings, setShownSettings] = useState(false);
  const [settingsState, setSettingsState] = useState("up");
  const [buttonState, setButtonState] = useState("Start");
  const [avatarP1URL, setAvatarP1URL] = useState("");
  const [avatarP2URL, setAvatarP2URL] = useState("");
  const [soloGame, setSoloGame] = useState(false);
  const [redirectChat, setrediRectChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBgColor, setSelectedBgColor] = useState("transparent");
  const [selectedPaddleColor, setSelectedPaddleColor] = useState("tomato");

  const [selectedDiv, setSelectedDiv] = useState(null);

  const handleBgColorClick = (color: any, divId: any) => {
    setSelectedBgColor(color);
    setSelectedDiv(divId);
  };

  const handlePaddelColorClick = (color: any, divId: any) => {
    setSelectedPaddleColor(color);
    setSelectedDiv(divId);
  };

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 0,
    height: 0,
  });
  const [gameEngine, setGameEngine] = useState<null | Game>(null);

  useEffect(() => {
    if (!privateGame) {
      const newSocket = io(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}`,
        socketOptions
      );
      setSocket(newSocket);
    }
  }, []);

  const getAvatars = async (id1: number, id2: number) => {
    const res1: undefined | string | Blob | MediaSource = await getUserAvatar(
      id1
    );
    const res2: undefined | string | Blob | MediaSource = await getUserAvatar(
      id2
    );
    if (res1 !== undefined && res1 instanceof Blob) {
      setAvatarP1URL(URL.createObjectURL(res1));
      if (res2 !== undefined && res2 instanceof Blob)
        setAvatarP2URL(URL.createObjectURL(res2));
    }
  };
  const handleMouseMove = (event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const startButtonHandler = async (e: any) => {
    if (!showStart) return;
    if (buttonState === "Cancel") {
      socket.disconnect();
      socket.connect();
      setGameStarted(false);
      setShowStart(true);
      setButtonState("Start");
      setMsg(0);
      return;
    }
    setButtonState("Cancel");
    socket.emit("start", {}, (player: Player) => {
      if (player.playerNb === 3) {
        setMsg(5);
        return;
      }
      setPlayer({ roomId: player.roomId, playerNb: player.playerNb });
      setMsg(1);
    });
  };

  const soloButtonHandler = () => setSoloGame(true);

  useEffect(() => {
    socket.on("gameStarted", () => {
      setGameStarted(true);
      setShowStart(false);
      fetchedAvatars = false;
      socket.off("rejected");
    });
    socket.on("update", (data: GameData) => {
      setGameData({
        ballX: data.ballX,
        ballY: data.ballY,
        color: data.color,
        leftPaddleY: data.leftPaddleY,
        rightPaddleY: data.rightPaddleY,
        player1Score: data.player1Score,
        player2Score: data.player2Score,
        player1Name: data.player1Name,
        player2Name: data.player2Name,
        roomId: data.roomId,
        player1Avatar: data.player1Avatar,
        player2Avatar: data.player2Avatar,
      });
      if (fetchedAvatars === false) {
        fetchedAvatars = true;
        getAvatars(data.player1Avatar, data.player2Avatar);
      }
    });

    if (privateGame && localStorage.getItem("playerNb") === "1") {
      let roomId = Number(localStorage.getItem("roomId")!);
      setPlayer({ roomId: roomId, playerNb: 1 });
      setMsg(4);
      setButtonState("Cancel");
      socket.on("rejected", (targetName: string) => {
        setPlayer({ roomId: 0, playerNb: 0 });
        setMsg(0);
        setButtonState("Start");
        setrediRectChat(true);
        notif?.setNotifText(targetName + " rejected !");
        notif?.setNotifShow(true);
      });
    }
    if (privateGame && localStorage.getItem("playerNb") === "2") {
      let roomId = Number(localStorage.getItem("roomId")!);
      setPlayer({ roomId: roomId, playerNb: 2 });
      setMsg(0);
      setGameStarted(true);
      setShowStart(false);
    }
    return () => {
      socket.disconnect();
      socket.connect();
      socket.off("gameStarted");
      socket.off("update");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("gameOver", (winner: number) => {
      winner === player.playerNb ? setMsg(2) : setMsg(3);
      setGameStarted(false);
      setShowStart(true);
      setButtonState("New Game");
      setAvatarP1URL("");
      setAvatarP2URL("");
    });
    return () => {
      socket.off("gameOver");
    };
  }, [socket, player.playerNb]);

  useEffect(() => {
    if (mousePosition && gameStarted) {
      if (gameEngine) {
        const canvas = gameEngine?.canvasElement;

        let relativeX = mousePosition.x - canvas!.offsetLeft;
        let relativeY = mousePosition.y - canvas!.offsetTop - 70;

        if (canvasSize.width >= canvasSize.height) {
          if (relativeY > 0 && relativeY < canvasSize.height * 0.85) {
            if (relativeX > canvasSize.width / 2) {
              const newPaddleY = relativeY / canvasSize.height;
              socket?.emit("move", { player: player, value: newPaddleY });
            } else {
              const newPaddleY = relativeY / canvasSize.height;
              socket?.emit("move", { player: player, value: newPaddleY });
            }
          }
        }
      }
    }
  }, [
    mousePosition,
    player,
    gameStarted,
    privateGame,
    localStorage.getItem("roomId"),
    localStorage.getItem("playerNb"),
  ]);

  useEffect(() => {
    setGameEngine(new Game());

    const canvasObj: CanvasSize = {
      width: window.innerWidth * 0.61,
      height: window.innerHeight * 0.53,
    };
    setCanvasSize(canvasObj);
    const handleResize = () => {
      const updatedCanvasWidth = window.innerWidth * 0.61;
      const updatedCanvasHeight = window.innerHeight * 0.53;
      setCanvasSize({ width: updatedCanvasWidth, height: updatedCanvasHeight });
    };

    // const handleKeyDown = (event: KeyboardEvent) => {
    //   setPressedKey(event.key);
    // };

    // const handleKeyUp = () => {
    //   setPressedKey(null);
    // };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const canvasElement = document.getElementById("game-canvas");
    if (canvasElement) {
      const canvasRadius = Math.min(canvasObj.width, canvasObj.height) * 0.09;
      canvasElement.style.borderRadius = `${canvasRadius}px`;
      canvasElement.style.border = "3px solid #000000";
      canvasElement.style.backgroundColor = selectedBgColor;
      canvasElement.style.opacity = "100";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectedBgColor]);

  useEffect(() => {
    gameEngine?.updateGameState(gameData, canvasSize, selectedPaddleColor);
  }, [canvasSize, gameData, player, msg, selectedPaddleColor]);

  useEffect(() => {
    gameEngine?.printMsg(msg, canvasSize);
  }, [msg, canvasSize]);
  //   useEffect(() => {
  //     // socket.on('initGame', (data:any) => {
  //     //   console.log("************** InitGame ***********");
  //     //   setInitGame(true);
  //     // });
  //     socket?.on("triggerAnimationLoop", (data: any) => {
  //       console.log("************** TriggerAnimationLoop ***********", data);
  //       setGameData(data);
  //       setInitGame(true);
  //     });

  //     socket?.on("gameOver", (data: any) => {
  //       console.log("************** GameOver ***********", data);
  //       setWinner(data);
  //       setIsGameOver(true);
  //       setgameStarted(false);
  //     });
  //   }, [socket]);

  //   useEffect(() => {
  //     if (initGame) {
  //       gameEngine?.updateGameState(gameData, canvasSize);

  //         player &&
  //         setPlayer({
  //           ...player,
  //           roomId: gameData.roomId,
  //         });
  //       setgameStarted(true);
  //     }
  //   }, [initGame, player]);

  //   useEffect(() => {
  //     if (isGameOver) {
  //       let newGameData;
  //       if (winner === 1) {
  //         setGameData(newGameData = {
  //           ...gameData,
  //           winner: gameData.player1Name
  //         });
  //       }
  //       else {
  //         setGameData(newGameData = {
  //           ...gameData,
  //           winner: gameData.player2Name
  //         });
  //       }

  //       console.log("************** over ***********", newGameData);
  //       gameEngine?.updateGameState(gameData, canvasSize);
  //       gameEngine?.declareWinner(newGameData, canvasSize);
  //     }
  //   }, [isGameOver, canvasSize]);

  //   useEffect(() => {
  //     if (gameStarted) {
  //       socket?.on('animationLoop', (data:any) => {
  //         // console.log("************** AnimationLoop ***********", data);
  //         setGameData(data);
  //         gameEngine?.updateGameState(data, canvasSize);
  //       });
  //     }
  //   }, [gameStarted, canvasSize]);

  return (
    <div>
      {soloGame ? (
        <div>
          <BotCanvas />
        </div>
      ) : (
        <div>
          <div>
            {!gameStarted && (
              <button
                className="bg-[#3A3D9B] text-white active:bg-[#3F0564] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mb-4 "
                type="button"
                onClick={() => setShowModal(true)}
              >
                Open Game Settings
              </button>
            )}
            {showModal ? (
              <>
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                  <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                      <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                        <h3 className="text-3xl font-semibold">
                          Game Settings
                        </h3>
                      </div>
                      <div className="relative p-6 flex-auto  w-fit">
                        <div className=" border-2 border-black p-2 rounded-[20px] mb-2 ">
                          <h1 className="text-2xl font-semibold">
                            Background Color
                          </h1>
                          <div className="flex w-[40rem] space-x-2">
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-red-500 cursor-pointer"
                              onClick={() => handleBgColorClick("red", "red")}
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-green-500 cursor-pointer"
                              onClick={() =>
                                handleBgColorClick("green", "green")
                              }
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-blue-500 cursor-pointer"
                              onClick={() => handleBgColorClick("blue", "blue")}
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-yellow-500 cursor-pointer"
                              onClick={() =>
                                handleBgColorClick("yellow", "yellow")
                              }
                            ></div>
                          </div>
                          <div className=" my-3 ">
                            Selected Color: {selectedBgColor}
                          </div>
                        </div>
                        <div className=" border-2 border-black p-2 rounded-[20px] ">
                          <h1 className="text-2xl font-semibold">
                            Paddel Color
                          </h1>
                          <div className="flex space-x-2 mt-4">
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-purple-500 cursor-pointer"
                              onClick={() =>
                                handlePaddelColorClick("purple", "purple")
                              }
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-orange-500 cursor-pointer"
                              onClick={() =>
                                handlePaddelColorClick("orange", "orange")
                              }
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-pink-500 cursor-pointer"
                              onClick={() =>
                                handlePaddelColorClick("pink", "pink")
                              }
                            ></div>
                            <div
                              className="w-[25%] h-[4rem] rounded-full bg-black cursor-pointer"
                              onClick={() =>
                                handlePaddelColorClick("black", "black")
                              }
                            ></div>
                          </div>
                          <div className=" my-3 ">
                            Selected Color: {selectedPaddleColor}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                        <button
                          className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                        <button
                          className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => setShowModal(false)}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
              </>
            ) : null}
            <div className="border-double border-2 rounded-[30px] mb-5 flex flex-col md:flex-row h-[auto] items-center justify-between">
              <div className="flex flex-col md:flex-row w-full md:w-[80rem] items-center justify-around md:justify-between">
                <div className="flex items-center justify-center md:justify-around md:w-[30rem]">
                  {avatarP1URL && (
                    <div>
                      <img
                        src={avatarP1URL}
                        alt=""
                        className="w-[64px] h-[64px] rounded-full"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-white text-4xl">
                      {gameData.player1Name}
                    </h1>
                  </div>
                </div>
                <div>
                  <h1 className="text-white text-4xl">
                    {gameData.player1Score}
                  </h1>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <h1 className="text-white text-6xl">:</h1>
              </div>
              <div className="flex flex-col md:flex-row w-full md:w-[80rem] items-center justify-around md:justify-between">
                <div>
                  <h1 className="text-white text-4xl">
                    {gameData.player2Score}
                  </h1>
                </div>
                <div className="flex items-center justify-center md:justify-around md:w-[30rem]">
                  {avatarP2URL && (
                    <div>
                      <img
                        src={avatarP2URL}
                        alt=""
                        className="w-[64px] h-[64px] rounded-full"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-white text-4xl">
                      {gameData.player2Name}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" flex items-center justify-center mb-5 ">
            <canvas
              id="game-canvas"
              className="game-canvas "
              width={canvasSize.width}
              height={canvasSize.height}
            ></canvas>
          </div>
          <div className="h-[10rem] flex items-center justify-around ">
            <StartButton
              showStart={showStart}
              startButtonHandler={startButtonHandler}
              buttonState={buttonState}
            />
            <StartButton
              showStart={showStart && buttonState !== "Cancel"}
              startButtonHandler={soloButtonHandler}
              buttonState="Solo Mode"
            />
          </div>
        </div>
      )}
      {redirectChat ? <Navigate to="/Chat" replace={true} /> : null}
    </div>
  );
}
