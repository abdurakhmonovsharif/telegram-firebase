import { faCircle, faCircleInfo, faClose, faEllipsisV, faHand, faInfo, faPhone, faTree } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, dbAuth } from '../../../DataBase/Firebase.Config';
import Gallery from '../gallery/Gallery';
import './scss/UserInfo.scss'
const UserInfo = ({ props }) => {
    const [users, setUsers] = useState({})
    useEffect(() => {
        props.userInfoShow && getUserInformations()
    }, [props.userInfoShow])
    const getUserInformations = async () => {
        const q = query(collection(db, "users"), where("uid", "==", props?.user?.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setUsers(doc.data());
        });
    }
    return (
        <div className={props.userInfoShow ? "userInformation" : "d-none"} >
            <div className='my-modal' >
                <div className='header'>
                    <div className='top'>
                        <span>User Info</span>
                        <div className='icons'>
                            <FontAwesomeIcon className='call-icon' icon={faPhone} color="#23292F" />
                            <FontAwesomeIcon className='more-btn' icon={faEllipsisV} color="#23292F" />
                            <FontAwesomeIcon className='close-button' icon={faClose} color="#23292F" onClick={() => props.setUserInfoShow(false)} />
                        </div>
                    </div>
                    <div className='bottom'>
                        <Gallery props={{ user: props?.user?.uid, sider: false }} />
                        <div className='name-status'>
                            <span className='names'>
                                {users?.firstName + " " + users?.lastName}
                            </span>
                            <span className='status'>last seen recently</span>
                        </div>
                    </div>
                </div>
                <div className='hr'></div>
                <div className='body'>
                    <div className='number'>
                        <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />
                        <span className="phone">
                            <span className='num'> {users.phoneNumber}</span>
                            <span className='mobile'>Mobile</span>
                        </span>
                    </div>
                    <div className='bio'>
                        <span className='bio-input'>{users?.bio ? users?.bio : "bio"}</span>
                        <span className='bio-text'>bio</span>
                    </div>
                    <div className='username'>
                        <span className='username-text'>{users?.userName ? "@" + users?.userName : "username"}</span>
                        <span className='text'>username</span>
                    </div>
                </div>
                <div className='hr'></div>
                <div className='footer'>
                    <div className='block-user'>
                        <FontAwesomeIcon icon={faHand} className="block-icon" />
                        <span className='block-user-text'>Block user</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default UserInfo;
