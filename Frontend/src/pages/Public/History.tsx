import { getGameHistory } from "@/queries/GameQueries";
import { getUserAvatar } from "@/queries/avatarQueries";
import {  useEffect, useState } from "react";



export default function DisplayHistory(props: any){   
    const [history, setHistory] = useState([]);
    useEffect(()=> {
        const getHistory = async() => {
            const res = await getGameHistory(props.id);
            if (res !== 'error'){
                setHistory(res);
            }else console.log('History error');
        }
        getHistory();
    }, []);
    return <div className='alert'>
        {
            history && history.length !== 0 ? (  <div>
                {history !== undefined ? (history!.map((h, i) => {
                    return (
                        <DisplayRow key= {i} history={history[i]}  avatar= {props.avatar}/>
                    )
                })): null}
            </div>): (
                <div> <h1> No History </h1></div>
            )
        }
  </div>; 
    
}

const DisplayRow = (props : any) => {
    const [avatarURL, setAvatarURL] = useState('');
    
    useEffect(()=> {
        const getAvatar = async() => {
            const res : undefined | string | Blob | MediaSource = await getUserAvatar(props.history.otherId);
            if (res !== undefined && res instanceof Blob)
                setAvatarURL(URL.createObjectURL(res));
            else if (res === 'error')
                setAvatarURL('https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg')
        };
        getAvatar();
    },[])
    return (
        <div className=' w-[70rem]] h-[100px] flex items-end justify-between pb-3 mb-3 border-2  rounded-md '>
        <div className=" flex items-center justify-around w-[35%] "  >
            <img  className="rounded-full w-[80px] h-[80px]"
                 src={props.avatar} />
            <div>
                <h1> {props.history.userScore}</h1>
            </div>
        </div>
        <div>

                <h1>{props.history.victory ? 'Victory' : 'Defeat'}</h1>
        </div>
          
        <div className=" flex items-center justify-around w-[35%] " >
            <div  >
                <h1> {props.history.otherScore}</h1>
            </div>
            <img className="rounded-full w-[80px] h-[80px]"
                 src={avatarURL} />
        </div>
    </div>
    )
}