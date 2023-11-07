import { useContext, useEffect, useState } from "react";
import { ItableRow } from "@/global/interface";

import { getUserAvatar } from "@/queries/avatarQueries";
import { log } from "console";
import { getBlockedQ } from "@/queries/userQueries";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { NotifCxt, UserStatusCxt } from "@/pages/App";
import { unblockUser } from "@/queries/friendsQueries";
import { CgUnblock } from "react-icons/cg";
import { IconContext } from "react-icons";

export const Blocked = () => {
  const usersStatus = useContext(UserStatusCxt);
  const [blocked, setBlocked] = useState<ItableRow[] | undefined>(undefined);
  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdated] = useState(false);

  let list: ItableRow[] = [];

  useEffect(() => {
    const fetchBlocked = async () => {
      const res = await getBlockedQ();
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
      let fetchedBlocked = await fetchBlocked();

      if (fetchedBlocked !== undefined && fetchedBlocked.length !== 0) {
        for (let i = 0; i < fetchedBlocked.length; i++) {
          let row: ItableRow = {
            key: i,
            userModel: { username: "", avatar: "", id: 0, status: -1 },
          };
          row.userModel.id = fetchedBlocked[i].id;
          row.userModel.username = fetchedBlocked[i].pseudo;

          // let found = undefined;
          // if (userStatus) {
          //     getStatus = userStatus.find(x: IUserStatus) => x.key === fetchedBlocked[i].id);
          //     if (get)
          //         row.userModel.status = get.userModel.status;
          // }

          let avatar = await fetchAvatar(fetchedBlocked[i].id);

          if (avatar !== undefined && avatar instanceof Blob)
            row.userModel.avatar = URL.createObjectURL(avatar);
          else if (avatar) row.userModel.avatar = avatar;
          list.push(row);
        }
      }
      setBlocked(list);
      setFetched("true");
    };
    fetchData();
  }, [isUpdated]);

  const notif = useContext(NotifCxt);
  const handleClickUnBlock = (other: any) => {
    const unblockFriend = async () => {
      const res = await unblockUser(other.id);
      if (res !== "error") {
        notif?.setNotifText(other.username + " is Blocked !");
        setUpdated(!isUpdated);
      } else notif?.setNotifText("Cannot Block " + other.username);
      notif?.setNotifShow(true);
    };
    unblockFriend();
  };
  return (
    <div className="alert2">
      <div className="friends">
        <section>
          <div className="users h-[100px] ">
            {isFetched === "true" ? (
              blocked?.length !== 0 ? (
                blocked!.map((h, index) => {
                  return (
                    <li key={index} className=" h-[100px] flex ">
                      <img
                        src={h.userModel.avatar}
                        className=" !w-[80px] !h-[80px] rounded-full  "
                      />
                      <div>
                        <h5>{h.userModel.username}</h5>
                      </div>
                      <div
                        style={{
                          height: "50%",
                          width: "10%",
                          marginLeft: "50%",
                        }}
                      >
                        <IconContext.Provider
                          value={{
                            color: "orange",
                            size: "25px",
                            style: { cursor: "pointer" },
                          }}
                        >
                        <CgUnblock onClick={() => {handleClickUnBlock(h.userModel);}} />
                      </IconContext.Provider>
                      </div>
                    </li>
                  );
                })
              ) : (
                <span style={{ marginLeft: "50%" }}>No Bloked Users </span>
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
