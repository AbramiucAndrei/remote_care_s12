import express from "express";
import { connectToDatabase } from "../lib/db.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../apiUtils/middleWare.js";
const api = express.Router();

api.get("/notifications", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.query;
    console.log(
      `[GET] /notifications - Incoming request for role: ${role}, user_id: ${user_id}`
    );

    if (!role || !user_id) {
      console.log("[GET] /notifications - Missing role or user_id in request");
      return res.status(400).json({ message: "Missing role or user_id" });
    }

    const connection = await connectToDatabase();
    let notifications = [];

    if (role === "client") {
      [notifications] = await connection.query(
        "SELECT id, message, read_notification, created_at FROM clients_notifications WHERE client_id = ? ORDER BY created_at DESC",
        [user_id]
      );
      console.log(
        `[GET] /notifications - Found ${notifications.length} notifications for client_id: ${user_id}`
      );
    } else if (role === "worker") {
      [notifications] = await connection.query(
        "SELECT id, message, read_notification, created_at FROM workers_notifications WHERE worker_id = ? ORDER BY created_at DESC",
        [user_id]
      );
      console.log(
        `[GET] /notifications - Found ${notifications.length} notifications for worker_id: ${user_id}`
      );
    } else {
      console.log(`[GET] /notifications - Invalid role: ${role}`);
      return res.status(400).json({ message: "Invalid role" });
    }

    return res.status(200).json(notifications);
  } catch (err) {
    console.error("[GET] /notifications - Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.patch("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !id) {
      return res
        .status(400)
        .json({ message: "Missing role or notification id" });
    }

    const connection = await connectToDatabase();
    let table;
    if (role === "client") {
      table = "clients_notifications";
    } else if (role === "worker") {
      table = "workers_notifications";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [result] = await connection.query(
      `UPDATE ${table} SET read_notification = 1 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[PATCH] /notifications/:id/read - Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default api;
