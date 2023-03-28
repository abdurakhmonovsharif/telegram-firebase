import { collection, getDocs, query, where, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { db, dbAuth } from '../../DataBase/Firebase.Config';
import Sider from './Sider/Sider';
import { useLocation } from 'react-router-dom';
import WaitingPage from '../WaitingPage/WaitingPage';
import Settings from './Settings/Settings';
import Chat from './chats/Chat';
import './Telegram-home.scss'
import UserInfo from './UserInfo/UserInfo';
import PhotoView from './PhotoView/PhotoView';
const TelegramHome = (props) => {
    const navigate = useNavigate()
    let { state, barStyle, setBarStyle, savedMessagesShow, setSavedMessagesShow } = useOutletContext();
    const location = useLocation()
    const [settingShow, setSettingShow] = useState(false);
    const [photoViewShow, setPhotoViewShow] = useState(false);
    const [userInfoShow, setUserInfoShow] = useState(false);
    const { loading } = props
    useEffect(() => {
        if (location.pathname === "/home") {
            let checkLocalStorageWithUserUid = localStorage.getItem("_user-uid")
            let q = query(collection(db, "users"), where("uid", "==", checkLocalStorageWithUserUid))
            getDocs(q).then(res => {
                if (res.docs.length === 0) {
                    navigate('/')
                } else {
                    //open 
                }
            })
        }
    }, [])
    return (
        <div className='tg-Home'>
            <div className='sider-chats'>
                <Sider set={loading.setLoading} load={loading.loading} SettingDisplay={{ setSettingShow, settingShow }} />
                {state?.chatId == undefined || state?.chatId == "null" ? <div className={savedMessagesShow ? "d-none" : "chatId-null"} onClick={() => {
                    if (barStyle) setBarStyle(false)
                }}>
                    <span  className='chat-not'>select a chat to start messaging</span></div> :
                    savedMessagesShow == false &&
                    <Chat props={{ userInfoShow, setUserInfoShow }} />
                }
                {
                    savedMessagesShow &&
                    <Chat props={{ userInfoShow, setUserInfoShow }} />
                }
            </div>
            <div>
                <Settings props={{ setSettingShow, settingShow }} />
                {dbAuth?.currentUser?.uid && <UserInfo props={{ user: state?.user, userInfoShow, setUserInfoShow }} />}
                <PhotoView props={{ photoViewShow, setPhotoViewShow }} />
            </div>
        </div>
    );
}

export default TelegramHome;
