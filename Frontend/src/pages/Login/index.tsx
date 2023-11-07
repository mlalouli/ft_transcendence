import { useCallback, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import { useAuth } from '@/global/context';
import { getUserData } from '@/queries/userQueries';
import { NotifCxt } from '@/pages/App';


export default function Login() {
    const notif = useContext(NotifCxt);
    let navigate = useNavigate();
    let auth = useAuth();
    let location = useLocation();
    const hrefURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/intra/signIn";
    console.log(hrefURL);
    

    const userSignIn = useCallback(() => {
        let username = localStorage.getItem("userName");
        console.log("username", username);
        if (username)
            auth.signIn(username, () => {
                navigate("/Home", {replace : true});
                window.location.reload();
            });
        console.log("user is signed in"); 
    },[navigate, auth]);

    useEffect(() => {
        const accessToken = location.search.split("=")[1];
        if (accessToken){
            console.log(accessToken);
            localStorage.setItem("userToken", accessToken);

            const fetchData = async() => {
                const data = await getUserData();
                if ( data === "error") {
                    notif?.setNotifText("Error: Please retry later!");
                }
                else {
                    userSignIn();
                    notif?.setNotifText("Welcome "+ localStorage.getItem("userName") + "!");
                }
                notif?.setNotifShow(true);
            };
            fetchData();
        }
    }, [location.search]);
    const styl ={
        position:"relative", 
        width:"100%",
         height:"80%" ,
         display: "flex",
          flexwrap: "wrap", 
           fontsize: "30px",
            marginTop:"13%"
    }
    return <>
        <div className="backround" >
            <div className='All' style={styl}>
            <div style={{position:"relative", width:"80%",  padding: "2px", flex: "50%", marginLeft:"4%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px"}}>
            <div className="row">
                <div className="type" >
                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter.typeString('Pong, groundbreaking electronic game released in 1972 by the American game manufacturer Atari, Inc. One of the earliest video games.')
                            .callFunction(() => {
                                console.log('String typed out!');
                            })
                            .pauseFor(100)
                            // .deleteAll()
                            .callFunction(() => {
                                console.log('All strings were deleted');
                            })
                            .start();
                        }}          
                    />
                </div>
            </div>
            <div className='row2' >
                <button style={{position:"relative",height:"100%", width:"100%" , border:"none", backgroundColor:"transparent", borderRadius:"47px"}}><h1 ><Link to={hrefURL} style={{color:"white"}}>42 <br />Continue with Intra</Link></h1></button>
            </div>
            </div>
            <div className='gif2'><img src='/img/log.gif' /></div>
            </div>
            
    </div>
    </>
} 