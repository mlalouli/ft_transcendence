import { Socket, io } from "socket.io-client";

let socket : Socket;

export const initializeSocket = () => {
    if (!socket) { 
        const socketOptions = {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Token: localStorage.getItem('userToken')
                    }
                }
            }
        }
        socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, socketOptions);     
    }
    return socket;
}
