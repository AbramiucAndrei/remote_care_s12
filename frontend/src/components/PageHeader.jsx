import React, { useState, useEffect } from "react";
import PageHeaderCSS from "./styling/PageHeader.module.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../images/logo1.png";
import { jwtDecode } from "jwt-decode";
import axios from "../axios.js";

const PageHeader = () => {
  const token = localStorage.getItem("token");
  let role = null,
    userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
      userId = decoded.id;
    } catch (e) {
      alert(e);
    }
  }

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications function
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/noti/notifications?role=${role}&user_id=${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch notifications.");
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [token, role, userId, showNotifications]);

  // When bell is clicked, just toggle dropdown (notifications already fetched)
  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const navigate = useNavigate();
  // Optional: Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    //localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <header>
        <nav>
          <div className={PageHeaderCSS.logo_container}>
            <Link className={PageHeaderCSS.logo_link} to="/">
              <img className={PageHeaderCSS.logo_img} src={logo} alt="logo" />
            </Link>
            <h2 className={PageHeaderCSS.page_name}>RemoteCare</h2>
          </div>
          <ul className={PageHeaderCSS.links_list}>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                    : PageHeaderCSS.link
                }>
                Home
              </NavLink>
            </li>
            {!token && (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                        : PageHeaderCSS.link
                    }>
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive
                        ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                        : PageHeaderCSS.link
                    }>
                    Register
                  </NavLink>
                </li>
              </>
            )}
            {token && role === "client" && (
              <>
                <li>
                  <NavLink
                    to="/main_client"
                    className={({ isActive }) =>
                      isActive
                        ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                        : PageHeaderCSS.link
                    }>
                    Book a service
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/client_bookings"
                    className={({ isActive }) =>
                      isActive
                        ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                        : PageHeaderCSS.link
                    }>
                    Your Bookings
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className={
                      showNotifications
                        ? `${PageHeaderCSS.icon_button} ${PageHeaderCSS.icon_button_active}`
                        : PageHeaderCSS.icon_button
                    }
                    onClick={handleBellClick}>
                    <span className="material-icons">notifications</span>
                    <span className={PageHeaderCSS.icon_button__badge}>
                      {notifications.filter((n) => !n.read_notification).length}
                    </span>
                  </button>
                  {showNotifications && (
                    <div className={PageHeaderCSS.notifications_dropdown}>
                      {notifications.length === 0 ? (
                        <div className={PageHeaderCSS.notification_empty}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={
                              n.read_notification
                                ? PageHeaderCSS.notification
                                : `${PageHeaderCSS.notification} ${PageHeaderCSS.unread}`
                            }>
                            <span>{n.message}</span>
                            {!n.read_notification && (
                              <button
                                className={PageHeaderCSS.markReadBtn}
                                title="Mark as read"
                                onClick={async () => {
                                  try {
                                    await axios.patch(
                                      `http://localhost:3000/noti/notifications/${n.id}/read`,
                                      { role }
                                    );
                                    setNotifications((prev) =>
                                      prev.map((notif) =>
                                        notif.id === n.id
                                          ? { ...notif, read_notification: 1 }
                                          : notif
                                      )
                                    );
                                  } catch (err) {
                                    alert("Failed to mark as read");
                                  }
                                }}>
                                <span className="material-symbols-outlined">
                                  check_circle
                                </span>
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </li>
              </>
            )}
            {token && role === "worker" && (
              <>
                {" "}
                <li>
                  <NavLink
                    to="/main_worker"
                    className={({ isActive }) =>
                      isActive
                        ? `${PageHeaderCSS.link} ${PageHeaderCSS.active}`
                        : PageHeaderCSS.link
                    }>
                    Manage bookings
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className={
                      showNotifications
                        ? `${PageHeaderCSS.icon_button} ${PageHeaderCSS.icon_button_active}`
                        : PageHeaderCSS.icon_button
                    }
                    onClick={handleBellClick}>
                    <span className="material-icons">notifications</span>
                    <span className={PageHeaderCSS.icon_button__badge}>
                      {notifications.filter((n) => !n.read_notification).length}
                    </span>
                  </button>
                  {showNotifications && (
                    <div className={PageHeaderCSS.notifications_dropdown}>
                      {notifications.length === 0 ? (
                        <div className={PageHeaderCSS.notification_empty}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={
                              n.read_notification
                                ? `${PageHeaderCSS.notification} `
                                : `${PageHeaderCSS.notification} ${PageHeaderCSS.unread}`
                            }>
                            <span>{n.message}</span>
                            {!n.read_notification && (
                              <button
                                className={PageHeaderCSS.markReadBtn}
                                title="Mark as read"
                                onClick={async () => {
                                  try {
                                    await axios.patch(
                                      `http://localhost:3000/noti/notifications/${n.id}/read`,
                                      { role }
                                    );
                                    setNotifications((prev) =>
                                      prev.map((notif) =>
                                        notif.id === n.id
                                          ? { ...notif, read_notification: 1 }
                                          : notif
                                      )
                                    );
                                  } catch (err) {
                                    alert("Failed to mark as read");
                                  }
                                }}>
                                <span className="material-symbols-outlined">
                                  check_circle
                                </span>
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </li>
              </>
            )}
            {token && (
              <li>
                <button
                  className={`${PageHeaderCSS.link} ${PageHeaderCSS.logout}`}
                  onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
};

export default PageHeader;
