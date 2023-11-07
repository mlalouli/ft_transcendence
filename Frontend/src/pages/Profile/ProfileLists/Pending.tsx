import { useContext, useEffect, useState } from "react";
import { IUserStatus, ItableRow } from "@/global/interface";

import { getUserAvatar } from "@/queries/avatarQueries";
import { getPendingQ } from "@/queries/userQueries";
import { addFriendQ, denyRequest } from "@/queries/friendsQueries";
import { NotifCxt, UserStatusCxt } from "@/pages/App";
import { IconContext } from "react-icons";
import { RiEmotionLine } from "react-icons/ri";
import { FaTableTennisPaddleBall } from "react-icons/fa6";
import {ImUserCheck} from "react-icons/im";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
export const Pending = () => {
  const usersStatus = useContext(UserStatusCxt);
  const [pending, setpending] = useState<ItableRow[] | undefined>(undefined);
  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdated] = useState(false);

  let list: ItableRow[] = [];

  useEffect(() => {
    const fetchPending = async () => {
      const res = await getPendingQ();
      if (res !== "error") return res;
    };

    const fetchAvatar = async (otherId: number) => {
      const res: undefined | string | Blob | MediaSource = await getUserAvatar(
        otherId
      );
      if (res !== "error") return res;
      else
        return "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg";
    };

    const fetchData = async () => {
      let fetchedPending = await fetchPending();

      if (fetchedPending !== undefined && fetchedPending.length !== 0) {
        for (let i = 0; i < fetchedPending.length; i++) {
          let row: ItableRow = {
            key: i,
            userModel: { username: "", avatar: "", id: 0, status: -1 },
          };
          row.userModel.id = fetchedPending[i].id;
          row.userModel.username = fetchedPending[i].pseudo;

          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedPending[i].id
            );
            if (found) row.userModel.status = found.userModel.status;
          }

          let avatar = await fetchAvatar(fetchedPending[i].id);

          if (avatar !== undefined && avatar instanceof Blob)
            row.userModel.avatar = URL.createObjectURL(avatar);
          else if (avatar) row.userModel.avatar = avatar;
          list.push(row);
        }
      }
      setpending(list);
      setFetched("true");
    };
    fetchData();
  }, [isUpdated, usersStatus]);

  const notif = useContext(NotifCxt);

  const handleClickAccept = (other: any) => {
    const addFriend = async () => {
      const res = await addFriendQ(other.id);
      if (res !== "error") {
        console.log('here');
        
        notif?.setNotifText(other.username + "Accepted ");
        setUpdated(!isUpdated);
      } else {
        console.log('or here');
        
        notif?.setNotifText("Not Accepted !" + other.username);}
      notif?.setNotifShow(true);
    };
    addFriend();
  };

  const handleClickDeny = (other: any) => {
    const denyFriend = async () => {
      const res = await denyRequest(other.id);
      if (res !== "error") {
        notif?.setNotifText(other.username + " Denied !");
        setUpdated(!isUpdated);
      } else notif?.setNotifText(other.username + " Not Denied !");
      notif?.setNotifShow(true);
    };
    denyFriend();
  };

  return (
    <div className="alert2">
      <div className="friends">
        <section>
          <div className="users h-[100px] ">
            {isFetched === "true" ? (
              pending?.length !== 0 ? (
                pending!.map((h, index) => {
                  return (
                    <li key={index} className=" h-[100px] flex ">
                      <img
                        src={h.userModel.avatar}
                        className=" !w-[80px] !h-[80px] rounded-full  "
                      />
                      <div className=" flex items-center justify-between w-[calc(100%-200px)] " >
                        <div>
                          <h4>{h.userModel.username}</h4>
                          <h5>
                            {" "}
                            {h.userModel.status === 1 ? (
                              <IconContext.Provider
                                value={{ color: "#14e00d", size: "25px" }}
                              >
                                <RiEmotionLine />
                              </IconContext.Provider>
                            ) : h.userModel.status === 2 ? (
                              <IconContext.Provider
                                value={{ color: "orange", size: "25px" }}
                              >
                                <FaTableTennisPaddleBall />
                              </IconContext.Provider>
                             
                            ) : (
                              ""
                            )}
                          </h5>
                        </div>
                        <div className="w-[6rem] flex justify-between">
                        <IconContext.Provider
                                value={{ color: "green",
                                          size: "25px",
                                          style:{cursor: 'pointer'}
                                      }}

                        >
                          <FaUserCheck onClick={() => {handleClickAccept(h.userModel)}} />
                        </IconContext.Provider>
                        <IconContext.Provider
                                value={{ color: "red", size: "25px",style:{cursor: 'pointer'}}}
                        >
                          <FaUserTimes onClick={() => {handleClickDeny(h.userModel)}}/>
                        </IconContext.Provider>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <span style={{ marginLeft: "50%" }}>No Pending Request </span>
              )
            ) : (
              <div> Loading ...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
