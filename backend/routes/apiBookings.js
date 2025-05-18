import express from "express";
import { connectToDatabase } from "../lib/db.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../apiUtils/middleWare.js";
const api = express.Router();

api.get("/workers", async (req, res) => {
  try {
    console.log(req.query);
    const { service_id } = req.query;
    if (!service_id) {
      return res.status(400).json({ message: "Missing service_id parameter" });
    }
    const connection = await connectToDatabase();
    const [workers] = await connection.query(
      "SELECT id, name FROM workers WHERE service_id = ?",
      [service_id]
    );
    console.log(
      `[GET] /book/workers - Found ${workers.length} workers for service_id ${service_id}`
    );
    return res.status(200).json(workers);
  } catch (err) {
    console.error("[GET] /book/workers - Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

api.get("/available_hours", async (req, res) => {
  try {
    const { worker_id, date } = req.query;

    if (!worker_id) {
      return res.status(400).json({ message: "Missing Worker ID" });
    }
    if (!date) {
      return res.status(400).json({ message: "Missing booking date" });
    }

    const connection = await connectToDatabase();

    const [alreadyBooked] = await connection.query(
      "SELECT time FROM bookings WHERE worker_id = ? AND date = ? AND status = 'CONFIRMED'",
      [worker_id, date]
    );

    const alreadyBookedHours = alreadyBooked.map((booking) => {
      const time_sections = booking.time.split(":");
      return `${time_sections[0]}:${time_sections[1]}`;
    });

    const allDayHours = Array.from(
      { length: 9 },
      (_, i) => `${i + 8 < 10 ? `0${i + 8}` : `${i + 8}`}:00`
    ); //[8..16]

    const available_hours = allDayHours.filter(
      (hour) => !alreadyBookedHours.includes(hour)
    );
    console.log(available_hours);
    console.log(
      `[GET] /book/available_hours - Worker: ${worker_id}, Date: ${date}, Available: ${available_hours.join(
        ", "
      )}`
    );
    return res.status(200).json(available_hours);
  } catch (err) {
    console.error("[GET] /book/available_hours - Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

api.post("/booking", verifyToken, async (req, res) => {
  const { client_id, worker_id, date, hour } = req.body;
  console.log(req.body);
  try {
    if (!worker_id) {
      return res.status(400).json({ message: "Missing Worker ID" });
    }
    if (!date) {
      return res.status(400).json({ message: "Missing booking date" });
    }
    if (!client_id) {
      return res.status(400).json({ message: "Missing client ID" });
    }
    if (!hour) {
      return res.status(400).json({ message: "Missing booking hour" });
    }

    const connection = await connectToDatabase();
    console.log(date);

    const [result] = await connection.query(
      "INSERT INTO bookings (worker_id, client_id, date, time, status) VALUES (?, ?, ?, ?, ?)",
      [worker_id, client_id, date, hour, "PENDING"]
    );

    await connection.query(
      "INSERT INTO workers_notifications (worker_id, message, read_notification, created_at) VALUES (?, ?, 0, NOW())",
      [worker_id, `New booking request for ${date} at ${hour}.`]
    );

    console.log(
      "[POST] /book/booking - Generated booking id:",
      result.insertId
    );
    // result.insertId contains the generated booking id
    return res.status(201).json({
      message: "Booking successful!",
      booking_id: result.insertId,
    });

    //insert into bookings(worker_id,service_id,date,time,status) values(?,?,?,?,?);
  } catch (err) {
    console.error("[POST] /book/booking - Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

api.get("/client_bookings", verifyToken, async (req, res) => {
  try {
    const { client_id } = req.query;

    console.log(
      `[GET] /book/booking - Incoming request for client_id: ${client_id}`
    );

    if (!client_id) {
      console.log("[GET] /book/booking - No client id found in request");
      return res.status(400).json({ message: "No client id found in request" });
    }

    const connection = await connectToDatabase();
    console.log("[GET] /book/booking - Connected to database");

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        w.name AS worker_name,
        DATE_FORMAT(b.date, '%Y-%m-%d') AS date,
        DATE_FORMAT(b.time, '%H:%i') AS time,
        b.status,
        s.service_name
      FROM bookings b
      INNER JOIN workers w ON b.worker_id = w.id
      INNER JOIN services s ON s.id = w.service_id
      WHERE b.client_id = ?;`,
      [client_id]
    );

    console.log(
      `[GET] /book/booking - Found ${bookings.length} bookings for client_id: ${client_id}`
    );

    // Format date and time for each booking
    const formattedBookings = bookings.map((b) => ({
      ...b,
      date: b.date,
      time: b.time ? b.time.slice(0, 5) : "",
    }));

    return res.status(200).json(formattedBookings);
  } catch (err) {
    console.error("[GET] /book/booking - Error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.get("/worker_bookings", verifyToken, async (req, res) => {
  try {
    const { worker_id } = req.query;

    console.log(
      `[GET] /book/worker_bookings - Incoming request for worker_id: ${worker_id}`
    );

    if (!worker_id) {
      console.log(
        "[GET] /book/worker_bookings - No worker id found in request"
      );
      return res.status(400).json({ message: "No worker id found in request" });
    }

    const connection = await connectToDatabase();
    console.log("[GET] /book/worker_bookings - Connected to database");

    const [bookings] = await connection.query(
      `SELECT 
        b.id, 
        c.name AS client_name, 
        DATE_FORMAT(b.date, '%Y-%m-%d') AS date, 
        DATE_FORMAT(b.time, '%H:%i') AS time, 
        b.status, 
        s.service_name
       FROM bookings b
       INNER JOIN clients c ON b.client_id = c.id
       INNER JOIN services s ON s.id = (SELECT service_id FROM workers WHERE id = b.worker_id)
       WHERE b.worker_id = ?;`,
      [worker_id]
    );
    console.log(bookings);

    console.log(
      `[GET] /book/worker_bookings - Found ${bookings.length} bookings for worker_id: ${worker_id}`
    );

    // Format date and time for each booking
    const formattedBookings = bookings.map((b) => ({
      ...b,
      date: b.date,
      time: b.time ? b.time.slice(0, 5) : "",
    }));

    console.log(formattedBookings);

    return res.status(200).json(formattedBookings);
  } catch (err) {
    console.error("[GET] /book/worker_bookings - Error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.patch("/booking/:id", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Missing status in request body" });
    }

    const connection = await connectToDatabase();

    // Get the booking details (worker_id, date, time)
    const [rows] = await connection.query(
      "SELECT worker_id, client_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, time FROM bookings WHERE id = ?",
      [bookingId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const { worker_id, client_id, date, time } = rows[0];
    const formattedDate = date; // Already formatted

    // Update the status of the selected booking
    const [result] = await connection.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    // If status is CONFIRMED, reject all other bookings for the same worker, date, and time
    if (status === "CONFIRMED") {
      await connection.query(
        "UPDATE bookings SET status = 'REJECTED' WHERE worker_id = ? AND date = ? AND TIME(time) = TIME(?) AND id != ?",
        [worker_id, date, time, bookingId]
      );
    }
    let message = "";
    if (status === "CONFIRMED") {
      message = `Your booking for ${formattedDate} at ${time.slice(
        0,
        5
      )} was CONFIRMED.`;
    } else if (status === "REJECTED") {
      message = `Your booking for ${formattedDate} at ${time.slice(
        0,
        5
      )} was REJECTED.`;
    }
    if (message) {
      await connection.query(
        "INSERT INTO clients_notifications (client_id, message, read_notification, created_at) VALUES (?, ?, 0, NOW())",
        [client_id, message]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log(
      `[PATCH] /book/booking/${bookingId} - Status updated to ${status}`
    );
    return res.status(200).json({ message: "Booking status updated" });
  } catch (err) {
    console.error("[PATCH] /book/booking/:id - Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.delete("/client_bookings", verifyToken, async (req, res) => {
  try {
    const { booking_id } = req.query;
    if (!booking_id) {
      return res.status(400).json({ message: "Missing booking_id in request" });
    }

    const connection = await connectToDatabase();
    const [result] = await connection.query(
      "DELETE FROM bookings WHERE id = ?",
      [booking_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log(
      `[DELETE] /book/client_bookings - Deleted booking id: ${booking_id}`
    );
    return res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("[DELETE] /book/client_bookings - Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default api;
