import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import LoginCSS from "./styling/Login.module.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const toSend = {
        ...values,
        role,
      };

      const response = await axios.post(
        "http://localhost:3000/auth/login",
        toSend
      );
      if (response.status === 200) {
        // Save JWT and role to localStorage
        localStorage.setItem("token", response.data.token);
        let role = null;

        try {
          const decoded = jwtDecode(response.data.token);
          role = decoded.role; // or whatever key you used when creating the token
        } catch (e) {
          // Invalid token, treat as not logged in
          role = null;
        }

        //localStorage.setItem("role", response.data.role);

        // Redirect based on role
        if (role === "client") {
          navigate("/main_client");
        } else if (role === "worker") {
          navigate("/main_worker");
        }
      }
    } catch (err) {
      setError(err.response.data.message);
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <>
      <PageHeader />
      <div className={LoginCSS.login_container}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              required
            />
          </div>
          <label>Login as:</label>
          <div className={LoginCSS.radio_container}>
            <label className={LoginCSS.radio_label}>
              <input
                type="radio"
                id="client"
                name="role"
                value="client"
                className={LoginCSS.radio_input}
                checked={role === "client"}
                onChange={() => setRole("client")}
                required
              />
              <span className={LoginCSS.custom_radio}>
                {/* Example icon: 👤 */}
                <span className={LoginCSS.radio_icon}>👤</span>
                <span className={LoginCSS.radio_text}>Client</span>
              </span>
            </label>
            <label className={LoginCSS.radio_label}>
              <input
                type="radio"
                id="worker"
                name="role"
                value="worker"
                className={LoginCSS.radio_input}
                checked={role === "worker"}
                onChange={() => setRole("worker")}
              />
              <span className={LoginCSS.custom_radio}>
                {/* Example icon: 🛠️ */}
                <span className={LoginCSS.radio_icon}>🛠️</span>
                <span className={LoginCSS.radio_text}>Worker</span>
              </span>
            </label>
          </div>
          <button>Login</button>
        </form>
        {error && <p className={LoginCSS.error_message}>{error}</p>}
        <p>
          Don't have an account yet? <Link to={"/register"}>Register now</Link>.
        </p>
      </div>
    </>
  );
};

export default Login;
