import Header from "../../components/header";
import Navebar  from '../../components/Navbar';
import { useContext, useEffect, useState} from "react";
import { NotifCxt } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/global/context";
import { twoFAAuth } from "@/queries/twoFAQueries";


export default function TwoFAValidation() {
  const notif = useContext(NotifCxt);
  let location = useLocation();
  let navigate = useNavigate();
  let auth = useAuth();
  let userName = localStorage.getItem('userName');
  const [twoFA, setTwoFA] = useState("");

  const handleInputChange = (e: any) => {
    const {value} = e.target;
    setTwoFA(value);
  }

  useEffect(() => {
    const URLUserName = location.search.split('=')[1];
    if (URLUserName){
      localStorage.setItem('userName', URLUserName);
      navigate('/TwoFA')
    }
  }, [location.search, navigate]);

  const handleClick = (e: any) =>{
    e.preventDefault();

    const userSignIn = () => {
      let userName = localStorage.getItem('userName');      
      if (userName)
        auth.signIn(userName, () => {
          navigate('/Home',{replace: true});
      });
    }
    
    if (userName !== 'undefined' && userName){
      const check = async(userName: string) => {
        const res = await twoFAAuth(twoFA, userName, userSignIn);
        if (!res) {
          notif?.setNotifShow(true);
          notif?.setNotifText('Wrong Code !');
        }
      }
      check(userName);
    }else
      console.log('undefined Username');
      
  }
    return (
      <>
      <div className="backround2">
       
            <div className="profile" style={{height:"50%", width:"50%", marginLeft:'25%', marginTop:"5%"}}>
              <div style={{ height:"10%"}}><h1 >Verification code</h1>
              </div>
              <div className="profile"style={{height:"50%", width:"50%"}}>
                <div className="inputBox" style={{height:"30%", background:"#CDB8DF", borderRadius:"50px"}}>
                  <input type="text"
                       placeholder="Enter  6 digits"
                       style={{height:"50%", width:"100%", fontSize:"40px", textAlign:"center", marginTop:"4%"  }}
                       onChange={handleInputChange}
                       value={twoFA} />
                </div>
                <div>
                  <button
                    type="submit"
                    className="glowing-button3"
                    onClick={(e:any) => {handleClick(e)}}>
                      Submit
                  </button>
                </div>
              </div>
            </div>


      </div>
      </>
    );
};