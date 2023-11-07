import { getUserAvatar } from "@/queries/avatarQueries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { initializeSocket } from "../Socket/socket";
import { Player } from "./interface/game.interface";
import { gameInvitation } from "../Chat/type/chat.type";

export function GameRequest ({game, gameRequest, onGameRequest} :
    {
        game: gameInvitation | undefined,
        gameRequest: boolean,
        onGameRequest: () => void
    }){
        const navigate = useNavigate();
        const [avatarURL, setAvatarURL] = useState('');
        const socket = initializeSocket();

        useEffect(() => {
            if (game){
                const getAvatar = async () => {
                    const res : undefined | string | Blob | MediaSource =
                        await getUserAvatar(game!.senderId);
                    if (res !== undefined && res instanceof Blob)
                        setAvatarURL(URL.createObjectURL(res));
                }
                getAvatar();
            }
        }, [game]);

        const joinGame = () => {
            socket.emit('joinPrivate', {roomId: game!.gameInfo.roomId,}, (player: Player)=> {
                if (player.roomId !== undefined && player.playerNb !== undefined){
                    localStorage.setItem('roomId', player.roomId.toString());
                    localStorage.setItem('playerNb', player.playerNb.toString());
                    onGameRequest();
                    navigate('/privateGame');
                }else {
                    socket.disconnect();
                    socket.connect();
                    onGameRequest();
                }
            })
        }

        const declineGame = () => {
            socket.disconnect();
            socket.connect();
            socket.emit('decline game',(game));
            onGameRequest();
        }
        const handleError = (e : any) => {
            e.target.src = "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
          }
        return (
            <>
            <div className="w-[40rem] h-[15rem] flex flex-col items-center justify-between bg-white rounded-[30px] py-3 shadow-black shadow-md ">

                <div className=" text-black text-4xl " >Game Invitation</div>
                <div className="flex justify-around items-center w-full border-separate border-2 p-2">
                    <img src={avatarURL} className="w-[64px] h-[64px] rounded-full " alt="" onError={handleError} />
                    <div className="text-black text-3xl ">
                        {game?.senderName} Challenged you !
                    </div>
                </div>
                <div className="flex justify-around items-center w-full">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={joinGame}>Accept</button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={declineGame}>Decline</button>
                </div>
            </div >
            </>
        )
    }