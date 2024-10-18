import express from "express";
import cors from "cors";
import  verifyMonnifySignature from "./verifySignature.js";
import mysql2 from"mysql2"
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";


const app = express();
import dotenv from "dotenv"

dotenv.config();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
const db=mysql2.createConnection({
  host: process.env.Database_host,
  user:  process.env.Database_user,
  password:  process.env.Database_password,
  database:  process.env.Database
}) 

db.query(`select * from customer`,(err,result)=>{

  if(err){console.log(err)}
app.post('/api/fund/webhook', (req, res) => {
  const transactionInfo = req.body;
  
  if (!verifyMonnifySignature(req)) {
    return res.status(400).send('Invalid signature');
  }

  const { paymentReference, amountPaid, customer: { email }, paymentStatus } = transactionInfo;

  if (paymentStatus === 'PAID') {
    const user = result.find((user) => user.email === email);

    if (user) {
  
      user.balance += parseFloat(amountPaid);

      console.log(`Payment successful! User ${user.username}'s new balance: ${user.balance}`);
      

      res.status(200).send('Webhook received and processed successfully');
    } else {
      console.error('User not found');
      res.status(404).send('User not found');
    }
  } else {
    console.error('Payment failed or not completed');
    res.status(400).send('Payment not successful');
  }
});
})
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

app.use("/api/test", testRoute);


app.listen(8800, () => {
  console.log("Server is running atport 8800!");
});
