import React, { useContext, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'keen-slider/keen-slider.min.css'
import { Context } from './context/ContextProvider';
const Layout = () => {
  console.log = function () {};
console.error = function () {};
console.warn = function () {};
console.info = function () {};
console.debug = function () {};
    const location = useLocation();

    const { isDarkMode } = useContext(Context);
    useEffect(() => {
      const favicon = document.querySelector("link[rel~='icon']");
      if (favicon) {
        favicon.href = isDarkMode ? '/assets/favicon/Favicon_dark.png' : '/assets/favicon/Favicon_Blue.png';
      }
    }, [isDarkMode]);
    if (localStorage.getItem("role") === "trader" && location.pathname === "/dash") {
        return <Navigate to={"/deposit"} replace />;
    }
    
    return (
        <div className='inter'>
            <Outlet />
        </div>
    );
}

export default Layout;
