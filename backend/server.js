import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiAuth.js";
import apiBookings from "./routes/apiBookings.js";
import apiNotifications from "./routes/apiNotifications.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", apiRouter);
app.use("/book", apiBookings);
app.use("/noti", apiNotifications);

app.listen(process.env.PORT, () => {
  console.log("Listening to port ", process.env.PORT);
});
