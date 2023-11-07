import { getUserAvatar } from "@/queries/avatarQueries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export  const  ProfileElement =  ({rank, id, username, xp , rank1}
    :{
        rank : number,
        id: number,
        username: string,
        xp: number,   
        rank1: boolean
    }) => {

        const [avatarURL, setAvatarURL] = useState('');
        const navigate = useNavigate();

        useEffect(() => {
            const getAvatar = async () => {
                const res: undefined | string | Blob | MediaSource =
                    await getUserAvatar(id);
                if (res !== undefined && res instanceof Blob)
                    setAvatarURL(URL.createObjectURL(res));
            }    
            getAvatar();
        }, [id])
        if (rank1){
            return (
                <>
                    <td className="number">{rank}</td>
                    <td className="leaderName">{username}</td>
                    <td className="points">
                          {xp.toFixed(2)}
                       <img className="gold-medal" src="https://github.com/malunaridev/Challenges-iCodeThis/blob/master/4-leaderboard/assets/gold-medal.png?raw=true" alt="gold medal"/>
                    </td>
                </>
            )
        }
        else{
            return (
                <>
                    <td className="number">{rank}</td>
                    <td className="leaderName">{username}</td>
                    <td className="points"> {xp}</td>
                </>
            )
        }
}