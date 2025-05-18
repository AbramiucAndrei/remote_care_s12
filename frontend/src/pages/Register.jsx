import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import RegisterCSS from "./styling/Register.module.css";
import axios from "axios";

const Register = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [selectedService, setSelectedService] = useState("");
  const [role, setRole] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState(""); // Error state
  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/services")
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => console.error("Failed to fetch services: ", err));
  }, []);

  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSumbit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    try {
      const toSend = {
        ...values,
        role,
        ...(role === "worker" && { service: selectedService }),
      };

      console.log(toSend);

      const response = await axios.post(
        "http://localhost:3000/auth/register",
        toSend
      );
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.log(err.message);
    }
  };

  return (
    <>
      <PageHeader />
      <div className={RegisterCSS.register_container}>
        <h1>Register</h1>
        <form onSubmit={handleSumbit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={handleChanges}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChanges}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChanges}
              required
            />
          </div>
          <label>Register as:</label>
          <div className={RegisterCSS.radio_container}>
            <label className={RegisterCSS.radio_label}>
              <input
                type="radio"
                id="client"
                name="role"
                value="client"
                className={RegisterCSS.radio_input}
                checked={role === "client"}
                onChange={() => setRole("client")}
                required
              />
              <span className={RegisterCSS.custom_radio}>
                {/* Example icon: 👤 */}
                <span className={RegisterCSS.radio_icon}>👤</span>
                <span className={RegisterCSS.radio_text}>Client</span>
              </span>
            </label>
            <label className={RegisterCSS.radio_label}>
              <input
                type="radio"
                id="worker"
                name="role"
                value="worker"
                className={RegisterCSS.radio_input}
                checked={role === "worker"}
                onChange={() => setRole("worker")}
              />
              <span className={RegisterCSS.custom_radio}>
                {/* Example icon: 🛠️ */}
                <span className={RegisterCSS.radio_icon}>🛠️</span>
                <span className={RegisterCSS.radio_text}>Worker</span>
              </span>
            </label>
          </div>
          {role === "worker" && (
            <div className={RegisterCSS.dropdown_container}>
              <label htmlFor="service">Select Service</label>
              <select
                id="service"
                name="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required>
                <option value="">-- Select a service --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button>Register</button>
        </form>
        {error && <p className={RegisterCSS.error_message}>{error}</p>}{" "}
        {/* Error message display */}
        <p>
          Already have an account? <Link to="/login">Login here</Link>.
        </p>
      </div>
    </>
  );
};

export default Register;
