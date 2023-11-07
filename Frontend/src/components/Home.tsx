import { Inter } from 'next/font/google';
import Header from "./header";
import Navebar  from './Navbar';

// import styles from '../styles/style2.scss'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  
  const handleError = (e : any) => {
    e.target.src = "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
  }
  return (
    <>
      
      <Header />
      <div className="backround2">
    
    <div className="main-container">
      <div className="navcontainer">
      <Navebar />
        
      </div>
      <div className="main">
          <div className="profile debug ">    
            <img src="../img/demo.gif" className='gif' alt="" onError={handleError}/>
            <div className="top_rank">
              <h1>Top Rank</h1>
              
                <div className="column">
                </div>
                <div className="column">
                </div>
                <div className="column">
                </div>
            </div>
            
     </div>
      </div>
    </div>
</div>
    </>
  )
}