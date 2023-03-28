import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import React, { useEffect, useState } from "react";
import WaitingPage from "./Pages/WaitingPage/WaitingPage";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db, dbAuth } from "./DataBase/Firebase.Config";
import TelegramHome from "./Pages/Telegram-home/Telegram-home";
function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (location.pathname === "/") {
      setLoading(true)
      let checkLocalStorageWithUserUid = localStorage.getItem("_user-uid");
      let q = query(collection(db, "users"), where("uid", "==", checkLocalStorageWithUserUid))
      getDocs(q).then(res => {
        if (res.docs.length === 0) {
          navigate('/')
          setLoading(false)
        } else {
          navigate("/home")
          setLoading(false)
        }
      })
    }
    else if (location.pathname === "/home") {
      setLoading(true)
    }
  }, [location.pathname])

  return (
    <div>
      <Routes>
        <Route path="/" element={loading ? <WaitingPage /> : <Home />} >
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<TelegramHome loading={{ setLoading, loading }} />} />
        </Route>
      </Routes>
      {/* <DownloadLink
        label="Save"
        filename="myfile.mp4"
        src="https://firebasestorage.googleapis.com/v0/b/telegram-26a2c.appspot.com/o/8d23ee3f-3acb-4941-b5e7-3e45f412eee9?alt=media&token=f10ef391-c24c-4e22-810f-534995b2b816"
      /> */}
    </div>
  );
}

export default App;
