import Head from "next/head";
import Image from "next/image";
import Header from "@/components/header";
import Navebar from "@/components/Navbar";
import Switch from "@/components/switch";
// import styles from '../styles/style2.scss'
import { useState, useEffect, useContext } from "react";
import { Friends } from "@/pages/Profile/ProfileLists/Friends";
import { Pending } from "@/pages/Profile/ProfileLists/Pending";
import { Blocked } from "@/pages/Profile/ProfileLists/Blocked";
import { getAvatarQ, uploadAvatarQ } from "@/queries/avatarQueries";
import DisplayHistory from "./ProfileLists/History";
import { userModel } from "@/global/interface";
import { getOtherUser } from "@/queries/userQueries";
import { updateUserNameQ } from "@/queries/updateUserQueries";
import { NotifCxt } from "../App";
import { twoFAGenerate, twoFAOff, twoFAOn } from "@/queries/twoFAQueries";
import { FaUsersSlash } from "react-icons/fa";
import { IconContext } from "react-icons";
import { BiBlock } from "react-icons/bi";
import { FcEditImage } from "react-icons/fc";

const userInfoInit: userModel = {
  id: 0,
  username: "",
  avatar: "",
  friends: [],
  wins: 0,
  loses: 0,
  nGames: 0,
  winrate: 0,
  rank: 0,
  xp: 0,
};

const initUser = (res: any, setUserInfo: any) => {
  userInfoInit.id = res.id;
  userInfoInit.username = res.pseudo;
  userInfoInit.avatar = res.avatar;
  userInfoInit.friends = res.Friends;
  userInfoInit.wins = res.wins;
  userInfoInit.loses = res.loses;
  userInfoInit.winrate = res.winRate === null ? 0 : res.winRate;
  userInfoInit.nGames = res.gamesNumber;
  userInfoInit.rank = res.rank;
  userInfoInit.xp = res.xp;
  setUserInfo(userInfoInit);
};

export const TwoFA = (props: any) => {
  const notif = useContext(NotifCxt);

  const handleTurnOff = (e: any) => {
    e.preventDefault();
    const twoFADactivate = async () => {
      const res = await twoFAOff();
      if (!res) {
        notif?.setNotifText("Deactivation Failed !");
        notif?.setNotifShow(true);
      } else {
        notif?.setNotifText("Deactivation Succes !");
        notif?.setNotifShow(true);
        props.onDeactivate();
        localStorage.setItem("userAuth", "false");
      }
    };
    twoFADactivate();
  };
  return (
    <div>
      <button
        className="glowing-button3 mt-10"
        type="button"
        onClick={
          props.auth === "true" ? (e) => handleTurnOff(e) : props.onClick
        }
      >
        {props.auth === "true" ? "Remove 2FA" : "Activate 2FA"}
      </button>
    </div>
  );
};

export function Activate2FA(props: any) {
  const notif = useContext(NotifCxt);

  const [img, setImg] = useState("");
  const [FACode, setCode] = useState("");

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setCode(value);
  };

  const getQrCode = async () => {
    const res = await twoFAGenerate();
    if (!res)
      setImg(
        "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png"
      );
    else setImg(res);
  };

  useEffect(() => {
    if (props.show && img === "") getQrCode();
  }, [props.show]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const twoFAActivate = async () => {
      const res = await twoFAOn(FACode);
      if (!res) {
        notif?.setNotifText("Wrong code !");
        notif?.setNotifShow(true);
      } else {
        props.onHide();
        props.onSubmit();
        localStorage.setItem("userAuth", "true");
        notif?.setNotifText("TwoFA Activated  !");
        notif?.setNotifShow(true);
      }
    };
    twoFAActivate();
  };
  return (
    <div className=" w-[40rem]  ">
      {img ? (
        <div className=" flex items-center justify-around  ">
          <div className=" flex flex-col items-center justify-center ">
            <IconContext.Provider
              value={{
                color: "red",
                size: "25px",
                style: { cursor: "pointer" },
              }}
            >
              <FaUsersSlash
                onClick={(e: any) => {
                  getQrCode();
                }}
              />
            </IconContext.Provider>
            <p>Generate new Code</p>
          </div>
          <div>
            <img src={img} alt="2FA" />
          </div>
        </div>
      ) : (
        <div>
          {" "}
          <h1> Loading...</h1>
        </div>
      )}
      <div className="  ">
        <div className=" flex flex-col items-center justify-between ">
          <h3> Enter Code </h3>
          <input
            type="text"
            placeholder="6Digit"
            onChange={handleInputChange}
            value={FACode}
            name="code"
            className=" !h-[4rem] !w-[35rem] placeholder-opacity-75 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2  "
          />
        </div>
        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
          <button
            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={props.onHide}
          >
            Close
          </button>
          <button
            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={(e: any) => {
              handleSubmit(e);
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
export default function Profile() {
  const userInit = {
    userName: localStorage.getItem("userName"),
    userLogin: localStorage.getItem("userLogin"),
    auth: localStorage.getItem("userAuth"),
  };
  const [userInfo, setUserInfo] = useState<userModel>(userInfoInit);
  const [fetchedAvatar, setFetchedAvatar] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
  const [pseudo, setPseudo] = useState<string>(
    localStorage.getItem("userName")!
  );
  const [modalShow, setModalShow] = useState(false);
  const [authStatus, setAuthStatus] = useState(userInit.auth);
  const [userInf, setuserInf] = useState(userInit);

  const notif = useContext(NotifCxt);

  const id = localStorage.getItem("userID");
  let lvl = Math.floor(userInfo.xp);
  let xp = parseFloat((userInfo.xp - lvl).toFixed(2));
  let percent = xp * 100;

  const handlePseudoChange = (e: any) => {
    setPseudo(e.target.value);
  };

  const handleUpdatePseudo = (e: any) => {
    if (pseudo) {
      const updatePseudo = async () => {
        const res = await updateUserNameQ(pseudo);
        if (res === "error") {
          notif?.setNotifText(
            "This Pseudo is not available , Please choose a different one !"
          );
          notif?.setNotifShow(true);
        }
      };
      updatePseudo();
    }
  };

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const uploadAvatar = async () => {
        const res = await uploadAvatarQ(selectedFile);
        if (res === "error") {
          notif?.setNotifText(
            "This Image is not available , Please choose a different one !"
          );
          notif?.setNotifShow(true);
        }
      };
      uploadAvatar();
    }
  };

  useEffect(() => {
    const getAvatar = async () => {
      const res: undefined | string | Blob | MediaSource = await getAvatarQ();
      if (res !== undefined && res instanceof Blob)
        setAvatarURL(URL.createObjectURL(res));
      else if (res === "error")
        setAvatarURL(
          "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
        );
    };
    getAvatar();
  }, [fetchedAvatar]);

  useEffect(() => {
    const fetchIsUser = async () => {
      let res;
      if (!isFetched) {
        res = await getOtherUser(+id!);
        if (res !== "error") {
          initUser(res, setUserInfo);
          setIsFetched(true);
        }
      }
    };
    fetchIsUser();
  }, [isFetched]);
  const [users, setUsers] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [showPro, setShowPro] = useState(false);
  const [showfre, setShowFr] = useState(false);

  const toggleAlert = () => {
    setShowFr(false);
    setShowPro(false);
    setShowAlert(true);
  };
  const togglePro = () => {
    setShowPro(true);
    setShowAlert(false);
    setShowFr(false);
  };
  const toggleFriend = () => {
    setShowFr(true);
    setShowPro(false);
    setShowAlert(false);
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="backround2">
        <div className="main-container">
          <div className="navcontainer">
            <Navebar />
          </div>
          <div className="main">
            <div className="profile">
              <div className="login ">
                <div className="w-fit ">
                  <div className=" relative  w-fit ">
                    <img
                      src={avatarURL}
                      className=" w-[20rem] h-[20rem] rounded-full mx-[6rem] mt-4 "
                      alt=""
                    />
                    <label
                      htmlFor="file-ip-1"
                      className=" absolute bottom-0 right-[6rem]  !w-[40px] "
                    >
                      <div className=" absolute top-[10px] !left-[8px] " >
                        <IconContext.Provider
                          value={{
                            color: "red",
                            size: "25px",
                            style: { cursor: "pointer" },
                          }}
                        >
                          <FcEditImage />
                        </IconContext.Provider>
                      </div>
                    </label>
                  </div>
                  <input
                    style={{
                      backgroundColor: "red",
                      width: "0%",
                      height: "0%",
                    }}
                    type="file"
                    id="file-ip-1"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleFileChange}
                  />

                  <h1 className="h">
                    <input
                      style={{ fontSize: "100%" }}
                      value={pseudo}
                      onChange={handlePseudoChange}
                    />
                    <button
                      style={{ marginLeft: "9%", width: "30%" }}
                      className="glowing-button3"
                      onClick={handleUpdatePseudo}
                    >
                      Save
                    </button>
                  </h1>
                </div>
                <div className=" w-[80%] flex items-center justify-center flex-col  ">
                  <div className="w-[80%] h-[5rem] bg-gray-200 rounded-full dark:bg-white border-solid border-2 border-white overflow-hidden relative">
                    <h6 className=" w-full h-full translate-y-2 absolute translate-x-[40%] ">
                      level {lvl} - {percent}%
                    </h6>
                    <div
                      className="bg-[#6D4E9C] h-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full "
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  {modalShow && (
                    <>
                      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                              <h2 className="text-3xl font-semibold">
                                2 Factor Authentication
                              </h2>
                              <button
                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={() => setModalShow(false)}
                              >
                                <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                  ×
                                </span>
                              </button>
                            </div>
                            <div className="relative p-6 flex-auto">
                              <Activate2FA
                                show={modalShow}
                                onSubmit={() => setAuthStatus("true")}
                                onHide={() => setModalShow(false)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                    </>
                  )}
                  <TwoFA
                    auth={authStatus}
                    onClick={() => setModalShow(true)}
                    onDeactivate={() => setAuthStatus("false")}
                  />
                </div>
              </div>
              <div className="list">
                <div
                  style={{
                    position: "relative",
                    width: "80%",
                    height: "50%",
                    marginTop: "3%",
                  }}
                >
                  {showAlert && <Alert2 />}
                  {showfre && <DisplayHistory id={+id!} avatar={avatarURL} />}
                  {showPro && <GameStats infos={userInfo} />}
                </div>
                <div className="b relative flex flex-row justify-center gap-[16px] w-full">
                  <button className="glowing-button" onClick={toggleAlert}>
                    Friends_List
                  </button>
                  <button className="glowing-button" onClick={toggleFriend}>
                    Match_History
                  </button>
                  <button className="glowing-button" onClick={togglePro}>
                    Game_Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const GameStats = ({ infos }: { infos: any }) => {
  return (
    <div className=" p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-2 border-2 border-solid text-center rounded-lg">
          <p className="text-lg font-semibold text-gray-800">RANK</p>
          <p className="text-3xl text-black">{infos.rank}</p>
        </div>
        <div className="p-2 border-2 border-solid text-center rounded-lg">
          <p className="text-lg font-semibold text-gray-800">WINRATE</p>
          <p className="text-3xl text-black">
            {Math.floor(Number(infos.winrate) * 100)} %
          </p>
        </div>
        <div className="p-2 border-2 border-solid text-center rounded-lg">
          <p className="text-lg font-semibold text-gray-800">GAMES PLAYED</p>
          <p className="text-3xl text-black">{infos.nGames}</p>
        </div>
        <div className="p-2 border-2 border-solid text-center rounded-lg">
          <p className="text-lg font-semibold text-gray-800">WINS</p>
          <p className="text-3xl text-black">{infos.wins}</p>
        </div>
        <div className="p-2 border-2 border-solid text-center rounded-lg">
          <p className="text-lg font-semibold text-gray-800">LOSES</p>
          <p className="text-3xl text-black">{infos.loses}</p>
        </div>
      </div>
    </div>
  );
};

const Alert2 = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showfre, setShowFr] = useState(true);

  console.log();

  const toggleAlert = () => {
    setShowFr(false);
    setShowPro(false);
    setShowAlert(true);
  };
  const togglePro = () => {
    setShowPro(true);
    setShowAlert(false);
    setShowFr(false);
  };
  const toggleFriend = () => {
    setShowFr(true);
    setShowPro(false);
    setShowAlert(false);
  };

  return (
    <>
      <div className="name">
        <button className="glowing-button2" onClick={toggleFriend}>
          Friends
        </button>
        <button className="glowing-button2" onClick={togglePro}>
          Pending
        </button>
        <button className="glowing-button2" onClick={toggleAlert}>
          Blocked
        </button>
      </div>
      {showfre && <Friends />}
      {showPro && <Pending />}
      {showAlert && <Blocked />}
    </>
  );
};
