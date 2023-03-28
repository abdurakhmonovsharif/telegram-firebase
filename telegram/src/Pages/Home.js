import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useReducer, useState } from 'react';
import { Outlet } from 'react-router-dom';
import "../Home.scss";
import { db, dbAuth } from '../DataBase/Firebase.Config';
import { collection, getDocs, query, where } from 'firebase/firestore';
export const ChangeUser = "CHANGE_USER";
export const CHANGE_FILE = "CHANGE_FILE";
const INITIAL_STATE = {
    chatId: "null",
    user: {},
    file: null
};
const Home = () => {
    const [countryCode, setCountryCode] = useState('')
    const [user, setUser] = useState({})
    const [mode, setMode] = useState(false)
    const [barStyle, setBarStyle] = useState(false)
    const [savedMessagesShow, setSavedMessagesShow] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [photoViewID, setPhotoViewID] = useState(null);
    const [inputValue, setInputValue] = useState({edit:false,value:"",chatId:"null",text_id:"null"});
    useEffect(() => {
        onAuthStateChanged(dbAuth, (user) => {
            setCurrentUser({ ...user })
            if (user == null) {
                let checkLocalStorageWithUserUid = localStorage.getItem("_user-uid")
                let q = query(collection(db, "users"), where("uid", "==", checkLocalStorageWithUserUid))
                getDocs(q).then(res => {
                    res.docs.map(item => {
                        setCurrentUser(item.data())
                    })
                })
            }
        });
    }, [])
    //chatReducer
    const chatReducer = (state, action) => {
        switch (action.type) {
            case ChangeUser:
                return {
                    user: action.payload,
                    chatId:
                        currentUser.uid > action.payload.uid
                            ? currentUser.uid + action.payload.uid
                            : action.payload.uid + currentUser.uid,
                };
            case CHANGE_FILE:
                return {
                    file: action.payload
                };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);
    return (
        <div className='Home text-monospace'>
            <Outlet context={{
                countryCode,
                barStyle, setBarStyle,
                setCountryCode, setUser,
                user, mode, setMode,
                currentUser, dispatch,
                state, photoViewID,
                setPhotoViewID,
                savedMessagesShow,
                setSavedMessagesShow,
                setInputValue,
                inputValue
            }} />
        </div>
    );
}
export default Home;
