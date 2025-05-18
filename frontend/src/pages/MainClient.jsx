import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import { jwtDecode } from "jwt-decode";
import PageHeader from "../components/PageHeader";
import styles from "./styling/MainClient.module.css";

const MainClient = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch all services on mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Failed to fetch services:", err));
  }, []);

  // 2. Fetch workers for selected service
  useEffect(() => {
    if (selectedService) {
      setWorkers([]);
      setSelectedWorker("");
      setSelectedDate("");
      setAvailableHours([]);
      setSelectedHour("");
      setLoading(true);
      axios
        .get(`http://localhost:3000/book/workers?service_id=${selectedService}`)
        .then((res) => setWorkers(res.data))
        .catch((err) => console.error("Failed to fetch workers:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedService]);

  // 3. Fetch available hours for worker/date
  useEffect(() => {
    if (selectedWorker && selectedDate) {
      setAvailableHours([]);
      setSelectedHour("");
      setLoading(true);
      axios
        .get(
          `http://localhost:3000/book/available_hours?worker_id=${selectedWorker}&date=${selectedDate}`
        )
        .then((res) => setAvailableHours(res.data))
        .catch((err) => console.error("Failed to fetch hours:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedWorker, selectedDate]);

  const handleBook = async () => {
    try {
      // Get token from localStorage and decode it
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const client_id = decoded.id;

      const bookingData = {
        client_id,
        worker_id: selectedWorker,
        date: selectedDate,
        hour: selectedHour,
      };

      const response = await axios.post(
        "http://localhost:3000/book/booking",
        bookingData
      );

      if (response.status === 201) {
        alert(
          `Booked service!\nService: ${
            services.find((s) => s.id == selectedService)?.service_name
          }\nWorker: ${
            workers.find((w) => w.id == selectedWorker)?.name
          }\nDate: ${selectedDate}\nHour: ${selectedHour}`
        );
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <PageHeader />
      <div className={styles.container}>
        <h1>Book a Service</h1>
        {/* 1. Service Dropdown */}
        <div className={styles.formGroup}>
          <label>Select Service</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}>
            <option value="">-- Select a service --</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.service_name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Worker Dropdown */}
        {selectedService && (
          <div className={styles.formGroup}>
            <label>Select Worker</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              disabled={loading || workers.length === 0}>
              <option value="">-- Select a worker --</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Date Picker */}
        {selectedWorker && (
          <div className={styles.formGroup}>
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {/* 4. Available Hours */}
        {selectedWorker && selectedDate && (
          <div className={styles.formGroup}>
            <label>Available Hours</label>
            <div className={styles.hoursList}>
              {loading && <span>Loading...</span>}
              {!loading && availableHours.length === 0 && (
                <span>No available hours.</span>
              )}
              {!loading &&
                availableHours.map((hour) => (
                  <button
                    key={hour}
                    className={
                      selectedHour === hour
                        ? styles.hourButtonSelected
                        : styles.hourButton
                    }
                    onClick={() => setSelectedHour(hour)}>
                    {hour}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* 5. Book Button */}
        {selectedHour && (
          <button className={styles.bookButton} onClick={handleBook}>
            Book service
          </button>
        )}
      </div>
    </>
  );
};

export default MainClient;
