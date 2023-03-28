import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faUpload } from '@fortawesome/free-solid-svg-icons'
import { ref, uploadBytesResumable, getDownloadURL, uploadString } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, useOutletContext, } from "react-router-dom";
import { db, storage } from '../../DataBase/Firebase.Config';
import { updateProfile } from 'firebase/auth';
import loadingGif from '../../img/loading2.gif'
import uploadImage from '../../img/uploadImageRemovebg.png'
import './scss/Register.scss'
// demo images 
import demoImages from './images.json'
const Register = () => {
    const navigate = useNavigate()
    const { user } = useOutletContext()
    const [selectPhoto, setSelectPhoto] = useState('')
    const [photo, setPhoto] = useState('')
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    function fileToBase64(file) {
        setPhoto(file)
        let render = new FileReader()
        render.readAsDataURL(file)
        render.onload = () => {
            setSelectPhoto(render.result)
        }
    }
    const registration = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
            const storageRefForDemoImage = ref(storage, `${user.phoneNumber}/image`)
            const storageRef = ref(storage, `${user.phoneNumber} /${photo.name}`);
            photo === "" ?
                // if not have image defoult image
                uploadString(storageRefForDemoImage, demoImages.demoUserImage, 'data_url').then((snapshot) => {
                    getDownloadURL(storageRefForDemoImage).then(async (downloadURL) => {
                        try {
                            // Update profile   
                            await updateProfile(user, {
                                displayName: firstName + "/" + lastName,
                            });
                            //create user on firestore  
                            await setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                firstName: firstName && firstName.toLowerCase(),
                                lastName: lastName && lastName.toLowerCase(),
                                phoneNumber: user.phoneNumber,
                                demoImage: true,
                                gallery: []
                            });
                            // create empty user chats on firestore
                            await setDoc(doc(db, "userChats", user.uid), {});
                            await setDoc(doc(db, "savedMessages", user.uid), { savedMessages: [] });
                            navigate("/home");
                        } catch (err) {
                            console.log(err);
                        }
                    })
                }) :
                // if have image
                await uploadBytesResumable(storageRef, photo).then(() => {
                    getDownloadURL(storageRef).then(async (downloadURL) => {
                        try {
                            // Update profile
                            await updateProfile(user, {
                                displayName: firstName + "/" + lastName,
                                photoURL: downloadURL,
                            });
                            //create user on firestore  
                            await setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                firstName: firstName && firstName.toLowerCase(),
                                lastName: lastName && lastName.toLowerCase(),
                                phoneNumber: user.phoneNumber,
                                demoImage: false,
                                gallery: [downloadURL]
                            });
                            //create empty user chats on firestore
                            await setDoc(doc(db, "userChats", user.uid), {});
                            await setDoc(doc(db, "savedMessages", user.uid), { savedMessages: [] });
                            navigate("/home");
                        } catch (err) {
                            console.log(err);
                        }
                    });
                });
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <div className=' Register'>
            <div className='inputs'>
                <form className='form' onSubmit={registration}>
                    {
                        selectPhoto ? <img width={120} height={120} style={{ borderRadius: "50%" }} src={selectPhoto} alt="" /> :
                            <label className='file-input'>
                                <img src={uploadImage} alt="uploadImage" />
                                <span className='text'>Upload image for your </span>
                                <input hidden type="file" accept='.png, .jpg' value={selectPhoto} onChange={e => fileToBase64(e.target.files[0])} />
                            </label>
                    }
                    <label htmlFor="fname">First Name</label>
                    <input spellCheck="false" type="text" id="fname" name="firstname" placeholder="Your name.." value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <label htmlFor="lname">Last Name</label>
                    <input spellCheck="false" type="text" id="lname" name="lastname" placeholder="Your last name.." value={lastName} onChange={e => setLastName(e.target.value)} />
                    <button className='submit-btn' type="submit" value="Submit" ><span>{loading ? <img src={loadingGif} alt="loading..." /> : 'Register'}</span></button>
                </form>
            </div>
        </div>
    );
}


export default Register;

{/* <div className='col-md-4'>
                <div className='forUserPhoto d-flex flex-column align-items-center gap-2'>
                    {
                        selectPhoto ? <img width={75} src={selectPhoto} alt="" /> : <div>
                            <label>
                                <FontAwesomeIcon icon={faImage} size="4x" />
                                <input hidden type="file" accept='.png, .jpg' value={selectPhoto} onChange={e => fileToBase64(e.target.files[0])} />
                            </label>
                            <span className=''>Put a photo on your profile</span>
                        </div>
                    }
                </div>
                <div className='inputs d-flex gap-2 mt-4'>
                    <input spellCheck="false" required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder='FirstName' className='form-control mt-1' />
                    <input spellCheck="false" required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder='LastName' className='form-control mt-1' />
                </div>
                <button className='btn btn-info  w-100 mt-2' onClick={registration}>{loading ?
                    <img width={23} src={loadingGif} alt="img" /> : "Register"}

                </button>
            </div> */}
