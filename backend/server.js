import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiAuth.js";
import apiBookings from "./routes/apiBookings.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", apiRouter);
app.use("/book", apiBookings);

app.listen(process.env.PORT, () => {
  console.log("Listening to port ", process.env.PORT);
});
