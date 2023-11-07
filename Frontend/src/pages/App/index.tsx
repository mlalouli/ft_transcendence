import { createContext, useEffect,  useState } from "react";
import { INotifCxt, IUserStatus } from "@/global/interface";
import { Outlet } from "react-router-dom";
import { gameInvitation } from "../Chat/type/chat.type";
import { TAlert} from '@/pages/toasts/TAlert';
import {initializeSocket} from '@/pages/Socket/socket';
import { GameRequest } from "../Game/gameRequest";
let LoginStatus = {
    islogged: false,
    setUsername: () => {},
};


export const UsernameCxt = createContext(LoginStatus);

export const UserStatusCxt = createContext<IUserStatus[] | undefined>(undefined);

export const NotifCxt = createContext<INotifCxt | undefined>(undefined);
 

export default function App () {
    
    const [usersStatus, setUsersStatus] = useState<IUserStatus[]>([]);
    const [notifShow, setNotifShow] = useState(false);
    const [notifText, setNotifText] = useState("error");
    const [gameRequest, setGameRequest] = useState(false);
    const [gameInfo, setGameInfo] = useState<gameInvitation | undefined>(undefined);
    
    const socket = initializeSocket();
    let userstatusArr : IUserStatus[]= [];
    useEffect(() => {          
        socket.on("update-status",(data, str:string) => {
            userstatusArr = [];
            for (let i = 0; i <= data.length - 1; i++){
                let newUser: IUserStatus = {
                    key: data[i][0],
                    userModel: {id: 0, status: -1}
                };
                newUser.userModel.id = data[i][0];
                newUser.userModel.status = data[i][1];
                userstatusArr.push(newUser);
            }
            setUsersStatus(userstatusArr);
        })
        return () => {socket.off("update-status")}
    }, [usersStatus]);

    useEffect(() => {
        socket.on('gameInvitation',(game: gameInvitation) => {
            setGameRequest(true);
            setGameInfo(game);
            return () => {
                socket.off('gameInvitation')
            }
        })
    }, [socket])
    return (
        <div>

            <UsernameCxt.Provider value={LoginStatus}>
                <UserStatusCxt.Provider value = {usersStatus}>
                        <NotifCxt.Provider value={{setNotifShow, setNotifText}}>
                            <TAlert show= {notifShow} setShow={setNotifShow} text={notifText}/>
                            <Outlet/>
                        </NotifCxt.Provider>   
                        <div style={{display: gameRequest ? '' : 'none', zIndex: 2000,position: 'fixed',top: '10rem',right:'10px'}}>
                            <div onClick={(e) => e.stopPropagation()}>
                                <GameRequest 
                                    game={gameInfo}
                                    gameRequest={gameRequest}
                                    onGameRequest= {() => {setGameRequest((old)=> {return !old})}}
                                />
                            </div>
                        </div>
                </UserStatusCxt.Provider>
            </UsernameCxt.Provider>
        </div>
    )
};