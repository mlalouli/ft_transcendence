import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import Header from "@/components/header";
import Navebar  from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getLeaderBoard } from '@/queries/userQueries';
import { getUserAvatar } from '@/queries/avatarQueries';
import { ProfileElement } from './ProfileElements/ProfileElements';

// import styles from '../styles/style2.scss'

// const inter = Inter({ subsets: ['latin'] })

type GameElement = {
  id: number;
  rank : number;
  pseudo: string;
  xp: number;
}

export default function Home() {

  const [info, setInfo] = useState<[]>([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect( () => {

    const leaderboard = async () => {
      const res = await getLeaderBoard();
      if (res !== 'error')
      {
        setInfo(res);
        setIsFetched(true);
      }
    }
    leaderboard();
  }, [isFetched])

  return (
    <>
      <Header />
      <div className="backround2">
    
    <div className="main-container">
      <div className="navcontainer">
      <Navebar />
        
      </div>
      <div className="main w-[calc(100%-60rem)] ">
          <div className="profile !h-full ">    
            <img src="../img/demo.gif" className='gif' alt="" />
            <div className="leaderBody ">
              <div className='leaderMain'>
              <div className="leaderHeader">
        <h1>Ranking</h1>
      </div>
      <div id="leaderboard">
        <div className="ribbon"></div>
        <table>
          <tbody>

          {
            info == null || info.length === 0 ? 
            <tr>
              <td>
                Coming Soon !
              </td>
            </tr>
            :
            info?.map((element: GameElement, rank) => {
              return(
                <tr key={rank}>
                  <ProfileElement 
                   rank = {element.rank}
                   id = {element.id}
                   username = {element.pseudo}
                   xp = {element.xp}
                   rank1 = {element.rank === 1 ? true : false}
                   />
                </tr>
              )
            })
          }
          </tbody>
        </table>
      </div>
              </div>
              
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};