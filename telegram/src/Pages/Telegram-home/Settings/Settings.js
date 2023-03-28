import { collection, deleteField, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { db, dbAuth } from '../../../DataBase/Firebase.Config';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import { faArrowLeft, faAt, faBell, faCamera, faCameraRetro, faClose, faDoorClosed, faEllipsisV, faLeftLong, faLock, faMessage, faPhone, faRightLeft, faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './scss/Settings.scss'
import Button from 'react-bootstrap/Button';
import { doc, updateDoc } from "firebase/firestore";
import { useReducer } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import changeSimGif from '../../../img/changeSimunscreen.gif'
import Loading from '../../../img/200.gif'
import Gallery from '../gallery/Gallery';
import { CHANGE_FILE } from '../../Home';

const initialState = {
    editPofile: false,
    security: false,
    editUserName: false,
    editName: false,
    show: false,
    isLogOut: false,
    editPhoneNumber: false,
    changeNumber: false
}

function reducer(currentState, action) {
    switch (action.type) {
        case 'editProfile':
            return { editPofile: currentState.editPofile = true };
        case 'security':
            return { security: currentState.security = true };
        case 'closeEditProfile':
            return { editPofile: currentState.editPofile = false };
        case 'closeSecurityMenu':
            return { security: currentState.security = false };
        case 'editUserName':
            return {
                editUserName: currentState.editUserName = true,
                show: currentState.show = true
            };
        case 'CloseEditUserName':
            return {
                editUserName: currentState.editUserName = false,
                show: currentState.show = false
            };
        case 'editName':
            return {
                editName: currentState.editName = true,
                show: currentState.show = true
            };
        case 'CloseEditName':
            return {
                editName: currentState.editName = false,
                editPofile: currentState.editPofile = true
            };
        case "isLogOut":
            return { isLogOut: currentState.isLogOut = true }
        case "CloseIsLogOut":
            return { isLogOut: currentState.isLogOut = false };
        case "EditPhoneNumber":
            return {
                editPhoneNumber: currentState.editPhoneNumber = true,
            };
        case "CloseEditPhoneNumber":
            return {
                editPofile: currentState.editPofile = true,
                editPhoneNumber: currentState.editPhoneNumber = false,
            };
        case "changeNumber":
            return {
                changeNumber: currentState.changeNumber = true,
                show: currentState.show = true
            };
        case "CloseChangeNumber":
            return {
                show: currentState.show = false,
                changeNumber: currentState.changeNumber = true,
                editPofile: currentState.editPofile = true,
                editPhoneNumber: currentState.editPhoneNumber = true,
            }

        case "AllClose":
            return {
                editName: currentState.editName = false,
                editUserName: currentState.editUserName = false,
                editPofile: currentState.editPofile = false,
                show: currentState.show = false,
                security: currentState.security = false
            }
        default:
            console.log("err");
    }
}

const Settings = ({ props }) => {
    // states
    const [userInfo, setUserInfo] = useState({})
    const [userName, setUserName] = useState("");
    const [defaultUserName, setDefaultUserName] = useState("");
    const [checkUserName, setcheckUserName] = useState(false);
    const [bio, setBio] = useState("");
    const [code, setCode] = useState("");
    const [sendCode, setSendCode] = useState(false)
    const [currentState, dispatch1] = useReducer(reducer, initialState);
    const { dispatch, state } = useOutletContext()
    // functions 
    useEffect(() => {
        getUser();
    }, [currentState?.show])
    useEffect(() => {
        getUser()
    }, [dbAuth?.currentUser?.photoURL])
    useEffect(() => {
        checkUsername();
    }, [userName])
    const navigate = useNavigate()
    const handleClose = () => {
        props.setSettingShow(false)
        dispatch1({ type: "CloseIsLogOut" })
    };
    const AllClose = () => {
        dispatch1({ type: "AllClose" })
        props.setSettingShow(false)
    }
    const checkUsername = async () => {
        let ref = collection(db, "users")
        let q = query(ref, where("userName", "==", userName))
        const querySnapshot = await getDocs(q);
        if (userName.length >= 6) {
            if (querySnapshot.empty) {
                setcheckUserName(false)
            } else {
                setcheckUserName(true);
                querySnapshot.forEach((doc) => {
                    if (doc.data().phoneNumber === userInfo.phoneNumber) {
                        setcheckUserName(false)
                    }
                })

            }
        }
    }
    const getUser = async () => {
        try {
            let uid = localStorage.getItem("_user-uid")
            let ref = collection(db, "users")
            let q = query(ref, where("uid", "==", uid))
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                let x = doc.data()
                // firstName firstword is latter
                const FirstName = x.firstName.charAt(0);
                const FirstNameLatterCup = FirstName.toUpperCase();
                const FistNameremainingLetters = x.firstName.slice(1);
                const FirstNameLatter = FirstNameLatterCup + FistNameremainingLetters;
                // lastName firstword is latter
                const LastName = x.lastName.charAt(0);
                const LastNameLatterCup = LastName.toUpperCase();
                const LastNameremainingLetters = x.lastName.slice(1);
                const LastNameLatter = LastNameLatterCup + LastNameremainingLetters;
                setUserInfo({ ...userInfo, FirstName: FirstNameLatter, LastName: LastNameLatter, PhotoUrl: x.photoURL, PhoneNumber: x.phoneNumber, uid: x.uid, userName: x?.userName, demoImage: x.demoImage })
                if (x.userName) {
                    setDefaultUserName(x.userName)
                }
                if (x.bio) {
                    setBio(x.bio)
                }
            })
        } catch (err) {
        }
    }
    async function AddUserName() {
        dispatch1({ type: "CloseEditUserName" })
        if (userName.length >= 6 || userName === "") {
            const washingtonRef = doc(db, "users", userInfo.uid);
            if (userName) {
                await updateDoc(washingtonRef, {
                    userName: userName.toLocaleLowerCase()
                });
            } else {
                setDefaultUserName("")
                await updateDoc(washingtonRef, {
                    userName: deleteField()
                });
            }
        }
    }
    async function AddBio(e) {
        setBio(e.target.value)
        const washingtonRef = doc(db, "users", userInfo.uid);
        if (e.target.value?.length > 0) {
            await updateDoc(washingtonRef, {
                bio: e.target.value.toLocaleLowerCase()
            });
        } else {
            await updateDoc(washingtonRef, {
                bio: deleteField()
            });
        }
    }
    async function AddName(e) {
        e.preventDefault()
        let firstName = e.target[0].value;
        let lastName = e.target[1].value;
        if (firstName || lastName) {
            dispatch1({ type: "CloseEditName" })
            setBio(e.target.value)
            const washingtonRef = doc(db, "users", userInfo.uid);
            if (firstName || lastName) {
                await updateDoc(washingtonRef, {
                    firstName,
                    lastName
                });
            } else {
                alert("pls enter firstname or lastname")
            }
        } else {
            alert("enter firstname or lastname")
        }

    }
    function EditPhoneNumber(e) {
        e.preventDefault()
        const number = e.target[0].value
        recaptchaVerifier()
        // sentToNumber
        signInWithPhoneNumber(dbAuth, number, window.recaptchaVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setSendCode(true)
                e.target[0].value = ""
            }).catch(err => {
                console.log("number error");
            })
        window.confirmationResult.confirm(code).then((result) => {
            //save to local for get infomation
            let user = result.user
            console.log(user);
            // check users if have navigate
        }).catch(err => {
            console.log("code error");
        })
    }
    function recaptchaVerifier() {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                // ...
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                // ...
            }
        }, dbAuth);
    }
    function changeProfileImage(e) {
        e.preventDefault()
        dispatch({ type: CHANGE_FILE, payload: e.target.files[0] })
    }
    function logOut() {
        dispatch1({ type: "CloseIsLogOut" })
        signOut(dbAuth).then(() => {
            localStorage.clear()
            console.clear()
            navigate("/")
            dispatch1({ type: "CloseIsLogOut" })
        }).catch((error) => {
            // An error happened.
        });

    }
    return (
        <div className='settings'>
            <div id="recaptcha-container" ></div>
            <Modal
                show={props.settingShow}
                onHide={handleClose}
                animation={true}
                onClick={() => {
                    if (currentState.isLogOut) {
                        dispatch1({ type: "CloseIsLogOut" })
                    }
                }}
            >
                <Modal.Header >
                    <FontAwesomeIcon className='close-button' icon={faClose} color="#23292F" onClick={AllClose} />
                    {
                        currentState?.editPofile ? <div className='EditProfile'>
                            <FontAwesomeIcon className='back-button' icon={faArrowLeft} color="#23292F" onClick={() => dispatch1({ type: 'closeEditProfile' })} />
                            <div className='profile-images'>
                                {
                                        <div className='ProfilePic'>
                                            {
                                                <div className='gallery-image'>
                                                    <Gallery props={{ user: userInfo?.uid }} />
                                                </div>
                                            }
                                        </div>
                                }
                                <div className='edit-images'>
                                    <label >
                                        <FontAwesomeIcon icon={faCameraRetro} className='edit-images-camera' />
                                        <input type="file" hidden id='edit-image-input' onChange={changeProfileImage} accept=".jpg,.jpeg,.png" />
                                    </label>
                                </div>

                            </div>
                            <div className='name'>
                                <span>{userInfo.FirstName + " " + userInfo.LastName}</span>
                                <span className='status'>Online</span>
                            </div>
                            <div className='bio-other-info'>
                                <div className='bio'>
                                    <input spellCheck="false" type="text" maxLength={60} className='bio-input' placeholder='bio' onChange={AddBio} value={bio} />
                                    <span className='text-length'>{60 - bio?.length}</span>
                                </div>
                                <div className='other-info'>
                                    <div className='main-info' onClick={() => dispatch1({ type: "editName" })}>
                                        <div className='icon-father' style={{ background: "#56B3F5", width: 25 + "px", borderRadius: 5 + "px" }}>
                                            <FontAwesomeIcon icon={faUser} color='#fff' size="sm" style={{ marginLeft: "5px", marginTop: "5px" }} />
                                            <span>name</span>
                                        </div>
                                        <span className='name'>{userInfo.FirstName + " " + userInfo.LastName}</span>
                                    </div>
                                    <div className='main-info' onClick={() => dispatch1({ type: "EditPhoneNumber" })}>
                                        <div className='icon-father' style={{ background: "#6DC534", width: 25 + "px", borderRadius: 5 + "px" }}>
                                            <FontAwesomeIcon icon={faPhone} color='#fff' size="sm" style={{ marginLeft: "5px", marginTop: "5px" }} />
                                            <span>PhoneNumber</span>
                                        </div>
                                        <span className='phone-number'>{userInfo.PhoneNumber}</span>
                                    </div>
                                    <div className='main-info' onClick={() => dispatch1({ type: "editUserName" })} >
                                        <div className='icon-father' style={{ background: "#ED9F20", width: 25 + "px", borderRadius: 5 + "px" }}>
                                            <FontAwesomeIcon icon={faAt} color='#fff' size="sm" style={{ marginLeft: "5px", marginTop: "5px" }} />
                                            <span>username</span>
                                        </div>
                                        <span className='username'>{userInfo.userName ? <span >{"@" + userInfo.userName}</span> : <span >Add username</span>}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                            : currentState?.security ? <div className='securityMenu'>
                                <FontAwesomeIcon className='back-button' icon={faArrowLeft} color="#23292F" onClick={() => dispatch1({ type: 'closeSecurityMenu' })} />
                            </div> : currentState?.editPhoneNumber ?
                                <div>
                                    <div className='EditPhoneNumber'>
                                        <div className='header'>
                                            <FontAwesomeIcon className='back-button' icon={faArrowLeft} color="#23292F" onClick={() => dispatch1({ type: 'CloseEditPhoneNumber' })} />
                                            <span className='text'>Edit Your Phonenumber</span>
                                        </div>
                                        <div className='main'>
                                            <img src={changeSimGif} alt="gif" className='changeSimGif' />
                                            <Button type='button' onClick={() => dispatch1({ type: "changeNumber" })}>Change number</Button>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <FontAwesomeIcon onClick={() => dispatch1({ type: "isLogOut" })} className='more-bnt' icon={faEllipsisV} color="#23292F" />
                                    {currentState?.isLogOut && <div className='log-out'>
                                        <FontAwesomeIcon className='log-out-icon' icon={faRightToBracket} color="#23292F" />
                                        <span className='log-out-button' onClick={logOut}>Log out</span>
                                    </div>}
                                    <Modal.Title>
                                        <h1 className='settings-text'>Settings</h1>
                                        <div className='userInfo'>
                                            <div className='header'>
                                                <div className='user-profile-photos'>
                                                    {
                                                            <div className='ProfilePic'>
                                                                {
                                                                    <div className='Image'>
                                                                        <Gallery props={{ url: userInfo.PhotoUrl, user: userInfo.uid }} />
                                                                    </div>
                                                                }
                                                            </div>
                                                    }
                                                </div>
                                                <div className='userName-userPhonoNumber'>
                                                    <h1 className='names'>{userInfo.FirstName + " " + userInfo.LastName}</h1>
                                                    <h1 className='phoneNumber'>{userInfo.PhoneNumber}</h1>
                                                    <span onClick={() => dispatch1({ type: "editUserName" })} className='userName'>{userInfo.userName ? <p >{"@" + userInfo.userName}</p> : <p >Add username</p>}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='controls'>
                                            <div className='control-buttons' onClick={() => dispatch1({ type: 'editProfile' })}>
                                                <div className='icon-father' style={{ background: "#ED9F20", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                    <FontAwesomeIcon icon={faUser} color='#fff' size="sm" />
                                                </div>
                                                Edit profile
                                            </div>
                                            <div className='control-buttons'>
                                                <div className='icon-father' style={{ background: "#F06964", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                    <FontAwesomeIcon icon={faBell} color='#fff' size="sm" />
                                                </div>
                                                Notification and sound
                                                <span className='soon'>coming soon</span>
                                            </div>
                                            <div className='control-buttons' onClick={() => dispatch1({ type: 'security' })}>
                                                <div className='icon-father' style={{ background: "#6DC534", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                    <FontAwesomeIcon icon={faLock} color='#fff' size="sm" />
                                                </div>
                                                Privacy and security
                                            </div>
                                            <div className='control-buttons'>
                                                <div className='icon-father' style={{ background: "#56B3F5", width: 25 + "px", borderRadius: 5 + "px" }}>
                                                    <FontAwesomeIcon icon={faMessage} color='#fff' size="sm" />
                                                </div>
                                                Chat setting
                                                <span className='coming soon'>coming soon</span>
                                            </div>
                                        </div>
                                    </Modal.Title>
                                </div>
                    }
                </Modal.Header>

            </Modal>

            {/* add username , edit name , change phone number */}
            {
                <Modal show={currentState?.show}
                    size="sm"
                    style={{
                        top: 130 + "px",
                    }}

                >
                    {currentState?.editUserName ? <div>
                        <Modal.Header >
                            <Modal.Title>Username</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='d-flex flex-column gap-3' style={{
                            background: "#17212B",

                        }}>
                            <input spellcheck="false" defaultValue={defaultUserName} onChange={(e) => setUserName(e.target.value)} className='form-control test' type="text" placeholder='username' />
                            {checkUserName ? <span className='text-danger'>sorry this userName taken</span> : userName == "" ? "" : userName.length >= 6 ? "" : <span className='text-danger'>This username is too short</span>}
                            <div className='d-flex flex-row-reverse bd-highlight gap-2'>
                                <Button variant="secondary" onClick={() => dispatch1({ type: "CloseEditUserName" })} >
                                    Close
                                </Button>
                                <Button variant="primary" onClick={AddUserName}>
                                    Save
                                </Button>
                            </div>
                        </Modal.Body>
                    </div>
                        : currentState?.editName ? <div>
                            <Modal.Header  >
                                <Modal.Title>Edit your name</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className='d-flex flex-column gap-3' style={{
                                background: "#17212B",
                            }}>
                                <form onSubmit={AddName}>
                                    <input spellCheck="false" defaultValue={userInfo.FirstName} className='form-control' type="text" placeholder='firstName' />
                                    <br />
                                    <input spellCheck="false" defaultValue={userInfo.LastName} className='form-control' type="text" placeholder='lastName' />
                                    <br />
                                    <div className='d-flex flex-row-reverse bd-highlight gap-2'>
                                        <Button variant="secondary" onClick={() => dispatch1({ type: "CloseEditName" })} type="button">
                                            Close
                                        </Button>
                                        <Button variant="primary" type='submit'>
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </Modal.Body>
                        </div> : currentState?.changeNumber ? <div >
                            <Modal.Header  >
                                <Modal.Title>Change Phonenumber</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className='d-flex flex-column gap-3' style={{
                                background: "#17212B",
                            }}>
                                <form onSubmit={EditPhoneNumber}>
                                    {
                                        sendCode ? <div>
                                            <input value={code} onChange={(e) => setCode(e.target.value)} spellCheck="false" className='form-control' type="text" placeholder='enter code' />
                                            <br />
                                            <div className='d-flex flex-row-reverse bd-highlight gap-2'>
                                                <Button variant="primary" type="submit">
                                                    Get Code
                                                </Button>
                                                <Button variant="secondary" type='button' onClick={() => dispatch1({ type: "CloseChangeNumber" })}>
                                                    Cencel
                                                </Button>
                                            </div>
                                        </div>
                                            : <div>
                                                <input spellCheck="false" className='form-control' type="text" placeholder='new phone number' />
                                                <br />
                                                <span className='text-secondary'>We've sent you a code via SMS. Please enter it <br /> above.</span>
                                                <div className='d-flex flex-row-reverse bd-highlight gap-2'>
                                                    <Button variant="primary" type="submit">
                                                        Send Code
                                                    </Button>
                                                    <Button variant="secondary" type='button' onClick={() => dispatch1({ type: "CloseChangeNumber" })}>
                                                        Cencel
                                                    </Button>
                                                </div>
                                            </div>

                                    }
                                </form>
                            </Modal.Body>
                        </div> : "xato"
                    }
                </Modal>
            }
        </div >

    );
}

export default Settings;
