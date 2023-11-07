import { useContext, useEffect, useState } from "react";
import { IUserStatus, ItableRow } from "@/global/interface";
import { blockUser, getFriends, rmFriend } from "@/queries/friendsQueries";
import { getUserAvatar } from "@/queries/avatarQueries";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { NotifCxt, UserStatusCxt } from "@/pages/App";
import { RiEmotionLine } from "react-icons/ri";
import { IconContext } from "react-icons";
import { FaTableTennisPaddleBall } from "react-icons/fa6";
import { CgUserRemove } from "react-icons/cg";
import { BiBlock } from "react-icons/bi";

export const Friends = () => {
  const usersStatus = useContext(UserStatusCxt);
  const [friends, setFriends] = useState<ItableRow[] | undefined>(undefined);
  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdated] = useState(false);
  const navigate = useNavigate();

  let list: ItableRow[] = [];

  useEffect(() => {
    const fetchFriends = async () => {
      const id = localStorage.getItem("userID");
      if (id) {
        const res = await getFriends(+id);
        if (res !== "error") return res;
      }
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
      let fetchedFriends = await fetchFriends();

      if (fetchedFriends !== undefined && fetchedFriends.length !== 0) {
        for (let i = 0; i < fetchedFriends.length; i++) {
          let row: ItableRow = {
            key: i,
            userModel: { username: "", avatar: "", id: 0, status: -1 },
          };
          row.userModel.id = fetchedFriends[i].id;
          row.userModel.username = fetchedFriends[i].pseudo;

          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedFriends[i].id
            );
            if (found) row.userModel.status = found.userModel.status;
          }

          let avatar = await fetchAvatar(fetchedFriends[i].id);

          if (avatar !== undefined && avatar instanceof Blob)
            row.userModel.avatar = URL.createObjectURL(avatar);
          else if (avatar) row.userModel.avatar = avatar;
          list.push(row);
        }
      }
      setFriends(list);
      setFetched("true");
    };
    fetchData();
  }, [isUpdated, usersStatus]);

  const notif = useContext(NotifCxt);

  const handleClickRemove = (other: any) => {
    const removeFriend = async () => {
      const res = await rmFriend(other.id);
      if (res != "error") {
        notif?.setNotifText(other.username + "is Removed !");
        setUpdated(!isUpdated);
      } else notif?.setNotifText("Cannot Remove " + other.username);

      notif?.setNotifShow(true);
    };
    removeFriend();
  };

  const handleClickBlock = (other: any) => {
    const blockFriend = async () => {
      const res = await blockUser(other.id);
      if (res !== "error") {
        notif?.setNotifText(other.username + " is Blocked !");
        setUpdated(!isUpdated);
      } else notif?.setNotifText("Cannot Block " + other.username);
      notif?.setNotifShow(true);
    };
    blockFriend();
  };
  return (
    <div className="alert2">
      <div className="friends">
        <section>
          <div className="users h-[100px] ">
            {isFetched === "true" ? (
              friends?.length !== 0 ? (
                friends!.map((h, index) => {
                  return (
                    <li key={index} className=" h-[100px] flex ">
                      <img
                        src={h.userModel.avatar}
                        className=" !w-[80px] !h-[80px] rounded-full  "
                      />
                      <div className="  w-[calc(100%-100px)] h-[100px] flex items-center justify-between ">
                        <div>
                          <h5>{h.userModel.username}</h5>
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
                        <div className="">
                          <div className="w-[6rem] flex justify-between">
                            <IconContext.Provider
                              value={{
                                color: "white",
                                size: "25px",
                                style: { cursor: "pointer" },
                              }}
                            >
                              <CgUserRemove
                                onClick={() => {
                                  handleClickRemove(h.userModel);
                                }}
                              />
                            </IconContext.Provider>

                            <IconContext.Provider
                              value={{
                                color: "red",
                                size: "25px",
                                style: { cursor: "pointer" },
                              }}
                            >
                              <BiBlock
                                onClick={() => {
                                  handleClickBlock(h.userModel);
                                }}
                              />
                            </IconContext.Provider>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <span style={{ marginLeft: "50%" }}>No Friends </span>
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
