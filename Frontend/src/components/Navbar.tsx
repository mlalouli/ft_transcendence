import { useAuth } from '@/global/context';
import Link from 'next/link';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navebar() {
  const navigate = useNavigate();
  const location = useLocation();
  let auth = useAuth();
  
    return (
        <nav className="nav">
          <div className="nav-upper-options">
            
          <button  onClick={()=>navigate("/Profile")}   style={{backgroundColor:"transparent",border:"none"}}><div className="nav-option">
              <img src=
              "../img/p.png"
              className="nav-img"
              alt="blog" />
              <h3 style={{color:"black", }} > Profile</h3>
            </div></button>
            <button onClick={()=>navigate("/Game")} style={{backgroundColor:"transparent",border:"none"}}> <div className="nav-option">
              <img src=
              "../img/6.png"
              className="nav-img"
              alt="articles"/>
              <h3 style={{color:"black", }}> Game</h3>
            </div></button>
            
            <button  onClick={()=>navigate("/Chat")} style={{backgroundColor:"transparent",border:"none"}}> <div className="nav-option">
              <img src=
              "../img/9.png"
              className="nav-img"
              alt="report"/>
              <h3 style={{color:"black", }}> Chat</h3>
            </div> </button>
            
            <button onClick= { () => {auth.signOut(()=> navigate("/Login"))}} style={{backgroundColor:"transparent",border:"none"}}><div className="nav-option logout">
              <img  src=
              "../img/i.png"
              className="nav-img"
              alt="logout"/>
              <h3>Logout</h3>
            </div></ button>
            
          </div>
        </nav>
    );
}