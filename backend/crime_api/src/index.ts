import "dotenv/config";
import express from "express";
import cors from "cors";
import crimeRouter from "./routes/crime";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.use("/api/crime", crimeRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`Crime API listening on port ${port}`);
  console.log(`Example: http://localhost:${port}/api/crime/trend?zip=02134`);
});
