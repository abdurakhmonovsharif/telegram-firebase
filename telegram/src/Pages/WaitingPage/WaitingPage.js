import React from 'react';
import './scss/Waiting.scss'
const WaitingPage = () => {
    return (
        <div className='waiting page'>
            <div className="loadingspinner">
                <div id="square1"></div>
                <div id="square2"></div>
                <div id="square3"></div>
                <div id="square4"></div>
                <div id="square5"></div>
            </div>
        </div >
    );
}

export default WaitingPage;
