// import React, { useContext, 
//     // useEffect, useRef, 
//     useState } from "react";
//     import data from "./data";
  
//   const Input = () => {
//     // const [ text, setText ] = useState("")
//     // const [ img, setImg ] = useState(null)
  
//     // const { currentUser } = useContext(AuthContext);
//     // const { data } = useContext(ChatContext);
  
//     // const handleSend = async ()=>{
  
//     //   if (img){
//     //     const storageRef = ref(storage, uuid());
  
//     //     const uploadTask = uploadBytesResumable(storageRef, img);
//     //     uploadTask.on(
//     //       (error) => {
//     //         //TODO:Handle Error
//     //       },
//     //       () => {
//     //         getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
//     //           await updateDoc(doc(db, "chats", data.messages), {
//     //             messages: arrayUnion({
//     //               date: Timestamp.now(),
//     //               id: uuid(),
//     //               senderId: currentUser.uid,
//     //               text,
//     //               img: downloadURL,
//     //             }),
//     //           });
//     //         });
//     //       }
//     //     );
//     //   }
//     //   else{
//     //     await updateDoc(doc(db, "chats", data.chatId), {
//     //       messages: arrayUnion({
//     //         id: uuid(),
//     //         text,
//     //         senderId: currentUser.uid,
//     //         date: Timestamp.now(),
//     //       }),
//     //     });
//     //   }
//     //   await updateDoc(doc(db, "userChat", currentUser.uid), {
//     //     [data.chatId + ".lastMessage"]: {
//     //       text,
//     //     },
//     //     [data.chatId + ".date"]: serverTimestamp(),
//     //   });
  
//     //   await updateDoc(doc(db, "userChat", data.user.uid), {
//     //     [data.chatId + ".lastMessage"]: {
//     //       text,
//     //     },
//     //     [data.chatId + ".date"]: serverTimestamp(),
//     //   });
  
//     //   setText("");
//     //   setImg(null);
//     // };
  
//     return (
//       <div className='input'>
//           <input type='text' placeholder='Type Somting....' onChange={e=>data.messages.text} />
//           <div className='send'>
              
//               <button onClick={data.messages.text} >Send</button>
//           </div>
//       </div>
//     );
//   };
  
//   export default Input