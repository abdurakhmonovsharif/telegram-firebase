import React, { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './scss/Chat.scss'
import { faEllipsisV, faPaperclip, faPaperPlane, faPhone, faSmile, faMicrophone, faFile, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuid } from "uuid";
import { arrayUnion, collection, doc, getDocs, onSnapshot, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore";
import { db, dbAuth, storage } from "../../../DataBase/Firebase.Config";
import Messages from '../messages/Messages';
import { Button, Modal } from 'react-bootstrap';
import Loading from '../../../img/200.gif'
import Emoji from '../emojis/Emojis.json'
import Gallery from '../gallery/Gallery';
import { useEffect } from 'react';
const Chat = ({ props }) => {
    const { state, currentUser, barStyle, setBarStyle, savedMessagesShow, inputValue, setInputValue } = useOutletContext()
    const [file, setFile] = useState(null)
    const [uploadProgress, setUploadprogress] = useState(0)
    const [disabletSentBtn, setDisabledSentBtn] = useState(false)
    const [showEmoji, setShowEmoji] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [messageInput, setMessageInput] = useState('')
    const [userInfo, setUserInfo] = useState({})
    // file types
    const [fileType, setFileType] = useState("")
    const [fileSize, setFileSize] = useState("")
    const typesForImages = ["png", "jpg", "jpeg", "svg", "webp"];
    const typesForVideos = ["mp4", "mov", "wmv", "avi", "avchd", "mkv"];
    const typesForAudio = ["mp3", "x-m4a", "aac", "m4a"];
    // emojis
    const [emojis, setEmojis] = useState(Emoji.emojis)
    let indexOfSlesh = currentUser?.displayName?.indexOf("/");
    let currentUser_firstName = currentUser?.displayName?.substring(0, indexOfSlesh);
    let currentUser_lastName = currentUser?.displayName?.substring(indexOfSlesh + 1);
    const [img, setImg] = useState("")
    const [editedMessage, setEditedMessage] = useState([])
    useEffect(() => {
        if (inputValue?.edit) {
            setMessageInput(inputValue.value)
        }
    }, [inputValue?.edit])
    const handeSelect = async (e) => {
        setShowEmoji(false)
        e.preventDefault()
        let date = new Date();
        let dot_Index = date.toISOString().lastIndexOf(".");
        let T_Index = date.toISOString().indexOf("T")
        if (file) {
            setDisabledSentBtn(true)
            try {
                //sent file
                const storageRef = ref(storage, uuid());
                const uploadTask = uploadBytesResumable(storageRef, selectedFile);
                uploadTask.on("state_changed",
                    (snapshot) => {
                        const progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)
                        setUploadprogress(progress)
                        if (file === null) return;
                    },
                    (error) => {
                        // err
                    },
                    () => {
                        let currenttime = date.toISOString().substring(T_Index + 1, dot_Index - 3)
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            setFile(null)
                            setUploadprogress(0)
                            setDisabledSentBtn(false)
                            if (savedMessagesShow) {
                                await updateDoc(doc(db, "savedMessages", dbAuth?.currentUser?.uid), {
                                    savedMessages: arrayUnion({
                                        messageInput,
                                        date: Timestamp.now(),
                                        currenttime,
                                        img: downloadURL,
                                        fileType,
                                    }),
                                })
                            }
                            if (editedMessage.length == 0) {
                                await updateDoc(doc(db, "chats", state?.chatId), {
                                    messages: arrayUnion({
                                        id: uuid(),
                                        senderId: currentUser.uid,
                                        date: Timestamp.now(),
                                        img: downloadURL,
                                        fileType,
                                        currenttime
                                    }),
                                }).then(res => {
                                    window.scrollX = 0
                                })
                            } else {
                                await updateDoc(doc(db, "chats", state?.chatId), {
                                    messages: editedMessage
                                }).then(res => {
                                    setInputValue(
                                        { edit: false, value: "", chatId: "null", text_id: "null" }
                                    )
                                })
                            }

                        });
                    }
                );

            } catch {

            }
        } else {
            let boolean = false;
            let currenttime = date.getHours() + ":" + date.getMinutes()
            for (var i = 0; i < messageInput.length; i++) {
                var charValue = messageInput.charCodeAt(i);
                if (charValue != 32) {
                    boolean = true;
                    break;
                }
            }
            // sent sms
            try {
                if (boolean) {
                    setMessageInput("")
                    if (savedMessagesShow) {
                        await updateDoc(doc(db, "savedMessages", dbAuth?.currentUser?.uid), {
                            savedMessages: arrayUnion({
                                messageInput,
                                date: Timestamp.now(),
                                currenttime,
                            })
                        })
                    }
                    await updateDoc(doc(db, "chats", state?.chatId), {
                        messages: arrayUnion({
                            id: uuid(),
                            messageInput,
                            senderId: currentUser.uid,
                            date: Timestamp.now(),
                            currenttime,
                            isLike: false
                        }),
                    })
                    await updateDoc(doc(db, "userChats", currentUser.uid), {
                        [state?.chatId + ".date"]: serverTimestamp(),
                    })
                    await updateDoc(doc(db, "userChats", state?.user?.uid), {
                        [state?.chatId + ".userInfo"]: {
                            firstName: currentUser_firstName,
                            lastName: currentUser_lastName,
                            uid: currentUser.uid,
                            photoURL: currentUser.photoURL,
                        },
                        [state?.chatId + ".lastMessage"]: {
                            messageInput
                        },
                        [state?.chatId + ".date"]: serverTimestamp()
                    })
                }
            } catch {
                // err
            }


        }

    }
    function selectFile(e) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        let fileSize1 = e.target.files[0]?.size;
        let defaultByte = 1024
        setSelectedFile(e.target.files[0]);
        const i = fileSize == 0 ? 0 : Math.floor(Math.log(fileSize1) / Math.log(defaultByte))
        setFileSize(Math.floor(fileSize1 / Math.pow(defaultByte, i)).toString() + sizes[i])
        // check file type
        let indexOfDot = e.target.files[0].name.lastIndexOf(".");
        let type = e.target.files[0].name.substring(indexOfDot + 1);
        setFileType(type)
        if (i <= 4) {
            let eventFile = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(eventFile);
            reader.onload = () => {
                setFile(reader.result)
            };
        }

    }
    function addEmoji(item) {
        let message = messageInput + item
        setMessageInput(message)
    }
    useEffect(() => {
        getUserInformations()
    }, [state?.user?.uid])
    const getUserInformations = async () => {
        const q = query(collection(db, "users"), where("uid", "==", state?.user?.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setUserInfo(doc.data());
        });
    }
    return (
        <div className='Chat' onClick={() => {
            if (props.userInfoShow) props.setUserInfoShow(false)
            if (barStyle) setBarStyle(false)
        }}>
            <div className='chat-header'>
                <div className='user-header'>
                    {
                        savedMessagesShow ? <div className='chat-header-savedMessage'>
                            <div className='user-info' >
                                <span>SavedMessages</span>
                            </div>
                        </div> :
                            <div className='user-chat-header' onClick={() => {
                                if (!props.userInfoShow) props.setUserInfoShow(true)
                            }}>
                                <div className='user-info'>

                                    <div className='ProfilePic'>
                                        <div className='DemoImage'>
                                            <Gallery props={{ user: state?.user?.uid, sider: true }} />
                                        </div>
                                    </div>
                                    <div className='d-flex gap-2'>
                                        <span>{userInfo?.firstName ? userInfo?.firstName : "loading..."}</span>
                                        <span>{userInfo?.lastName ? userInfo?.lastName : "loading... "} </span>
                                    </div>
                                </div>
                                <div className='other-btns'>
                                    <FontAwesomeIcon icon={faPhone} size='lg' />
                                    <FontAwesomeIcon icon={faEllipsisV} size='lg' />
                                </div>

                            </div>
                    }



                </div>

            </div>
            <div className='messeges' >
                <Messages />
            </div>
            <form className='sent-sms' onSubmit={handeSelect}>
                <label>
                    <FontAwesomeIcon icon={faPaperclip} size="lg" color='#fff' />
                    <input type="file" hidden onChange={selectFile} />
                </label>
                {/* if select file  */}
                <Modal show={file != null}
                    style={{
                        top: 20 + "px",
                    }}
                >
                    <Modal.Body className='d-flex flex-column gap-3 py-2'>
                        <div className='sending-files'>
                            {
                                // video
                                typesForVideos.includes(fileType) ? <div className='videoImage'>
                                    <video src={img} controls width={300}></video>
                                </div>
                                    :
                                    // images 
                                    typesForImages.includes(fileType) ? <img src={file} alt="img" />
                                        :
                                        // audio
                                        typesForAudio.includes(fileType) ? <audio controls src={file} /> :
                                            // other files
                                            <div style={{ position: "relative", fontSize: "22px" }}>
                                                <FontAwesomeIcon icon={faFile} className="file-icon" size='4x' />
                                                <span style={{ position: "absolute", left: "5px", color: "#FFF", fontSize: "20px", bottom: "3px" }}>{fileType}</span>
                                            </div>
                            }
                        </div>

                        <div className='d-flex flex-row-reverse bd-highlight gap-2'>
                            <Button variant="primary" onClick={handeSelect} disabled={disabletSentBtn}>
                                Sent
                            </Button>
                            <Button variant="secondary" onClick={() => setFile(null)} >
                                Close
                            </Button>
                            <div className='d-flex gap-3'>
                                <span>Size:{fileSize}</span>
                                <span >{uploadProgress ? uploadProgress + "%" : ""}</span>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
                {/* emojis */}
                {
                    showEmoji && <div className='emojis-div' >
                        <FontAwesomeIcon icon={faClose} onClick={() => setShowEmoji(false)} color="#FFF" size='xl' className='emoji-close-btn' />
                        <div className='emojis'>
                            {emojis.length > 10 ? <div className='box-emoji'>
                                {emojis?.map((item, index) => <div key={index} onClick={() =>
                                    addEmoji(item.emoji)
                                } className='emoji'>{item.emoji}</div>)
                                }</div> : <span>loading...</span>}
                        </div>
                    </div>
                }
                <input maxLength={300} spellCheck="false" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className='text-white' placeholder='sent massege' type="text" />
                <div className='d-flex gap-3 align-items-center'>
                    <FontAwesomeIcon icon={faSmile} size="lg" color='#fff' onMouseMove={() => setShowEmoji(true)} />
                    {
                        messageInput === "" ?
                            <FontAwesomeIcon icon={faMicrophone} size="lg" color='#fff' />
                            :
                            <FontAwesomeIcon icon={faPaperPlane} size="lg" color='#fff' onClick={handeSelect} />
                    }
                </div>

            </form >
        </div >
    );
}

export default Chat;
