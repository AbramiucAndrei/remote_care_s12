import React from "react";
import PageHeader from "../components/PageHeader.jsx";
import styles from "./styling/ClientBookingsPage.module.css";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard.jsx";
import axios from "../axios.js";
function ClientBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const handleCancel = async (booking_id) => {
    try {
      // Find the booking details before removing it
      const booking = bookings.find((b) => b.id === booking_id);

      await axios.delete(
        `http://localhost:3000/book/client_bookings?booking_id=${booking_id}`
      );
      setBookings((prev) => prev.filter((b) => b.id !== booking_id));

      if (booking) {
        alert(
          `Booking canceled successfully!\nService: ${booking.service_name}\nWorker: ${booking.worker_name}\nDate: ${booking.date}\nHour: ${booking.time}`
        );
      } else {
        alert("Booking canceled successfully!");
      }
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  useEffect(() => {
    // Get token from localStorage and decode it
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const client_id = decoded.id;

    axios
      .get(`http://localhost:3000/book/client_bookings?client_id=${client_id}`)
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) =>
        console.error(
          `Failed to fetch bookings for client with id ${client_id} :`,
          err
        )
      );
  }, []);
  return (
    <>
      <PageHeader />
      <div className={styles.bookings_container}>
        {bookings.map((booking, idx) => (
          <BookingCard
            key={idx}
            {...booking}
            role="client"
            onCancel={() => {
              {
                handleCancel(booking.id);
              }
            }}
          />
        ))}
      </div>
    </>
  );
}

export default ClientBookingsPage;
