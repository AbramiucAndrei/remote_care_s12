import express from "express";
import { connectToDatabase } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/services", async (req, res) => {
  try {
    console.log("[GET] /auth/services - Fetching services...");
    const connection = await connectToDatabase();
    const [rows] = await connection.query(
      "SELECT id,service_name FROM services"
    );

    if (rows.length === 0) {
      console.log("[GET] /auth/services - No services found.");
      return res.status(404).json({ message: "No services found" });
    }

    console.log(`[GET] /auth/services - Found ${rows.length} services.`);
    return res.status(200).json(rows); // Changed to 200
  } catch (err) {
    console.error("[GET] /auth/services - Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log("[POST] /auth/register - Incoming data:", req.body);
    const connection = await connectToDatabase();

    //-------------REGISTER CLIENT-------------------
    if (req.body.role === "client") {
      console.log("Registering client:", req.body.email);
      const [clients] = await connection.query(
        "SELECT * FROM clients WHERE email = ?",
        [req.body.email]
      );

      if (clients.length > 0) {
        console.log("Client already exists:", req.body.email);
        return res.status(409).json({
          message: `Client with email ${req.body.email} already exists`,
        });
      }

      const hashPassword = await bcrypt.hash(req.body.password, 10);
      await connection.query(
        "INSERT INTO clients (name,email,password) VALUES (?, ?, ?)",
        [req.body.name, req.body.email, hashPassword]
      );

      console.log("Client registered:", req.body.email);
      return res.status(201).json({
        message: `Client with email ${req.body.email} has successfully registered.`,
      });
      //--------------------REGISTER WORKER----------------------------
    } else if (req.body.role === "worker") {
      console.log(
        "Registering worker:",
        req.body.email,
        "Service:",
        req.body.service
      );
      const [workers] = await connection.query(
        "SELECT * FROM workers WHERE email = ?",
        [req.body.email]
      );

      if (workers.length > 0) {
        console.log("Worker already exists:", req.body.email);
        return res.status(409).json({
          message: `Worker with email ${req.body.email} already exists`,
        });
      }

      const hashPassword = await bcrypt.hash(req.body.password, 10);
      await connection.query(
        "INSERT INTO workers (name,email,password,service_id) VALUES (?, ?, ?, ?)",
        [req.body.name, req.body.email, hashPassword, req.body.service]
      );

      console.log(
        "Worker registered:",
        req.body.email,
        "Service:",
        req.body.service
      );
      return res.status(201).json({
        message: `Worker with email ${req.body.email} has successfully registered.`,
      });
      //------------------------WRONG ROLE FOR REGISTER-----------------------------
    } else {
      console.log("Invalid role received:", req.body.role);
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    console.error("[POST] /auth/register - Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(
      `[POST] /auth/login - Attempt login for email: ${email}, role: ${role}`
    );

    const connection = await connectToDatabase();

    if (role === "client") {
      console.log(`[POST] /auth/login - Looking up client: ${email}`);
      const [clients] = await connection.query(
        "SELECT * FROM clients WHERE email = ?",
        [email]
      );
      if (clients.length === 0) {
        console.log(
          `[POST] /auth/login - No client found with email: ${email}`
        );
        return res
          .status(401)
          .json({ message: "No client with this email found." });
      }
      const client = clients[0];
      console.log(
        `[POST] /auth/login - Client found: ${email}, verifying password...`
      );
      const valid = await bcrypt.compare(password, client.password);
      if (!valid) {
        console.log(
          `[POST] /auth/login - Invalid password for client: ${email}`
        );
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Generate JWT
      const token = jwt.sign(
        { id: client.id, email: client.email, role: "client" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_TTL }
      );
      console.log(`[POST] /auth/login - Client login successful: ${email}`);
      return res.status(200).json({ token });
    } else if (role === "worker") {
      console.log(`[POST] /auth/login - Looking up worker: ${email}`);
      const [workers] = await connection.query(
        "SELECT * FROM workers WHERE email = ?",
        [email]
      );
      if (workers.length === 0) {
        console.log(
          `[POST] /auth/login - No worker found with email: ${email}`
        );
        return res
          .status(401)
          .json({ message: "No worker with the given email found." });
      }
      const worker = workers[0];
      console.log(
        `[POST] /auth/login - Worker found: ${email}, verifying password...`
      );
      const valid = await bcrypt.compare(password, worker.password);
      if (!valid) {
        console.log(
          `[POST] /auth/login - Invalid password for worker: ${email}`
        );
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Generate JWT
      const token = jwt.sign(
        { id: worker.id, email: worker.email, role: "worker" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_TTL }
      );
      console.log(`[POST] /auth/login - Worker login successful: ${email}`);
      return res.status(200).json({ token, role: "worker" });
    } else {
      console.log(`[POST] /auth/login - Invalid role received: ${role}`);
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    console.error("[POST] /auth/login - Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
