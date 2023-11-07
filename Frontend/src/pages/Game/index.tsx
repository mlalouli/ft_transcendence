import Header from "@/components/header";
import Navebar  from '@/components/Navbar';;
import GameCanvas from "@/components3/multiplayers/GameCanvas";

export default function Game({privateGame}: {privateGame: boolean}) {
    return (
      <>
        <Header />
        <div className="backround2">
          <div className="main-container">
            <div className="navcontainer">
              <Navebar />
            </div>
            <div className="main">   
              <GameCanvas privateGame = {privateGame}/>
            </div>
          </div>
        </div>
      </>
    );
};