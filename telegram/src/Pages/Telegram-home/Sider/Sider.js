import React, { useEffect, useState } from 'react';
import { faBars, faBookmark, faUser, faMoon, faGear, faMessage, faUserGroup, faBullhorn, faSliders } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useOutletContext } from 'react-router-dom';
import { collection, getDocs, onSnapshot, query, where, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../DataBase/Firebase.Config';
import Loading from '../../../img/200.gif'
import WaitingPage from '../../WaitingPage/WaitingPage';
import Chats from '../chats/Chats';
import Search from '../Search/Search';
import './scss/Sider.scss'
import Gallery from '../gallery/Gallery';
const Sider = (props) => {
    const { mode, setMode, barStyle, setBarStyle, setSavedMessagesShow } = useOutletContext()
    const [userInfo, setUserInfo] = useState({})
    const [check, setCheck] = useState(false)
    const { set } = props
    const { load } = props
    const { SettingDisplay } = props
    useEffect(() => {
        getUser()
    }, [barStyle])
    // get UserInfomation
    const getUser = async () => {
        try {
            let uid = localStorage.getItem("_user-uid")
            let ref = collection(db, "users")
            let q = query(ref, where("uid", "==", uid))
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                let x = doc.data()
                setCheck(x)
                set(false)
                // firstName firstword is latter
                const FirstName = x.firstName?.charAt(0);
                const FirstNameLatterCup = FirstName.toUpperCase();
                const FistNameremainingLetters = x.firstName.slice(1);
                const FirstNameLatter = FirstNameLatterCup + FistNameremainingLetters;
                // lastName firstword is latter
                const LastName = x.lastName?.charAt(0);
                const LastNameLatterCup = LastName.toUpperCase();
                const LastNameremainingLetters = x.lastName.slice(1);
                const LastNameLatter = LastNameLatterCup + LastNameremainingLetters;
                setUserInfo({ ...userInfo, FirstName: FirstNameLatter, LastName: LastNameLatter, PhotoUrl: x.photoURL, PhoneNumber: x.phoneNumber, uid: x.uid, demoImage: x.demoImage })
            })
        } catch (err) {
        }

    }
    //search user by username

    // get ChatUsers
    function showSetting() {
        SettingDisplay.setSettingShow(true);
        setBarStyle(false)
    }

    return (
        <div>
            {
                load ? <WaitingPage /> :
                    <div className='d-flex gap-4'>
                        <div className={mode ? "Dark-sider" : "sider"} >
                            {
                                barStyle ? <div className='control-bar'>
                                    <div className='currentUser'>
                                        <div className='profile-photo'>
                                            <div className='ProfilePic'>
                                                <Gallery props={{ user: userInfo.uid, sider: true }} />
                                            </div>
                                        </div>
                                        <div className='names'>
                                            {
                                                userInfo.FirstName || userInfo.LastName ? <span>{userInfo?.FirstName + " " + userInfo?.LastName}</span> : "Loading..."
                                            }
                                        </div>
                                    </div>
                                    <div className='buttons'>
                                        <hr />
                                        <button className='button' onClick={() => {
                                            setSavedMessagesShow(true)
                                            setBarStyle(false)
                                        }
                                        }>
                                            <div style={{ background: "skyblue", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                <FontAwesomeIcon icon={faBookmark} color='#fff' size="sm" />
                                            </div>
                                            Saved Messages</button>
                                        <button className='button'>
                                            <div style={{ background: "#F06964", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                <FontAwesomeIcon icon={faUser} color='#fff' size="sm" />
                                            </div>
                                            Contacts</button>
                                        <button className='button' onClick={showSetting}>
                                            <div style={{ background: "#B580E2", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                <FontAwesomeIcon icon={faGear} size="sm" color='#fff' />
                                            </div>

                                            Settings</button>
                                        <button className='button'>
                                            <div style={{ background: "skyblue", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                <FontAwesomeIcon icon={faMoon} size="sm" color='#fff' />
                                            </div>
                                            Nigth mode
                                            <label >
                                                <input type="checkbox" hidden id="checkbox1" onChange={(e) => setMode(e.target.checked)} />
                                            </label>
                                        </button>
                                    </div>
                                </div> : ""
                            }
                            <div className='t-bar d-flex gap-4'>
                                <div className='bar text-white' >
                                    <button className='button'>
                                        <FontAwesomeIcon icon={faBars} color="#768C9E" size="2x" onClick={() => setBarStyle(true)} />
                                    </button>
                                </div>
                            </div>
                            <div className='users' onClick={() => setBarStyle(false)}>
                                <div className='search-chatUsers'>
                                    <Search />
                                    <Chats />
                                </div>
                            </div>

                        </div>

                    </div>
            }
        </div>
    );
}

export default Sider;
