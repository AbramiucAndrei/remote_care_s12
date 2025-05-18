import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import BookingCard from "../components/BookingCard.jsx";
import styles from "./styling/WorkerManageBookingsPage.module.css";
import { jwtDecode } from "jwt-decode";
import axios from "../axios.js";

function WorkerManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookings for this worker
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const worker_id = decoded.id;

    setLoading(true);
    axios
      .get(`http://localhost:3000/book/worker_bookings?worker_id=${worker_id}`)
      .then((res) => setBookings(res.data))
      .catch((err) =>
        console.error(
          `Failed to fetch bookings for worker with id ${worker_id}:`,
          err
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // Change booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:3000/book/booking/${bookingId}`, {
        status: newStatus,
      });
      // Re-fetch all bookings to get the updated statuses
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const worker_id = decoded.id;
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/book/worker_bookings?worker_id=${worker_id}`
      );
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      alert("Failed to update booking status.");
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader />
      <div className={styles.bookings_container}>
        {loading && <p>Loading...</p>}
        {!loading && bookings.length === 0 && <p>No bookings found.</p>}
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            {...booking}
            role="worker"
            onConfirm={() => handleStatusChange(booking.id, "CONFIRMED")}
            onReject={() => handleStatusChange(booking.id, "REJECTED")}
          />
        ))}
      </div>
    </>
  );
}

export default WorkerManageBookingsPage;
