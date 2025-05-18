import React, { useState } from "react";
import PageHeaderCSS from "./styling/PageHeader.module.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../images/logo1.png";
import { jwtDecode } from "jwt-decode";

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

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/notifications?role=${role}&user_id=${userId}`
      );
      setNotifications(res.data);
      setShowNotifications((prev) => !prev);
    } catch (err) {
      alert("Failed to fetch notifications.");
    }
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
                    className={PageHeaderCSS.icon_button}
                    onClick={fetchNotifications}>
                    <span className="material-icons">notifications</span>
                    <span className={PageHeaderCSS.icon_button__badge}>
                      {notifications.filter((n) => !n.read).length}
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
                              n.read
                                ? PageHeaderCSS.notification
                                : `${PageHeaderCSS.notification} ${PageHeaderCSS.unread}`
                            }>
                            {n.message}
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
                    className={PageHeaderCSS.icon_button}
                    onClick={fetchNotifications}>
                    <span className="material-icons">notifications</span>
                    <span className={PageHeaderCSS.icon_button__badge}>
                      {notifications.filter((n) => !n.read).length}
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
                              n.read
                                ? PageHeaderCSS.notification
                                : `${PageHeaderCSS.notification} ${PageHeaderCSS.unread}`
                            }>
                            {n.message}
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
