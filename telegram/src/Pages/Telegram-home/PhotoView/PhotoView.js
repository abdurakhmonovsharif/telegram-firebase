import { faClose, faCloudDownload, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './scss/PhotoView.scss'
const PhotoView = () => {
    const { photoViewID, setPhotoViewID } = useOutletContext()
    function imageDownload() {
        var a = document.createElement("a"); //Create <a>
        a.href = photoViewID //Image Base64 Goes here
        a.download = photoViewID + ".png"; //File name Here
        a.click(); //Downloaded file
    }
    return (
        <div className={photoViewID ? "PhotoView" : "d-none"} onClick={() => setPhotoViewID("")}>
            <FontAwesomeIcon icon={faDownload} color="#FFF" className='PhotoView-downlaod-icon' onClick={() => imageDownload()} />
            <FontAwesomeIcon icon={faClose} color="#FFF" size='2x' className='PhotoView-close-icon' onClick={() => setPhotoViewID(null)} />
            <img src={photoViewID} className="image" alt="image" width={600} />
        </div>
    );
}

export default PhotoView;
