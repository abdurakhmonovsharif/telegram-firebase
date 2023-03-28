import { doc, onSnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faFile, faPause, faPencil, faPlay } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, dbAuth } from '../../../DataBase/Firebase.Config';
import '../chats/scss/Chat.scss'
const Messages = () => {
    const { state, currentUser, setPhotoViewID, savedMessagesShow, setInputValue, inputValue } = useOutletContext()
    const [messages, setMessages] = useState([])
    const [contextMenuVisible, setContextMenuVisible] = useState(false)
    const [savedMessages, setSavedMessages] = useState([])
    const [forCopy, setForCopy] = useState("")
    const [textId, setTextId] = useState("")
    const typesForImages = ["png", "jpg", "jpeg", "svg", "webp", "gif"];
    const typesForVideos = ["mp4", "mov", "wmv", "avi", "avchd", "mkv"];
    const typesForAudio = ["mp3", "x-m4a", "aac", "m4a"];
    const ref = useRef();
    const [contextMenuPosition, setContextMenuPosition] = useState({
        x: 0,
        y: 0
    })
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, savedMessages])
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", state?.chatId), (doc) => {
            doc.exists() && setMessages(doc.data()?.messages);
        });
        return () => {
            unSub();
        }
    }, [state?.chatId])
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "savedMessages", dbAuth?.currentUser?.uid), (doc) => {
            doc.exists() && setSavedMessages(doc.data()?.savedMessages);
        });
        return () => {
            unSub();
        }
    }, [savedMessagesShow])
    async function handleShowMenu(e, id, userId, text) {
        setForCopy(text)
        setInputValue({
            edit: false, value: text, chatId: state?.chatId, text_id: id
        })
        setTextId(id)
        setContextMenuVisible(true)
        setContextMenuPosition({
            x: e.pageX - 100,
            y: e.pageY
        })
        if (userId != currentUser.uid) return
        e.preventDefault()
        // let newItem = messages.map(item => {
        //     if (item.id == id) {

        //         return { ...item, messageInput: "test" }
        //     }
        //     return item;
        // })
        // setMessages(newItem)
        // await updateDoc(doc(db, "chats", state.chatId), {
        //     messages: messages
        // })
    }

    function copyTextToClipBoard() {
        navigator.clipboard.writeText(forCopy).then(function () {
        }).catch(function (err) {
        });
    }
    function editMessage() {
        setInputValue({
            edit: true, value: forCopy, chatId: state?.chatId, text_id: textId
        })
    }
    return (
        <div>
            {
                savedMessagesShow == false ? messages?.map(m => <div ref={ref} className={m.senderId === currentUser.uid ? "currentUserMessage" : "userMessage"} key={m.id}>
                    <div className='message d-flex flex-column align-items-end mt-1 '>
                        <div className='mt-1'>
                            {
                                m.img ?
                                    // for video
                                    typesForVideos.includes(m.fileType) ?
                                        <div className='video-div'>
                                            <video src={m.img} controls className="video" />
                                        </div>
                                        // for images
                                        :
                                        typesForImages.includes(m.fileType) ?
                                            <img src={m.img} alt="img" className='image' onClick={() => setPhotoViewID(m.img)} />
                                            :
                                            // for audio
                                            typesForAudio.includes(m.fileType) ?
                                                <audio src={m.img} controls /> :
                                                // if file not fount
                                                <div className='other-file'>
                                                    <span className='file-type'>{m.fileType}</span>
                                                    <FontAwesomeIcon icon={faFile} size="2xl" className='file' />
                                                </div>
                                    :
                                    // if haven't file
                                    ""
                            }
                        </div>
                        <div style={{
                            position: "absolute",
                            top: contextMenuPosition.y + "px",
                            left: contextMenuPosition.x + "px",
                        }} className={contextMenuVisible ? 'context-menu bg-dark' : 'd-none'}>
                            <button onClick={editMessage}>
                                <FontAwesomeIcon icon={faPencil} className="pencil-icon" />
                                Edit</button>
                            <button onClick={copyTextToClipBoard}>Copy</button>
                        </div>
                        <div className='text-status' onContextMenu={(e) => handleShowMenu(e, m.id, m.senderId, m.messageInput)} >
                            {
                                m?.messageInput?.substring(0, 4) === "http" ?
                                    <a target="_blank" href={m.messageInput} className={"text text-primary"} style={{ cursor: "pointer" }}>
                                        {m.messageInput}
                                    </a> :
                                    <span className={"text"} >
                                        {m.messageInput}
                                    </span>
                            }
                            <div className='time-doubleCheck'>
                                <span className='currentTime'>{m.currenttime}</span>
                                <FontAwesomeIcon color={"#354bad"} icon={faCheckDouble} size={"xs"} className={"dubleCheck"} />
                            </div>
                        </div>
                    </div>
                </div>) :
                    savedMessages?.map((m, index) => <div ref={ref} className={"currentUserMessage"} key={index}>
                        <div className='message d-flex flex-column align-items-end mt-1 '>
                            <div className='mt-1'>
                                {
                                    m.img ?
                                        // for video
                                        typesForVideos.includes(m.fileType) ?
                                            <div className='video-div'>
                                                <video src={m.img} controls className="video" />
                                            </div>
                                            // for images
                                            :
                                            typesForImages.includes(m.fileType) ?
                                                <img src={m.img} alt="img" className='image' onClick={() => setPhotoViewID(m.img)} />
                                                :
                                                // for audio
                                                typesForAudio.includes(m.fileType) ?
                                                    <audio src={m.img} controls /> :
                                                    // if file not fount
                                                    <div className='other-file'>
                                                        <span className='file-type'>{m.fileType}</span>
                                                        <FontAwesomeIcon icon={faFile} size="2xl" className='file' />
                                                    </div>
                                        :
                                        // if haven't file
                                        ""
                                }
                            </div>
                            <div className='text-status' onContextMenu={(e) => handleShowMenu(e, m.id, m.senderId)} >
                                {
                                    m?.messageInput?.substring(0, 4) === "http" ?
                                        <a target="_blank" href={m.messageInput} className={"text text-info"} >
                                            {m.messageInput}
                                        </a> :
                                        <span className={"text"} >
                                            {m.messageInput}
                                        </span>
                                }

                                <div className='time-doubleCheck'>
                                    <span className='currentTime'>{m.currenttime}</span>
                                    <FontAwesomeIcon color={"#354bad"} icon={faCheckDouble} size={"xs"} className={"dubleCheck"} />
                                </div>
                            </div>
                        </div>
                    </div>)
            }

        </div >
    );
}

export default Messages;
