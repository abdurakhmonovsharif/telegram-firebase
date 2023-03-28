import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, dbAuth } from '../../../DataBase/Firebase.Config';
import Gallery from '../gallery/Gallery';
import './scss/Search.scss'
const Search = () => {
    const [search, setSearch] = useState('')
    const [searched, setSearched] = useState({})
    const [err, setErr] = useState(false)
    const { currentUser, setSavedMessagesShow } = useOutletContext()
    let indexOfSlesh = currentUser?.displayName?.indexOf("/");
    let currentUser_firstName = currentUser?.displayName?.substring(0, indexOfSlesh);
    let currentUser_lastName = currentUser?.displayName?.substring(indexOfSlesh + 1);
    const handleSearch = (e) => {
        let value = e.target.value.toLowerCase()
        let newValue = value.startsWith("@") ? value.replace("@", "") : value;
        // e.target.value === "" ? setLoading(false) : setLoading(true)
        setSearch(e.target.value)
        const ref = collection(db, "users")
        let q = query(ref, where("userName", "==", newValue))
        getDocs(q).then(res => {
            // setLoading(false)
            let x = res.docs.map(item => ({ ...item.data(), id: item.id }))
            if (x.length === 0) {
                setErr(true)
            } else {
                x.map(item => setSearched({ ...searched, firstName: item.firstName, lastName: item.lastName, photoURL: item.photoURL, uid: item.uid, online: item.isOnline }))
                setErr(false)
            }
        })
    }

    const handleSelect = async (user) => {
        if (user.uid == dbAuth.currentUser.uid) {
            setSavedMessagesShow(true)
            setSearch("");
            return
        }
        setSearch("");
        const combinedId =
            currentUser.uid > user.uid
                ? currentUser.uid + user.uid
                : user.uid + currentUser.uid;
        try {
            const res = await getDoc(doc(db, "chats", combinedId))
            if (!res.exists()) {
                //create a chat in chats collection
                await setDoc(doc(db, "chats", combinedId), { messages: [] });
                //create user chats
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [combinedId + ".userInfo"]: {
                        uid: user.uid,
                    },
                    [combinedId + ".date"]: serverTimestamp(),
                });
                await updateDoc(doc(db, "userChats", user.uid), {
                    [combinedId + ".userInfo"]: {
                        uid: currentUser.uid,
                    },
                    [combinedId + ".date"]: serverTimestamp(),
                });
            } else {

            }
        } catch (err) { }
    }
    return (
        <div className={" Search"}>
            <div className="group">
                <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                <input value={search} placeholder="Search" type="search" className="input" onChange={handleSearch} />
            </div>
            {
                search === "" ? '' : <div className='user-info'>
                    {
                        searched !== {} ? <div >
                            {
                                err ? <span>user not Fount</span> : <div className='profile' onClick={() => handleSelect(searched)}>
                                    <div className='profile-image'>
                                        {
                                            <Gallery props={{ user: searched.uid, sider: true }} />
                                        }
                                    </div>
                                    <div className='name'>
                                        <span>{searched?.firstName + " " + searched?.lastName}</span>
                                    </div>
                                </div>
                            }
                        </div> : "loading..."
                    }
                    <hr />

                </div>
            }
        </div>
    );
}

export default Search;
