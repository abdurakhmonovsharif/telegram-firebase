import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../../DataBase/Firebase.Config';
import { ChangeUser } from '../../Home';
import Gallery from '../gallery/Gallery';
import './scss/Chat.scss'
const Chats = () => {
    const [chats, setChats] = useState(null)
    const { currentUser, setSavedMessagesShow } = useOutletContext()
    const { dispatch } = useOutletContext()
    useEffect(() => {
        getUserOnlineStatus()
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser?.uid), (doc) => {
                setChats(doc.data())
            });
            return () => {
                unsub();
            };
        };
        currentUser?.uid && getChats();
    }, [currentUser?.uid]);
    function handleSelect(user) {
        setSavedMessagesShow(false)
        dispatch({ type: ChangeUser, payload: user })
    }
    const getUserOnlineStatus = async () => {
        // try {
        //     let ref = collection(db, "users")
        //     let q = query(ref, where("uid", "==", isOnline))
        //     const querySnapshot = await getDocs(q);
        //     querySnapshot.forEach((doc) => {
        //         let x = doc.data()
        //         // setUserInfo({ ...userInfo, FirstName: x.firstName, LastName: x.lastName, PhotoUrl: x.photoURL, PhoneNumber: x.phoneNumber, uid: x.uid })
        //     })
        // } catch (err) {
        // }
        let date = new Date();
        let dot_Index = date.toISOString().lastIndexOf(".");
        let T_Index = date.toISOString().indexOf("T")
    }

    return (
        <div>
            <div className="chats mt-3">
                <div>
                    {chats // 👈 null and undefined check
                        && Object.keys(chats).length === 0
                        && Object.getPrototypeOf(chats) === Object.prototype ? <div className={"text-center"}>There is not any chat :(</div> :
                        chats // 👈 null and undefined check
                        && Object.keys(chats).length != 0
                        && Object.getPrototypeOf(chats) == Object.prototype &&
                        Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date)?.map((chat, index) => (
                            <div key={index} className="user">
                                {
                                    <div
                                        className="userChat"
                                        key={chat[0]}
                                        onClick={() => handleSelect(chat[1]?.userInfo)}
                                    >
                                        <div className='ProfilePic'>
                                            <Gallery props={{ url: chat[1].userInfo.PhotoUrl, user: chat[1].userInfo.uid, sider: true }} />
                                        </div>
                                        <div className="userChatInfo">
                                            <div className='name-time'>
                                                <span className='userName'>{chat[1]?.userInfo?.lastName
                                                }</span>

                                                <span className='last-message'>{chat[1]?.lastMessage?.messageInput}</span>

                                            </div>

                                            <span className='last-time'>

                                                {
                                                    chat[1].date && new Date(chat[1].date?.seconds * 1000)?.getHours()?.toString() + ":" + new Date(chat[1].date?.seconds * 1000)?.getMinutes()?.toString()
                                                }
                                            </span>
                                        </div>
                                    </div>

                                }
                            </div>
                        ))
                    }

                </div>

            </div>
        </div >
    );
}

export default Chats;
