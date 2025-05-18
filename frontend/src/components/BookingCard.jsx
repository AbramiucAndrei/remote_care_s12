import React from "react";
import styles from "./styling/BookingCard.module.css";

function BookingCard({
  worker_name,
  client_name,
  date,
  time,
  service_name,
  status,
  role, // "client" or "worker"
  onCancel,
  onConfirm,
  onReject,
}) {
  return (
    <div className={styles.bookingCard}>
      {worker_name && (
        <>
          <h3 className={styles.service}>{service_name}</h3>
          <p>
            <strong>Worker:</strong> {worker_name}
          </p>
        </>
      )}
      {client_name && (
        <>
          <p>
            <strong>Client:</strong> {client_name}
          </p>
        </>
      )}
      <p>
        <strong>Date:</strong> {date}
      </p>
      <p>
        <strong>Hour:</strong> {time}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        <span
          className={
            status === "CONFIRMED"
              ? styles.confirmed
              : status === "PENDING"
              ? styles.pending
              : styles.rejected
          }>
          {status}
        </span>
      </p>
      <div className={styles.actions}>
        {role === "client" && status == "PENDING" && (
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancel Booking
          </button>
        )}
        {role === "worker" && status === "PENDING" && (
          <>
            <button onClick={onConfirm} className={styles.confirmBtn}>
              Confirm
            </button>
            <button onClick={onReject} className={styles.rejectBtn}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingCard;
