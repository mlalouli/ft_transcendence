import React, { useContext, useState, useEffect, useRef } from "react";
import Header from "@/components/header";
import Navebar from "@/components/Navbar";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { IoPersonAddOutline, IoEnterOutline } from "react-icons/io5";
import { BiBlock } from "react-icons/bi";
import { CgUnblock } from "react-icons/cg";
import { RiAdminLine, RiVolumeMuteLine } from "react-icons/ri";
import {FcEditImage, FcSettings} from "react-icons/fc"
import { VscUnmute } from "react-icons/vsc";
import { MdSupervisedUserCircle, MdGroups2 } from "react-icons/md";
import { FaUsersSlash } from "react-icons/fa";
import { IoMdCloseCircleOutline, IoIosAddCircle } from "react-icons/io";
import { FaTableTennisPaddleBall } from "react-icons/fa6";
import {HiLockClosed ,HiLockOpen} from "react-icons/hi2"
import { SiAddthis } from "react-icons/si";
import { getFriends } from "@/queries/friendsQueries";
import { initializeSocket } from "../Socket/socket";
import {
  getAvatarQ,
  getChannelAvatar,
  getUserAvatar,
  uploadCAvatarQ,
} from "@/queries/avatarQueries";
import {
  chatElement,
  updateChannel,
  updateUser,
  suggestion,
  fetchDm,
  DmDto,
  oneMsg,
  MessageDto,
  user,
  gameInvitation,
  mute,
  ChannelDto,
  userElement,
  setting,
} from "./type/chat.type";
import { NotifCxt, UserStatusCxt } from "../App";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { useNavigate } from "react-router-dom";
import { Player } from "../Game/interface/game.interface";
import { IUserStatus } from "@/global/interface";
import { IconContext } from "react-icons";

declare var global: {
  selectedChat: chatElement;
  setSelectedUser: user;
  onlineStatus: number | undefined;
};

type Popup = {
  togglePopup: (event: React.MouseEvent<HTMLElement>) => void;
};
export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<chatElement | undefined>(
    undefined
  );
  const [newRoomRequest, setNewRoomRequest] = useState(false);
  const [settingRequest, setSettingRequest] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [outsider, setOutsider] = useState<boolean | undefined>(undefined);
  const [show, setShow] = useState<boolean | undefined>(undefined);
  const [role, setRole] = useState("");
  const [blockedList, setBlockedList] = useState<[]>([]);
  const notif = useContext(NotifCxt);
  const [updateStatus, setUpdateStatus] = useState(0);
  const login = localStorage.getItem("login");
  const socket = initializeSocket();

  useEffect(() => {
    socket.on("exception", (data) => {
      if (data.message) notif?.setNotifText("error2: " + data.message);
      else notif?.setNotifText("error: " + data);
      notif?.setNotifShow(true);
    });

    socket.on("fetch role", (data) => {
      setRole(data);
    });

    socket.on("fetch blocked", (data: []) => {
      setBlockedList(data);
    });

    socket.on("update channel request", (data) => {
      setUpdateStatus((u) => u + 1);
    });

    return () => {
      socket.off("exception");
      socket.off("fetch role");
      socket.off("fetch blocked");
      socket.off("update channel request");
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setOutsider(role === "noRole" ? true : false);
      socket.emit("read blocked", login);
    }
  }, [selectedChat, role, login, updateStatus]);

  useEffect(() => {
    if (selectedChat) setShow(!selectedChat.hasPassword || !outsider);
  }, [outsider]);

  useEffect(() => {
    if (show && selectedChat) {
      const cId = selectedChat.id;
      socket.emit("read msgs", cId);
      socket.emit("get setting", cId);
    }
  }, [updateStatus, selectedChat, show]);

  const newRoomCardDisappear = () => {
    setNewRoomRequest((old) => {
      return !old;
    });
  };

  const settingCardDisappear = () => {
    setSettingRequest((old) => {
      return !old;
    });
  };

  // ########################################################
  const styl = {
    display: "flex",
    flexwrap: "wrap",
    fontsize: "30px",
  };
  const st = {
    height: "15%",
    borderRadius: "10%",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0px 0px 50px -25px rgba(0, 0, 0, 0.50)",
    backdropFilter: "blur(50px)",
    padding: "3%",
  };

  const [showF, setShowF] = useState(true);
  const [showC, setShowC] = useState(false);
  const [showAD, setShowAD] = useState(false);
  const [showpo, setShowpo] = useState(false);
  const [showpr, setShowpr] = useState(true);
  const [showpb, setShowpb] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [settings, setSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const toggleF = () => {
    setShowF(true);
    setShowC(false);
  };

  const toggleC = () => {
    setShowC(true);
    setShowF(false);
  };
  const toggleAD = () => {
    if (showAD) {
      setShowAD(false);
      return;
    }

    setShowAD(true);
  };

  const togglepo = () => {
    setSettings(false);
    setShowpo(true);
    setShowpb(false);
    setShowpr(false);
  };
  const togglepr = () => {
    setSettings(false);
    setShowpb(false);
    setShowpr(true);
    setShowpo(false);
  };
  const togglepb = () => {
    setSettings(false);
    setShowpr(false);
    setShowpb(true);
    setShowpo(false);
  };

  const toggleSettings = () => {
    setSettings(true);
    setShowpr(false);
    setShowpb(false);
    setShowpo(false);
  }

  const setStates = (data: chatElement | undefined, avatar: any) => {
    setShowMsg(true);
    setSelectedChat(data);
    setAvatar(avatar);
  };

  return (
    <>
      <Header />
      <div className="backround2">
        <div className="main-container">
          <div className="navcontainer">
            <Navebar />
          </div>
          <div className="main" style={styl}>
            <div className="container" style={{ flex: "1" }}>
              <div className="chatpb  " style={st}>
                <button
                  onClick={toggleF}
                  className="glowing-button"
                  style={{
                    flex: "1",
                    width: "10%",
                    height: "70%",
                    borderRadius: "10%",
                    marginTop: "4%",
                    color: "white",
                    fontFamily: "revert-layer",
                    fontSize: "100%",
                    fontWeight: "100%",
                    lineHeight: "normal",
                    textAlign: "center",
                    padding: "5% 0",
                  }}
                >
                  Direct Chat
                </button>
                <button
                  onClick={toggleC}
                  className="glowing-button"
                  style={{
                    flex: "1",
                    width: "10%",
                    height: "70%",
                    borderRadius: "10%",
                    marginTop: "4%",
                    color: "white",
                    fontFamily: "revert-layer",
                    fontSize: "100%",
                    fontWeight: "100%",
                    lineHeight: "normal",
                    textAlign: "center",
                    padding: "5% 0",
                  }}
                >
                  Channels
                </button>
                <Popup
                  className="pop"
                  contentStyle={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.06) 100%)",
                    boxShadow: "0px 0px 50px -25px rgba(0, 0, 0, 1)",
                    backdropFilter: "blur(50px",
                    marginLeft: "5%",
                    marginTop: "2%",
                    width: "15%",
                    height: "20%",
                  }}
                  trigger={
                    <button
                      onClick={toggleAD}
                      style={{
                        backgroundColor: "transparent",
                        width: "5%",
                        height: "30%",
                        border: "none",
                        borderRadius: "0%",
                      }}
                    >
                      <IconContext.Provider
                        value={{
                          color: "#27b84b",
                          size: "30px",
                          style: { cursor: "pointer" },
                        }}
                      >
                        <SiAddthis />
                      </IconContext.Provider>
                    </button>
                  }
                  position="right center"
                >
                  <div
                    className=" debug "
                    style={{
                      flex: "1",
                      width: "100%",
                      height: "25%",
                      background: "transparent",
                    }}
                  >
                    <button
                      className="glowing-button"
                      onClick={togglepr}
                      style={{
                        flex: "1",
                        width: "33.30%",
                        height: "90%",
                        borderRadius: "5%",
                      }}
                    >
                      Public
                    </button>
                    <button
                      className="glowing-button"
                      onClick={togglepb}
                      style={{
                        flex: "1",
                        width: "33.30%",
                        height: "90%",
                        borderRadius: "5%",
                      }}
                    >
                      Private
                    </button>
                    <button
                      className="glowing-button"
                      onClick={togglepo}
                      style={{
                        flex: "1",
                        width: "33.30%",
                        height: "90%",
                        borderRadius: "5%",
                      }}
                    >
                      Protected
                    </button>
                  </div>
                  {showpr && <Public />}
                  {showpb && <Private />}
                  {showpo && <Protected />}
                </Popup>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "85%",
                  overflow: "scroll",
                  overflowX: "hidden",
                }}
              >
                {/* {showC && <Alert/>} */}
                {showC && (
                  <Preview
                    current={selectedChat}
                    onSelect={(chat) => {
                      setSelectedChat(chat);
                    }}
                    onNewRoomRequest={() => {
                      setNewRoomRequest((old) => {
                        return !old;
                      });
                    }}
                    updateStatus={updateStatus}
                    blockedList={blockedList}
                    setStates={(data, avatar) => {
                      setStates(data, avatar);
                    }}
                    type="CHANNEL"
                  />
                )}
                {showF && (
                  <Preview
                    current={selectedChat}
                    onSelect={(chat) => {
                      setSelectedChat(chat);
                    }}
                    onNewRoomRequest={() => {
                      setNewRoomRequest((old) => {
                        return !old;
                      });
                    }}
                    updateStatus={updateStatus}
                    blockedList={blockedList}
                    setStates={(data, avatar) => {
                      setStates(data, avatar);
                    }}
                    type="DM"
                  />
                )}
              </div>
            </div>
            {/* <div>{showAD && <Private />}</div> */}
            <div
              style={{
                boxShadow: "0px 0px 50px -25px rgba(0, 0, 0, 0.50)",
                backdropFilter: "blur(50px)",
                flex: "2",
                display: "row",
              }}
            >
              {/* <div>{showpo && <ChannelP />}</div> */}
              {/* {showMsg && <Messages /> } */}
              {showMsg && (
                <Room
                  current={selectedChat}
                  show={show}
                  role={role}
                  outsider={outsider}
                  updateStatus={updateStatus}
                  setSettingRequest={() => {
                    setSettingRequest((old) => {
                      return !old;
                    });
                  }}
                  blockedList={blockedList}
                  avatar={avatar}
                  onSelect={(chat) => {
                    setSelectedChat(chat);
                  }}
                  showMsg={() => {
                    setShowMsg(false);
                  }}
                />
              )}
            </div>
            {selectedChat && selectedChat?.type !== "DIRECT" ? (
              <div
                style={{
                  background: "",
                  border: "2px black solid",
                  marginLeft: "10px",
                  width: "20%",
                }}
              >
                <MemberStatus
                  current={selectedChat}
                  role={role}
                  blockedList={blockedList}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );

  //     <>
  //     <Header />
  //     <div className="backround2">

  //   <div className="main-container">
  //     <div className="navcontainer">
  //     <Navebar />

  //     </div>
  //     <div className='home'>
  //         <div className="container">

  //     <Sidebar />
  //     <div className='chat'>
  //         <div className="chatInfo">
  //             <div className="chatIcons">
  //                 <img src='/img/0.png' alt='' />
  //             </div>
  //         </div>
  //             {/* <Messages />
  //             <Input /> */}
  //     </div>
  //         </div>
  //     </div>
  //   </div>
  // </div>
  //   </>
  //   );
}

function Room({
  current,
  show,
  role,
  outsider,
  setSettingRequest,
  blockedList,
  updateStatus,
  avatar,
  onSelect,
  showMsg,
}: {
  current: chatElement | undefined;
  show: boolean | undefined;
  role: string;
  outsider: boolean | undefined;
  setSettingRequest: () => void;
  blockedList: [];
  updateStatus: number;
  avatar: any;
  onSelect: (chatPreview: chatElement | undefined) => void;
  showMsg: () => void;
}) {
  const login = localStorage.getItem("userLogin");
  return (
    <MsgStream
      login={login}
      cId={current!.id}
      blockedList={blockedList}
      avatar={avatar}
      current={current}
      role={role}
      outsider={outsider}
      updateStatus={updateStatus}
      onSelect={onSelect}
      showMsg={showMsg}
    />
  );
}

function MsgStream({
  login,
  cId,
  blockedList,
  avatar,
  current,
  role,
  outsider,
  updateStatus,
  onSelect,
  showMsg,
}: {
  login: string | null;
  cId: number;
  blockedList: [];
  avatar: any;
  current: chatElement | undefined;
  role: string;
  outsider: boolean | undefined;
  updateStatus: number;
  onSelect: (chatPreview: chatElement | undefined) => void;
  showMsg: () => void;
}) {
  const [msgs, setMsgs] = useState<oneMsg[]>([]);
  const scroll = useRef<HTMLDivElement>(null);
  const socket = initializeSocket();

  useEffect(() => {
    socket.on("fetch msgs", (msgs: oneMsg[]) => {
      setMsgs(msgs);
    });

    socket.on("broadcast", (msg: oneMsg) => {
      if (msg.cId == cId) setMsgs((oldMsgs) => [...oldMsgs, msg]);
    });

    return () => {
      socket.off("fetch msgs");
      socket.off("broadcast");
    };
  }, [cId, msgs]);

  
  setTimeout(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, 30);
  return (
    <>
      <RoomStatus
        current={current}
        avatar={avatar}
        role={role}
        outsider={outsider}
        updateStatus={updateStatus}
        blockedList={blockedList}
        onSelect={onSelect}
        showMsg={showMsg}
      />
      <div
        style={{
          background: "transparent",
          width: "100%",
          height: "83%",
          display: "flex",
          overflow: "scroll",
          overflowX: "hidden",
        }}
        ref={scroll}
      >
        <div
          style={{ flex: "1", background: "transparent", display: "table-row" }}
        >
          {msgs && !outsider &&
            msgs.map((value, index) => {
              const isBlocked = blockedList.find((blocked: any) => {
                return value.oId === blocked.id;
              });
              return isBlocked ? (
                <div key={index}> </div>
              ) : (
                <div key={index}>
                  <OneMessage data={value} login={login} />
                </div>
              );
            })}
        </div>
      </div>
      <Input cId={current!.id} login={login} />
    </>
  );
}

function RoomStatus({
  current,
  avatar,
  role,
  outsider,
  updateStatus,
  blockedList,
  onSelect,
  showMsg,
}: {
  current: chatElement | undefined;
  avatar: any;
  role: string;
  outsider: boolean | undefined;
  updateStatus: number;
  blockedList: [];
  onSelect: (chatPreview: chatElement | undefined) => void;
  showMsg: () => void;
}) {
  const [add, setAdd] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const login = localStorage.getItem("userLogin");
  const socket = initializeSocket();
  useEffect(() => {
    if (current)
      socket.emit("read room status", {
        cId: current?.id,
        login: login,
      });
  }, [updateStatus, current, login]);

  const toggleSettings = () => {
    if (showSettings) {
      setShowSettings(false);
      return;
    }
    setShowSettings(true);
  };

  return (
    <div
      style={{
        position: "relative",
        height: "10%",
        width: "100%",
        background: "#D1D1D1",
        display: "flex",
      }}
    >
      <div
        style={{
          background: "#D1D1D1",
          height: "70%",
          width: "7%",
          borderRadius: "100%",
          marginTop: "1%",
          marginLeft: "1%",
        }}
      >
        <img
          style={{ height: "100%", width: "100%", borderRadius: "100%" }}
          src={avatar}
        />
      </div>
      <div style={{ marginTop: "3%", marginLeft: "1%", color: "#361387" }}>
        {current!.name}
      </div>
      {current?.type !== "DIRECT" ? (
        <div>
          <JoinChannel
            cId={current?.id}
            outsider={outsider}
            hasPassword={current?.hasPassword}
            onSelect={onSelect}
            showMsg={showMsg}
          />
        </div>
      ) : null}
      {current?.type !== "DIRECT"  && role === "owner" ?  (
        <Popup
        className="pop "
        contentStyle={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.06) 100%)",
          boxShadow: "0px 0px 50px -25px rgba(0, 0, 0, 1)",
          backdropFilter: "blur(50px",
          marginLeft: "5%",
          marginTop: "2%",
          width: "20%",
          height: "20%",
          display: "gred",
        }}
        trigger={
          <button
            onClick={toggleSettings}
            style={{
              backgroundColor: "transparent",
              width: "10%",
              height: "50%",
              border: "none",
              borderRadius: "100%",
            }}
          >
            <IconContext.Provider
              value={{
                color: "#27b84b",
                size: "30px",
                style: { cursor: "pointer" },
              }}
            >
              <FcSettings />
            </IconContext.Provider>
          </button>
        }
        position="right center"
      >
        <div
          className="chnnel  "
          style={{
            flex: "1",
            width: "100%",
            height: "40%",
            background: "transparent",
          }}
        >
          <button
            className="glowing-button"
            style={{
              flex: "1",
              width: "33.30%",
              height: "50%",
              borderRadius: "5%",
              marginTop: "5%",
              marginLeft:"35%"
            }}
          >
            Settings
          </button>
        </div>
        <Settings channelId = {current?.id} />
      </Popup>
      ) : ""}
    </div>
  );
}

function MemberStatus({
  current,
  role,
  blockedList,
}: {
  current: chatElement | undefined;
  role: string;
  blockedList: [];
}) {
  const [owner, setOwner] = useState<user[] | null>([]);
  const [admins, setAdmins] = useState<user[] | null>([]);
  const [members, setMembers] = useState<user[] | null>([]);
  const [banned, setBanned] = useState<user[] | null>([]);

  const socket = initializeSocket();
  useEffect(() => {
    socket.on("fetch owner", (data: user[] | null) => {
      setOwner(data);
    });
    socket.on("fetch admins", (data: user[] | null) => {
      setAdmins(data);
    });
    socket.on("fetch members", (data: user[] | null) => {
      setMembers(data);
    });
    socket.on("fetch banned", (data: user[] | null) => {
      setBanned(data);
    });
    return () => {
      socket.off("fetch owner");
      socket.off("fetch admins");
      socket.off("fetch members");
      socket.off("fetch banned");
    };
  }, [current]);
  return (
    <>
      <div>
        <p
          style={{
            background: "gray", // change later
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            paddingTop: "10px",
            paddingBottom: "10px",
            display: owner?.length ? "flex" : "none",
            fontWeight: 900,
            fontSize: "14px",
          }}
        >
          Owner
        </p>
      </div>
      <div style={{ height: "fit", maxHeight: "20rem" }}>
        <Status
          users={owner}
          current={current}
          role={role}
          blockedList={blockedList}
          type="owner"
          owner={owner![0]}
        />
      </div>
      <div>
        <p
          style={{
            background: "gray", // change later
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            paddingTop: "10px",
            display: admins?.length ? "flex" : "none",
            fontWeight: 900,
            fontSize: "14px",
          }}
        >
          ADMINS
        </p>
      </div>
      <div
        className=""
        style={{ height: "30rem", overflow: "hidden", overflowY: "scroll" }}
      >
        <Status
          users={admins}
          current={current}
          role={role}
          blockedList={blockedList}
          type="admins"
          owner={owner![0]}
        />
      </div>
      <div>
        <p
          style={{
            background: "gray", // change later
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            paddingTop: "10px",
            display: members?.length ? "flex" : "none",
            fontWeight: 900,
            fontSize: "14px",
          }}
        >
          MEMBERS
        </p>
      </div>
      <div style={{ height: "30rem", overflow: "hidden", overflowY: "scroll" }}>
        <Status
          users={members}
          current={current}
          role={role}
          blockedList={blockedList}
          type="members"
          owner={owner![0]}
        />
      </div>
      <div>
        <p
          style={{
            background: "gray", // change later
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            paddingTop: "10px",
            display: banned?.length ? "flex" : "none",
            fontWeight: 900,
            fontSize: "14px",
          }}
        >
          Banned
        </p>
      </div>
      <div
        style={{
          height: "calc(100% - 93rem)",
          overflow: "hidden",
          overflowY: "scroll",
        }}
      >
        <Status
          users={banned}
          current={current}
          role={role}
          blockedList={blockedList}
          type="banned"
          owner={owner![0]}
        />
      </div>
    </>
  );
}

function Status({
  users,
  current,
  role,
  blockedList,
  type,
  owner,
}: {
  users: user[] | null;
  current: chatElement | undefined;
  role: string;
  blockedList: [];
  type: string;
  owner: user | null;
}) {
  const socket = initializeSocket();
  const login = localStorage.getItem("userLogin");
  const [selData, setSelData] = useState<any>(null);
  // const {show} = useContextMenu();
  const [hide, setHide] = useState<any>();
  const usersStatus = useContext(UserStatusCxt);
  const navigate = useNavigate();

  useEffect(() => {
    if (selData && selData.event) {
      if (hide) hide();
    }
  }, [selData, hide, usersStatus, blockedList]);
  return (
    <>
      {users?.map((value, index) => {
        return type === "admins" && value.id === owner?.id ? null : (
          <div className="" key={index}>
            <OneStatus
              data={value}
              setSelData={setSelData}
              setHide={setHide}
              blockedList={blockedList}
              role={role}
              current={current}
            />
          </div>
        );
      })}
    </>
  );
}

function OneStatus({
  data,
  setSelData,
  setHide,
  blockedList,
  role,
  current,
}: {
  data: user;
  setSelData: (d: any) => void;
  setHide: (d: any) => void;
  blockedList: [];
  role: string;
  current: chatElement | undefined;
}) {
  const id = localStorage.getItem("userID");

  const login = localStorage.getItem("userLogin");
  const [avatarURL, setAvatarURL] = useState("");
  const usersStatus = useContext(UserStatusCxt);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const isBlocked = blockedList.some((v: any) => v.id === data.id);
  useEffect(() => {
    const getAvatar = async () => {
      const res: undefined | string | Blob | MediaSource = await getUserAvatar(
        data.id
      );
      if (res !== undefined && res instanceof Blob) {
        setAvatarURL(URL.createObjectURL(res));
      }
    };
    getAvatar();

    let found = undefined;
    found = usersStatus?.find((map: IUserStatus) => map.key === data.id);
    if (found !== undefined) {
      switch (found.userModel.status) {
        case 0:
          setStatus("status-offline");
          break;
        case 1:
          setStatus("status-online");
          break;
        case 2:
          setStatus("status-inGame");
          break;
      }
    }
  }, [data.id, usersStatus]);

  const socket = initializeSocket();

  function handleMute(mins: number) {
    let update: mute = {
      duration: mins,
      login: data.login,
      cId: current!.id,
    };
    socket.emit("mute user", update);
  }

  function handleAddFriend() {
    let update: updateUser = {
      login: login,
      otherId: data.id,
    };
    socket.emit("add friend", update);
  }

  function handleBlockUser() {
    let update: updateUser = {
      login: login,
      otherId: data.id,
    };
    socket.emit("block user", update);
  }

  function handleUnblockUser() {
    let update: updateUser = {
      login: login,
      otherId: data.id,
    };
    socket.emit("unblock user", update);
  }

  function handleKick() {
    let update: updateChannel = {
      cId: current!.id,
      login: login,
      password: "",
      tId: data.id,
      type: current?.type,
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("kick", update);
  }

  function handleBeAdmin() {
    let update: updateChannel = {
      cId: current!.id,
      login: login,
      password: "",
      tId: data.id,
      type: current?.type,
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("be admin", update);
  }

  function handleNotAdmin() {
    let update: updateChannel = {
      cId: current!.id,
      tId: data.id,
      type: current?.type,
      login: login,
      hasPassword: false,
      password: "",
      newPassword: "",
    };
    socket.emit("not admin", update);
  }

  function handleBan() {
    let update: updateChannel = {
      cId: current!.id,
      login: login,
      password: "",
      tId: data.id,
      hasPassword: false,
      type: current?.type,
      newPassword: "",
    };
    socket.emit("ban", update);
  }

  function handleUnBan() {
    let update: updateChannel = {
      cId: current!.id,
      tId: data.id,
      type: current?.type,
      login: login,
      hasPassword: false,
      password: "",
      newPassword: "",
    };
    socket.emit("unBan", update);
  }

  // const handleMenu = (event: any) => {
  //   // let {hideAll} = useContextMenu({id: JSON.stringify(global.setSelectedUser)});
  //   // setHide(hideALL);
  //   global.setSelectedUser = data;
  //   global.onlineStatus = usersStatus?.find(
  //     (map: IUserStatus) => map.key === data.id
  //   )?.userModel.status;
  //   global.setSelectedUser.isBlocked = blockedList.find(
  //     (map: any) => map.id === data.id
  //   )!;
  //   global.setSelectedUser.online = global.onlineStatus === 1;

  //   event.preventDefault();
  //   setSelData({ data: data, event: event });
  // };

  return (
    <div
      className=" channelMember  w-[95%] "
      style={{
        display: data ? "" : "none",
        border: "1px rgb(46, 3, 86) solid",
        height: "8rem",
        margin: "0 5px 10px 5px",
        borderRadius: "30px",
      }}
      // onContextMenu={login !== data?.login ? (e) => handleMenu(e) : undefined}
    >
      <div
        className="   !w-[80%] h-full flex flex-col   "
        onClick={() => navigate("/Public/" + data?.id)}
      >
        <div className=" flex items-center justify-center flex-col  max-w-[100px] ">
          <div>
            <img
              style={{
                height: "35px",
                width: "35px",
                borderRadius: "100%",
                marginTop: "10px",
              }}
              src={avatarURL}
            />
          </div>
          <div className=" memberName ">{data!.pseudo}</div>
        </div>
      </div>
      {data.id !== +id! ? (
        <div className=" rightCard ">
          <div>
            {!data.isOwner && role === "owner" && !data.isBanned ? (
              data.isAdmin ? (
                <IconContext.Provider
                  value={{
                    color: "white",
                    size: "25px",
                    style: { cursor: "pointer" },
                  }}
                >
                  <RiAdminLine onClick={handleNotAdmin} />
                </IconContext.Provider>
              ) : (
                <IconContext.Provider
                  value={{
                    color: "gold",
                    size: "25px",
                    style: { cursor: "pointer" },
                  }}
                >
                  <MdSupervisedUserCircle onClick={handleBeAdmin} />
                </IconContext.Provider>
              )
            ) : null}
          </div>
          <div>
            {!data.isOwner &&
            (role === "owner" || (role === "admin" && !data.isAdmin)) ? (
              !data.isBanned ? (
                <IconContext.Provider
                  value={{
                    color: "black",
                    size: "25px",
                    style: { cursor: "pointer" },
                  }}
                >
                  <FaUsersSlash onClick={handleBan} />
                </IconContext.Provider>
              ) : (
                <IconContext.Provider
                  value={{
                    color: "white",
                    size: "25px",
                    style: { cursor: "pointer" },
                  }}
                >
                  <FaUsersSlash onClick={handleUnBan} />
                </IconContext.Provider>
              )
            ) : null}
          </div>
          <div>
            {!data.isOwner &&
            (role === "owner" || (role === "admin" && !data.isAdmin)) &&
            !data.isBanned ? (
              <IconContext.Provider
                value={{
                  color: "red",
                  size: "25px",
                  style: { cursor: "pointer" },
                }}
              >
                <IoMdCloseCircleOutline onClick={handleKick} />
              </IconContext.Provider>
            ) : null}
          </div>
          <div>
            {!data.isBanned ? (
              !data.isOwner && !data.isMuted ? (
                <IconContext.Provider value={{ color: "white", size: "25px" }}>
                  <RiVolumeMuteLine />
                </IconContext.Provider>
              ) : !data.isOwner &&
                (role === "owner" || (role === "admin" && !data.isAdmin)) ? (
                <IconContext.Provider
                  value={{
                    color: "blue",
                    size: "25px",
                    style: { cursor: "pointer" },
                  }}
                >
                  <VscUnmute
                    onClick={() => {
                      handleMute(1);
                    }}
                  />
                </IconContext.Provider>
              ) : null
            ) : null}
          </div>
          <div>
            {isBlocked ? (
              <IconContext.Provider
                value={{
                  color: "orange",
                  size: "25px",
                  style: { cursor: "pointer" },
                }}
              >
                <CgUnblock onClick={handleUnblockUser} />
              </IconContext.Provider>
            ) : (
              <IconContext.Provider
                value={{
                  color: "red",
                  size: "25px",
                  style: { cursor: "pointer" },
                }}
              >
                <BiBlock onClick={handleBlockUser} />
              </IconContext.Provider>
            )}
          </div>
          <div>
            {!data.isFriend ? (
              <IconContext.Provider
                value={{
                  color: "green",
                  size: "25px",
                  style: { cursor: "pointer" },
                }}
              >
                <IoPersonAddOutline onClick={handleAddFriend} />
              </IconContext.Provider>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function JoinChannel({
  cId,
  outsider,
  hasPassword,
  onSelect,
  showMsg,
}: {
  cId: number | undefined;
  outsider: boolean | undefined;
  hasPassword: boolean | undefined;
  onSelect: (chatPreview: chatElement | undefined) => void;
  showMsg: () => void;
}) {
  const login = localStorage.getItem("userLogin");
  const [password, setPassword] = useState("");
  const socket = initializeSocket();

  const handleSetPass = (e: any) => {
    setPassword(e.target.value);
  };

  const handlePwChange = (e: any) => {
    setPassword(e.target.value);
  };

  function handleLeave() {
    let update: updateChannel = {
      cId: cId,
      login: login,
      password: "",
      tId: -1,
      type: "PUBLIC",
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("leave channel", update);
    showMsg();
    onSelect(undefined);
  }

  const handleJoin = () => {
    let update: updateChannel = {
      cId: cId,
      login: login,
      password: password,
      tId: -1,
      type: "PUBLIC",
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("join channel", update);
    setPassword("");
  };
  return outsider ? (
    <div>
      {hasPassword ? (
        <input
          type="password"
          placeholder="Type The Password Here"
          value={password}
          onChange={handlePwChange}
        />
      ) : null}
      <IconContext.Provider
        value={{ color: "green", size: "25px", style: { cursor: "pointer" } }}
      >
        <IoEnterOutline onClick={handleJoin} />
      </IconContext.Provider>
    </div>
  ) : (
    <IconContext.Provider
      value={{ color: "red", size: "25px", style: { cursor: "pointer" } }}
    >
      <IoEnterOutline onClick={handleLeave} />
    </IconContext.Provider>
  );
}

function Input({ cId, login }: { cId: number; login: string | null }) {
  const socket = initializeSocket();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg("");
  }, [cId]);

  const handleSetMsg = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  const sendMsg = () => {
    let data: MessageDto = {
      login: login,
      channelId: cId,
      content: msg,
      msgId: 0,
    };
    socket.emit("msg", data);
    setMsg("");
  };
  return (
    <>
      <div
        className=""
        style={{
          width: "100%",
          height: "10rem",
          background: "#D9D9D9",
          position: "fixed",
          alignItems: "center",
        }}
      >
        <div className="input">
          <input
            id="msg"
            value={msg}
            onChange={handleSetMsg}
            placeholder="Type a message here"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMsg();
            }}
          />
          <div className="send">
            <button onClick={sendMsg}> Send </button>
          </div>
        </div>
      </div>
    </>
  );
}

function OneMessage({ data, login }: { data: oneMsg; login: string | null }) {
  const [sender, setSender] = useState<string[]>([]);
  const [avatarURL, setAvatarURL] = useState("");

  useEffect(() => {
    const getAvatar = async () => {
      const res: undefined | string | Blob | MediaSource = await getUserAvatar(
        data.oId
      );
      if (res !== undefined && res instanceof Blob)
        setAvatarURL(URL.createObjectURL(res));
    };
    getAvatar();
  }, [data.oId]);
  useEffect(() => {
    if (data.login === login) setSender(["messageInfo", "messageContent"]);
    else setSender(["messageInfo2", "messageContent2"]);
  }, [data]);
  const handleError = (e : any) => {
    e.target.src = "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
  }
  return (
    <>
      <div className={`${sender[0]}  `}>
        {/* <p>{data.pseudo}</p> */}
        <img src={avatarURL} onError={handleError} />
      </div>
      <div className={`${sender[1]}  `}>
        {/* <p> {data.pseudo}</p> */}
        <p> {data.content}</p>
        {/* <p> {data.createdAt}</p> */}
      </div>
    </>
  );
}

const Private = () => {
  const login = localStorage.getItem("userLogin");
  const [roomName, setRoomName] = useState("");
  const [e, setE] = useState(null);
  const notif = useContext(NotifCxt);
  const socket = initializeSocket();

  const handleFileChange = (e: any, rId: number) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const uploadAvatar = async () => {
        const res = await uploadCAvatarQ(selectedFile, rId);
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
  const handleChange = (e: any) => {
    setE(e);
  };
  const handleNameChange = (e: any) => {
    setRoomName(e.target.value);
  };
  
  const onCreate = () => {
    let data: ChannelDto = {
      id: null,
      login: login,
      name: roomName,
      type: "PRIVATE",
      hasPassword: true,
      password: "",
      members: [],
    };
    socket.emit("new channel", data, (data: ChannelDto) => {
      if (e) handleFileChange(e, data.id!);
      socket.emit("fetch new channel", data);
    });
    socket.emit("get search suggest", login);
  };
  //#####################################
  const [fetchedAvatar, setFetchedAvatar] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
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
  return (
    <>
      <div className="loginmax !h-[17.6rem] ">
        <div className="inputBox !flex !justify-center ">
          <input
            type="text"
            placeholder="Channel Name"
            value={roomName}
            onChange={handleNameChange}
          />
        </div>
        <div className="inputBox"></div>
        <label htmlFor="file-ip-1" className="  !w-0  ">
          <div className=" absolute translate-x-[6rem] -translate-y-9 mt-2 " >
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
        <input
          style={{ backgroundColor: "red", width: "0%", height: "0%" }}
          type="file"
          id="file-ip-1"
          accept="image/*"
          onChange={handleChange}
        />
        <div className="loginmax1 !flex !justify-center ">
          <button
            className="glowing-button3"
            style={{
              width: "40%",
              background: "#8f2c24",
              borderRadius: "10px",
              color: "white",
              border: "none",

            }}
            onClick={onCreate}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};

function Preview({
  current,
  onSelect,
  onNewRoomRequest,
  updateStatus,
  blockedList,
  setStates,
  type,
}: {
  current: chatElement | undefined;
  onSelect: (chatPreview: chatElement | undefined) => void;
  onNewRoomRequest: () => void;
  updateStatus: number;
  blockedList: [];
  setStates: (data: chatElement | undefined, avatar: any) => void;
  type: string;
}) {
  const socket = initializeSocket();
  const [roomPreview, setPreviews] = useState<chatElement[]>([]);
  const login = localStorage.getItem("userLogin");
  // const { show } = useContextMenu();
  const [hide, setHide] = useState<any>();
  const [menuEvent, setMenuEvent] = useState<any>(null);

  useEffect(() => {
    socket.emit("read preview", login, (data: chatElement[] | null) => {
      if (data) setPreviews(data);
    });
    return () => {
      socket.off("read review");
    };
  }, [updateStatus, login]);

  useEffect(() => {
    socket.on("add preview", (data: chatElement) => {
      if (data) setPreviews((oldPreviews) => [...oldPreviews, data]);
    });
    socket.on("update preview", (data: chatElement[] | null) => {
      if (data) setPreviews(data);
    });

    return () => {
      socket.off("add preview");
      socket.off("update preview");
    };
  }, []);

  const addPreview = (cId: number) => {
    socket.emit("add preview", { cId: cId, login: login });
  };

  const search = (cId: number) => {
    for (let i = 0; i < roomPreview.length; i++) {
      if (roomPreview[i].id === cId) {
        onSelect(roomPreview[i]);
        break;
      }
    }
  };

  function handleLeave() {
    let update: updateChannel = {
      cId: global.selectedChat.id,
      type: global.selectedChat.type,
      login: login,
      password: "",
      tId: -1,
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("leave channel", update);
    onSelect(undefined);
  }

  // function handleBlockChannel(){
  //   let update: updateChannel = {
  //     cId: global.selectedChat.id,
  //     type: global.selectedChat.type,
  //     login: login,
  //     password: "",
  //     tId: -1,
  //     hasPassword: false,
  //     newPassword: ""
  //   }
  //   socket.emit('block channel', update);
  //   onSelect(undefined);
  // }

  function handleUnblockUser() {
    let update: updateUser = {
      login: login,
      otherId: global.selectedChat.ownerId,
    };
    socket.emit("unblock user", update);
  }
  // if (global.selectedChat)
  //   global.selectedChat.isBlocked = blockedList.find((map: any)=> map.id === global.selectedChat.ownerId)!;
  return (
    <div className="chats">
      <div>
        <ChatSearch
          onSearchMyChat={(cId) => search(cId)}
          onSearchPublicChat={(cId) => addPreview(cId)}
          updateStatus={updateStatus}
        />
      </div>
      <div className="user" style={{display:"flex", zIndex:"1"}}>
        <section>
          <ul className="chat_user">
            {type === "DM"
              ? roomPreview
                  .filter((v) => v.type === "DIRECT")
                  .map((v, i) => {
                    return (
                        <PreviewChat
                          key = {i}
                          data={v}
                          onClick={() => {
                            onSelect(v);
                          }}
                          selected={v.id === current?.id}
                          blockedList={blockedList}
                          setHide={setHide}
                          setMenuEvent={setMenuEvent}
                          setStates={(data, avatar) => {
                            setStates(data, avatar);
                          }}
                        />
                    );
                  })
              : roomPreview
                  .filter((v) => v.type !== "DIRECT")
                  .map((v, i) => {
                    return (
                      <PreviewChat
                        key = {i}
                        data={v}
                        onClick={() => {
                          onSelect(v);
                        }}
                        selected={v.id === current?.id}
                        blockedList={blockedList}
                        setHide={setHide}
                        setMenuEvent={setMenuEvent}
                        setStates={(data, avatar) => {
                          setStates(data, avatar);
                        }}
                      />
                    );
                  })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ChatSearch({
  onSearchMyChat,
  onSearchPublicChat,
  updateStatus,
}: {
  onSearchMyChat: (channelId: number) => void;
  onSearchPublicChat: (channelId: number) => void;
  updateStatus: number;
}) {
  const socket = initializeSocket();
  const [suggestion, setSuggestion] = useState<suggestion[]>([]);
  const login = localStorage.getItem("userLogin");

  useEffect(() => {
    if (updateStatus === 0) return;
    socket.emit("get search suggest", login);
  }, [updateStatus, login]);

  useEffect(() => {
    socket.emit("get search suggest", login);
    socket.on("search suggestion", (data: suggestion[]) => {
      setSuggestion(data);
    });
    return () => {
      socket.off("search suggestion");
    };
  }, [login]);

  const handleOnSelect = (data: suggestion) => {
    if (data.category === "user") {
      let dm: DmDto = {
        login: login,
        targetId: data.dataId,
      };

      socket.emit("new dm", dm, (cId: number) => {
        let fetch: fetchDm = {
          cId: cId,
          tId: data.dataId,
        };
        socket.emit("fetch new Dm", fetch);
      });
    } else if (data.category === "my chat") onSearchMyChat(data.dataId);
    else if (data.category === "public chat") onSearchPublicChat(data.dataId);
  };
  const res = (data: suggestion) => {
    return (
      <div>
        <div>
          <p style={{ display: data.category === "my chat" ? "" : "none" }}>
            my Chat
          </p>
          <p style={{ display: data.category === "public chat" ? "" : "none" }}>
            <b>Public Chat </b>
          </p>
          <p
            style={{
              color: "#404EA0",
              display: data.category === "user" ? "" : "none",
            }}
          >
            <b> User </b>
          </p>
        </div>
        <p style={{ color: "black" }}>{data.name}</p>
      </div>
    );
  };

  return (
    <div>
      <ReactSearchAutocomplete
        items={suggestion}
        fuseOptions={{ keys: ["name"] }}
        onSelect={handleOnSelect}
        autoFocus={true}
        placeholder="search"
        formatResult={res}
        styling={{ height: "35px", zIndex: 1, backgroundColor: "#67119d" }}
      />
    </div>
  );
}

const ShowFriends = ({ cId }: { cId: number }) => {
  const socket = initializeSocket();

  const [isFetched, setFetched] = useState("false");
  const [friends, setFriends] = useState<userElement[] | undefined>(undefined);
  const userId = localStorage.getItem("userID");
  let list: userElement[] = [];
  const handleJoin = (v: string, cId: number) => {
    let update: updateChannel = {
      cId: cId,
      login: v,
      password: "",
      tId: -1,
      type: "PRIVATE",
      hasPassword: false,
      newPassword: "",
    };
    socket.emit("join channel", update);
  };

  useEffect(() => {
    const fetchFriends = async () => {
      if (userId) {
        const res = await getFriends(+userId);
        if (res !== "error") return res;
      }
    };
    const fetchData = async () => {
      let fetchedFriends = await fetchFriends();
      if (fetchedFriends !== undefined && fetchedFriends.length !== 0)
        for (let i = 0; i < fetchedFriends.length; i++) {
          let obj: userElement = {
            login: fetchedFriends[i].login,
            pseudo: fetchedFriends[i].pseudo,
          };
          list.push(obj);
        }
      setFriends(list);
      setFetched("true");
    };
    fetchData();
  }, [userId]);
  return (
    <div>
      <ul >
        {isFetched === "true" ? (
          friends?.length !== 0 ? (
            friends!.map((v, i) => {
              return (
                <li key={i} style={{display:"flex"}}>
                  <IconContext.Provider
                    value={{
                      color: "#14e00d",
                      size: "25px",
                      style: { cursor: "pointer"},
                    }}
                  >
                    <IoIosAddCircle
                      onClick={() => {
                        handleJoin(v.login, cId);
                      }}
                    />
                  </IconContext.Provider>
                  <p style={{marginLeft:"7%", font:"small-caption", color:"white"}}> {v.pseudo} </p>
                </li>
              );
            })
          ) : null
        ) : (
          <div> Loading ...</div>
        )}
      </ul>
    </div>
  );
};
function PreviewChat({
  data,
  onClick,
  selected,
  blockedList,
  setHide,
  setMenuEvent,
  setStates,
}: {
  data: chatElement;
  onClick?: () => void;
  selected: boolean;
  blockedList: [];
  setHide: (d: any) => void;
  setMenuEvent: (event: any) => void;
  setStates: (login: chatElement | undefined, avatar: any) => void;
}) {
  const [avatarURL, setAvatarURL] = useState("");
  const [showList, setShowList] = useState(false);
  const usersStatus = useContext(UserStatusCxt);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const socket = initializeSocket();

  const login = localStorage.getItem('userLogin');
  useEffect(() => {
    const getAvatar = async () => {
      let res: undefined | string | Blob | MediaSource;
      if (data.type === "DIRECT") res = await getUserAvatar(data.ownerId);
      else res = await getChannelAvatar(data.id);
      if (res === "error")
        console.log("No Avatar");
        
      if (res !== undefined && res instanceof Blob)
        setAvatarURL(URL.createObjectURL(res));
      else
        setAvatarURL(
          "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
        );
    };
    getAvatar();
    let found = usersStatus?.find(
      (map: IUserStatus) => map.key === data.ownerId
    );
    if (found !== undefined) {
      switch (found.userModel.status) {
        case 0:
          setStatus("offline");
          break;
        case 1:
          setStatus("online");
          break;
        case 2:
          setStatus("inGame");
          break;
      }
    }
  }, [data.ownerId, data.id, usersStatus]);
  // console.log('blocked list ===>', {blockedList}, 'dataID', data.ownerId);

  // data.isBlocked = blockedList.find((map: any) => map.id === data.ownerId)!;
  // console.log('is it Blocked ? :', data.isBlocked);
  function handleCreateGame() {
    socket.emit("startPrivate", (player: Player) => {
      const invitation: gameInvitation = {
        gameInfo: player,
        senderId: Number(localStorage.getItem("userID")),
        senderName: localStorage.getItem("userName")!,
        tId: data.ownerId,
      };  
      socket.emit("send invitation", invitation);
      localStorage.setItem("roomId", player.roomId.toString());
      localStorage.setItem("playerNb", player.playerNb.toString());
      navigate("/privateGame");
    });
  }
  const handleError = (e : any) => {
    e.target.src = "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
  }
  return (
    <div style={{position:"relative", width:"80%", height:"100%"}}>
    <button
      style={{
        position:"relative",
        background: "transparent",
        border: "none",
        borderRadius: "20px",
        width:"100%", 
        height:"100%"
      }}
      onClick={() => {
        setStates(data, avatarURL);
      }}
    >
      <li style={{ position:"relative", height: "100%", width: "100%" }}>
        <div>
          <img src={avatarURL} onError={handleError} />
          <h5>{data.name} </h5>
        </div>
        {data.type === "DIRECT" ? (
          <div style={{ width: "70%", marginLeft: "20%" }}>
            <div style={{ marginLeft: "80%" }}>
              {data.type === "DIRECT" ? (
                status === "online" ? (
                  <IconContext.Provider
                    value={{
                      color: "#14e00d",
                      size: "40px",
                      style: { cursor: "pointer" },
                    }}
                    >
                    <FaTableTennisPaddleBall onClick={handleCreateGame} />
                  </IconContext.Provider>
                ) : (
                  status === "inGame" ? (
                    <IconContext.Provider value={{ color: "orange", size: "40px" }}>
                      <FaTableTennisPaddleBall />
                    </IconContext.Provider>
                  ) : ""
                )
              ) : (
                ""
              )}
            </div>
          </div>
        ) : null}
        {data.type === "PRIVATE" && data.ownerLogin === login ? (
          <div style={{ width: "70%", marginLeft: "20%" }}>
            <Popup
                  className="pop debug "
                  contentStyle={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.06) 100%)",
                    boxShadow: "0px 0px 50px -25px rgba(0, 0, 0, 1)",
                    backdropFilter: "blur(50px",
                    marginLeft: "10%",
                    marginTop: "2%",
                    width: "7%",
                    height: "20%",
                  }}
                  trigger={
                    <button
                      style={{
                        backgroundColor: "transparent",
                        width: "0%",
                        height: "0%",
                        border: "none",
                        borderRadius: "100%",
                      }}
                    >
                      <IconContext.Provider
              value={{
                color: "#15c240",
                size: "40px",
                style: { cursor: "pointer", marginLeft: "60px" },
              }}
            >
              <MdGroups2
                onClick={() => {
                  if (!showList)
                    setShowList(!showList);
                }}
              />
            </IconContext.Provider>
                    </button>
                  }
                  position="right center"
                >
                {showList && <ShowFriends cId={data.id} />}

                </Popup>
          </div>
        ) : null}
      </li>
    </button>
    </div>
  );
}

const Protected = () => {
  const login = localStorage.getItem("userLogin");
  const [roomName, setRoomName] = useState("");
  const [e, setE] = useState(null);
  const notif = useContext(NotifCxt);
  const [roomPw, setRoomPw] = useState("");
  const socket = initializeSocket();

  const handleFileChange = (e: any, rId: number) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const uploadAvatar = async () => {
        const res = await uploadCAvatarQ(selectedFile, rId);
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
  const handleChange = (e: any) => {
    setE(e);
  };
  const handleNameChange = (e: any) => {
    setRoomName(e.target.value);
  };
  const handlePwChange = (e: any) => {
    setRoomPw(e.target.value);
  };
  const onCreate = () => {
    let data: ChannelDto = {
      id: null,
      login: login,
      name: roomName,
      type: "PROTECTED",
      hasPassword: true,
      password: roomPw,
      members: [],
    };
    socket.emit("new channel", data, (data: ChannelDto) => {
      if (e) handleFileChange(e, data.id!);
      socket.emit("fetch new channel", data);
    });
    socket.emit("get search suggest", login);
  };
  //############################################################
  const [fetchedAvatar, setFetchedAvatar] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
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
  return (
    <>
      <div className="loginmax !h-[17.6rem] ">
        <div className="inputBox !flex !justify-center ">
          <input
            type="text"
            placeholder="Channel Name"
            value={roomName}
            onChange={handleNameChange}
          />
        </div>
        <div className="inputBox !flex !justify-center ">
          <input
            type="password"
            placeholder="Password"
            value={roomPw}
            onChange={handlePwChange}
          />
        </div>
        
        <label htmlFor="file-ip-1" className=" translate-x-[100%]  !w-[0px] ">
        <div className=" absolute translate-x-[6rem] -translate-y-9 mt-2 " >
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
        <input
          style={{ backgroundColor: "red", width: "0%", height: "0%" }}
          type="file"
          id="file-ip-1"
          accept="image/*"
          onChange={handleChange}
        />
        <div className="loginmax1 !flex !justify-center ">
          <button
            className="glowing-button3"
            style={{
              width: "40%",
              background: "#8f2c24",
              borderRadius: "10px",
              color: "white",
              border: "none",
            }}
            onClick={onCreate}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};

const Settings = ({channelId}: {channelId: number | undefined}) =>  {
  const [password, setPassword] = useState("");
  const [type, setType] = useState<"PUBLIC"| "PRIVATE" | "PROTECTED" | "DIRECT">("PUBLIC");
  const socket = initializeSocket();

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };


  const handlePrivate = () => {
    setType("PRIVATE")
  }

  const handlePublic = () => {
    setType("PUBLIC")
  }

  const onUpdate = () => {
    let data: updateChannel = {
      cId: channelId,
      login: null,
      password: "",
      newPassword: type === 'PUBLIC' ? password : "",
      hasPassword: password !== "" ? true: false,
      type: type === 'PUBLIC' && password !== "" ? "PROTECTED" : type,
      tId: 0,
    };
    socket.emit("update setting", data);
  };
  return (
    <>
      <div className="loginmax">
        <div className="inputBox !flex !justify-center">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="loginmax1 !flex !justify-around items-center flex-col">
          {type === 'PUBLIC' ? (
            <IconContext.Provider
            value={{ color: "gold", size: "25px", style: { cursor: "pointer" } }}
            >
              <HiLockOpen onClick={handlePrivate} />
          </IconContext.Provider>
          ) : 
          <IconContext.Provider
            value={{ color: "gold", size: "25px", style: { cursor: "pointer" } }}
            >
              <HiLockClosed onClick={handlePublic} />
          </IconContext.Provider>
          }
          <button
            className="glowing-button3"
            style={{
              width: "40%",
              background: "#8f2c24",
              borderRadius: "10px",
              color: "white",
              border: "none",
            }}
            onClick={onUpdate}
          >
           Save
          </button>
          
        </div>
      </div>
    </>
  );
}

const Public = () => {
  const login = localStorage.getItem("userLogin");
  const [roomName, setRoomName] = useState("");
  const [e, setE] = useState(null);
  const socket = initializeSocket();
  const notif = useContext(NotifCxt);
  const [changed, setChanged] = useState(false);

  const handleFileChange = (e: any, rId: number) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const uploadAvatar = async () => {
        const res = await uploadCAvatarQ(selectedFile, rId);
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
  const handleChange = (e: any) => {
    setE(e);
  };
  // useEffect(() => {}, [changed]);
  const handleNameChange = (e: any) => {
    setRoomName(e.target.value);
  };
  const onCreate = () => {
    let data: ChannelDto = {
      id: null,
      login: login,
      name: roomName,
      type: "PUBLIC",
      hasPassword: false,
      password: "",
      members: [],
    };
    socket.emit("new channel", data, (data: ChannelDto) => {
      if (e) handleFileChange(e, data.id!);
      socket.emit("fetch new channel", data);
    });
    socket.emit("get search suggest", login);
  };
  //#########################################################
  const [fetchedAvatar, setFetchedAvatar] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
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
  return (
    <>
      
        <div className="loginmax !h-[17.6rem] ">
        <div className="inputBox !flex !justify-center ">
          <input
            type="text"
            placeholder="Channel Name"
            value={roomName}
            onChange={handleNameChange}
          />
        </div>
        <label htmlFor="file-ip-1" className=" translate-x-[100%]  !w-[0px] ">
        <div className=" absolute translate-x-[6rem] -translate-y-9 mt-2 " >
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

        <input
          style={{ backgroundColor: "red", width: "0%", height: "0%" }}
          type="file"
          id="file-ip-1"
          accept=".jpg, .jpeg, .png"
          onChange={handleChange}
        />
        <div className="loginmax1 !flex !justify-center ">
          <button
            className="glowing-button3"
            style={{
              width: "40%",
              background: "#8f2c24",
              borderRadius: "10px",
              color: "white",
              border: "none",

            }}
            onClick={onCreate}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};