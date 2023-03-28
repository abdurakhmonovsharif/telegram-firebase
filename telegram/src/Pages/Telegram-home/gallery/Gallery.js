import { faDownload, faTrash, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateProfile } from 'firebase/auth';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Carousel, Modal, ModalHeader, ModalTitle } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { db, dbAuth, storage } from '../../../DataBase/Firebase.Config';
import { CHANGE_FILE } from '../../Home';
import './scss/Gallery.scss'
import images from '../../Register/images.json'
import loading from '../../../img/200.gif'
const Gallery = ({ props }) => {
    const { state, dispatch, currentUser } = useOutletContext()
    const [photo, setPhoto] = useState("")
    const [galleryArray, setGalleryArray] = useState([])
    const [showAll, setshowAll] = useState(false)
    const [isDelete, setIsDelete] = useState(null)
    const [isDeleteModal, setIsDeleteModal] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const handleClose = () => dispatch({ type: CHANGE_FILE, payload: null })
    state?.file && fileToBase64()
    function fileToBase64() {
        let render = new FileReader()
        render.readAsDataURL(state?.file)
        render.onload = () => {
            setPhoto(render.result)
        }
    }
    useEffect(() => {
        getGallery()
    }, [state?.file, showAll])
    async function chengeGallery() {
        if (props?.user != undefined) {
            setIsAdding(true)
            const docRef = doc(db, "users", props?.user);
            getDoc(docRef).then(async res => {
                if (res.data().gallery.length <= 72) {
                    const docRef = doc(db, "users", dbAuth?.currentUser?.uid);
                    const storageRef = ref(storage, `${dbAuth?.currentUser?.phoneNumber}/gallery/${state?.file.name}`);
                    await uploadBytesResumable(storageRef, state?.file).then(() => {
                        getDownloadURL(storageRef).then(async (downloadURL) => {
                            try {
                                await updateDoc(docRef, {
                                    gallery: arrayUnion(downloadURL),
                                }).then(res => {
                                    dispatch({ type: CHANGE_FILE, payload: null })
                                    setIsAdding(false)
                                })
                            } catch (err) {
                                console.log(err);
                            }
                        }).catch(err => {
                            console.log(err);
                        })
                    });
                }
            })
        }
    }
    function getGallery() {
        if (props?.user != undefined) {
            const docRef = doc(db, "users", props?.user);
            getDoc(docRef).then(res => {
                setGalleryArray(res.data().gallery);

            })
        }
    }
    function showAllGallery() {
        if (!props.sider) {
            setshowAll(true)
        }
    }
    async function imageDelete() {
        galleryArray.splice(isDelete, 1)
        setGalleryArray([...galleryArray])
        await updateDoc(doc(db, "users", dbAuth.currentUser.uid), {
            gallery: galleryArray
        }).then(res => {
            setIsDeleteModal(false)
        })
        if (galleryArray.length == 1) {
            await updateProfile(dbAuth?.currentUser != null && dbAuth?.currentUser, {
                photoURL: null
            })
        }

    }
    async function imageDownload(url) {
        var a = document.createElement("a"); //Create <a>
        a.href = url //Image Base64 Goes here
        a.download = "avatar.png"; //File name Here
        a.click(); //Downloaded file
        a.remove();
    }
    function galleryImages() {
        if (galleryArray.length > 1) {
            return (<img onClick={showAllGallery} src={galleryArray[galleryArray.length - 1]} alt="image" width={"100%"} height={"100%"} style={{ borderRadius: "50%" }} />)
        } else if (galleryArray.length == 1) {
            return (<img onClick={showAllGallery} src={galleryArray[0]} alt="image" width={"100%"} height={"100%"} style={{ borderRadius: "50%" }} />)
        }
        else {
            return (<img src={images.demoUserImage} alt="image" width={"100%"} height={"100%"} style={{ borderRadius: "50%" }} />)
        }
    }
    return (
        <div className='Gallery'>
            {
                isDeleteModal && <div className='delete-image'>
                    <span>do you want to delete this photo?</span>
                    <div className='btns'>
                        <button className='yes-btn' onClick={() => imageDelete()}>Yes</button>
                        <button className='not-btn' onClick={() => setIsDeleteModal(false)}>NO</button>
                    </div>
                </div>
            }
            <Modal show={state?.file ? true : false}
                onHide={handleClose}
                animation={true}
            >
                <ModalHeader closeButton className='d-flex flex-column'>
                    <ModalTitle>Add image for your profile</ModalTitle>
                    <img src={photo} alt="image" style={{ width: "100%" }} />
                    <div className='d-flex'>
                        <button onClick={chengeGallery} className='button'><span>{isAdding ? "Posting..." : "Save"}</span></button>
                    </div>
                </ModalHeader>
            </Modal>
            <div className='profile-image'>
                <div className='gallery-demo-image'>{galleryImages()}</div>
            </div>
            {/* showAllGallery */}
            <Modal className='gallery-modal' show={showAll} animation onHide={handleClose} size="xl" >
                <ModalHeader>
                    <Carousel interval={null} className="w-100 text-center " >
                        {
                            galleryArray && galleryArray?.map((item, index) => <Carousel.Item key={index}>
                                <div className='d-flex justify-content-end gap-4 p-2'>
                                    <span>{index + 1}/72</span>
                                    {
                                        dbAuth?.currentUser?.uid == props?.user && <div className='d-flex justify-content-end gap-4 px-1'>
                                            <FontAwesomeIcon onClick={() => {
                                                setIsDeleteModal(true)
                                                setIsDelete(index)
                                                setshowAll(false)
                                            }} icon={faTrash} style={{ cursor: "pointer", fontSize: "22px", zIndex: 2 }} />
                                        </div>
                                    }
                                    <FontAwesomeIcon onClick={() => imageDownload(item)} icon={faDownload} style={{ cursor: "pointer", fontSize: "22px", zIndex: 2 }} />
                                    <FontAwesomeIcon onClick={() => setshowAll(false)} icon={faX} style={{ cursor: "pointer", fontSize: "22px", zIndex: 2 }} />
                                </div>
                                <img src={item} alt="image" width={500} />
                            </Carousel.Item>)
                        }
                    </Carousel>
                </ModalHeader>
            </Modal>
        </div>
    );
}

export default Gallery;
