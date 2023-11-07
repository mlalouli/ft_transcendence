import Link  from "next/link";
import { useEffect, useState } from "react";
import { SearchBar } from "../components1/SearchBar";
import { SearchResultsList } from "../components1/SearchResultsList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/global/context";
import { getAvatarQ } from "@/queries/avatarQueries";
import { ItableRow } from "@/global/interface";
export default function Header() {


  const navigate = useNavigate();
  const [fetchedAvatar, setFetchedAvatar] = useState(false);
    const [avatarURL, setAvatarURL] = useState('');
    const [results, setResults] = useState<ItableRow[]>([]);
    const [showAlert, setShowAlert] = useState(false);



    useEffect(() => {
      const getAvatar = async () => {
        const res :  undefined | string | Blob | MediaSource = await getAvatarQ();
        if (res !== undefined && res instanceof Blob)
          setAvatarURL(URL.createObjectURL(res));
        else if (res === "error")
          setAvatarURL("https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg");
      };
      getAvatar();
    }, [fetchedAvatar])

    
  const toggleAlert = () =>{
     if (showAlert){
      setShowAlert(false);
      return 
      }
    setShowAlert(true);
  };
  const handleError = (e : any) => {
    e.target.src = "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
  }
    return (
      <header>

        <div className="logosec">
          <button onClick={()=>navigate("/Home")} style={{background:"transparent", border:"none", color:"#329fb8"}} ><h1 >PONG</h1></button></div>
        <div className="nav0">
          <button onClick={toggleAlert}><img src=
            "../img/50.png"
            className="icn menuicn"
            id="menuicn"
            alt="menu-icon"
            onError={handleError}/></button></div>
            {showAlert && <Alert />}
            
        
              
                <div className="searchbar">
                  {/* <input type="text"
                    placeholder="Search"/>
                    <div className="searchbtn">
                    
                    <img src=
                    "../img/20.png"
                    className="icn srchicn"
                    alt="search-icon"/>
                  </div> */}
                  <div className="search-bar-container" ></div>
              
                  <SearchBar onSelect = {(list) => {setResults(list)}} />
                  {results && results.length > 0 && <SearchResultsList results={results} />}
                    </div>
                <div className="message">
                  <div className="circle">
                  
                  <button style={{marginLeft:"100%"}}><img  src=
            "../img/5.png"
                    className="icn"
                    alt=""/></button></div>
                  <div className="dp">
                  <img src= {avatarURL}
              className="dpicn"
              alt="dp"/></div>
          
        </div>
        
      </header>
    );
}

const Alert = () =>{
  const navigate = useNavigate();
  const auth = useAuth();
  return <>
    {/* <Navbar /> */}
    <div className="bu" style={{backgroundColor:"transparent", width:"50%", height:"80%",  }}>
    <button  onClick={()=>navigate("/Profile")} style={{width:"100%", height:"50%"}}>Profile</button>
    <button onClick={()=>navigate("/Game")} style={{width:"100%", height:"50%"}}>Game</button>
    <button  onClick={()=>navigate("/Chat")}style={{width:"100%", height:"50%"}}>Chat</button>
    <button onClick= { () => {auth.signOut(()=> navigate("/Login"))}} style={{width:"20%", height:"50%"}}>Logout</button>
      </div>
  </>
};