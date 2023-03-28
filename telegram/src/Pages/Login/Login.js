import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import TelegramLogo from '../../img/telegram.png'
import CountryCode from './CountryCode';
import './scss/Login.scss'
import { signInWithPhoneNumber } from 'firebase/auth';
import { db, dbAuth } from '../../DataBase/Firebase.Config';
import { RecaptchaVerifier } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import loadingGif from '../../img/loading2.gif'
const Login = () => {
    const { countryCode, setCountryCode, setUser } = useOutletContext()
    const navigate = useNavigate()
    const { register, handleSubmit, reset } = useForm()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [checkCode, setCheckCode] = useState(false)
    const [loadingforWaitingSignIn, setLoadingforWaitingSignIn] = useState(false)
    const [loadingforWaitingGetCode, setLoadingforWaitingGetCode] = useState(false)
    const [errCode, setErrCode] = useState(false)
    const [errPhone, setErrPhone] = useState(false)
    // phoneVerification
    function phoneVerification(data) {
        setLoadingforWaitingGetCode(true)
        const number = data.phoneNumber
        recaptchaVerifier()
        // sentToNumber
        signInWithPhoneNumber(dbAuth, number, window.recaptchaVerifier)
            .then((confirmationResult) => {
                setLoadingforWaitingGetCode(false)
                window.confirmationResult = confirmationResult;
                setCheckCode(true)
                setPhoneNumber(number)
            }).catch(err => {
                setLoadingforWaitingGetCode(false)
                setErrPhone(true)
            })
        //checkCode 
        checkCode && window.confirmationResult.confirm(data.code).then((result) => {
            setLoadingforWaitingSignIn(true)
            setUser(result.user)
            //save to local for get infomation
            localStorage.setItem("_user-uid", result.user.uid)
            let ref = collection(db, "users")
            let uid = result.user.uid
            // check users if have navigate
            let q = query(ref, where("uid", "==", uid))
            getDocs(q).then(res => {
                if (res.docs.length === 0) {
                    navigate('/register')
                } else {
                    navigate("/home")
                    setLoadingforWaitingSignIn(false)
                }
            }).catch(err => {

            })
        }).catch(err => {
            setErrCode(true)
        })
    }

    // recaptchaVerifier
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
    return (
        <div className='Login'>
            <div>
                <form onSubmit={handleSubmit(phoneVerification)}>
                    {
                        checkCode ? <div>
                            {/* //code */}
                            <div className='logo'>
                                <img className='logo-img' loading='lazy' src={TelegramLogo} alt="logo" width={150} />
                                <div className='titles'>
                                    <div className='d-flex justify-content-center align-items-center gap-2'>
                                        <h5>{phoneNumber}</h5>
                                    </div>
                                    <p>We've sent you a code via SMS. Please enter it <br /> above.</p>
                                </div>
                            </div>
                            <input  {...register("code")} className='form-control mt-2' placeholder='enter code' type="tel" required />
                            <button className='btn btn-primary w-100 mt-3' >
                                {loadingforWaitingSignIn ? <img className='loading-gif' src={loadingGif} width={23} alt="loading" /> : "SendCode"}
                            </button>
                            <span className='text-danger'>{errCode && "invalit code"}</span>
                        </div>
                            :
                            <div>
                                {/* //number */}
                                <div className='logo'>
                                    <img className='logo-img' src={TelegramLogo} alt="logo" width={150} />
                                    <div className='titles'>
                                        <h5>Telegram</h5>
                                        <p>Please confirm your country code and enter your <br /> phone number.</p>
                                    </div>
                                </div>
                                <CountryCode set={setCountryCode} />
                                <input defaultValue={countryCode} {...register("phoneNumber")} className='form-control mt-2' placeholder='your phone number' type="tel" required />
                                <button className='btn btn-primary w-100 mt-3' >
                                    {loadingforWaitingGetCode ? <img className='loading-gif' src={loadingGif} width={23} alt="loading" /> : "NEXT"}
                                </button>
                                {errPhone && <span className='text-danger mt-2'>invalit number</span>}
                            </div>
                    }
                </form>
            </div >
            {/* recaptcha */}
            <div id='recaptcha-container' className='d-none' >
            </div >
        </div >
    );
}

export default Login;
