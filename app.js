import express from "express";
import cors from "cors";

import mysql2 from"mysql2"
import cookieParser from "cookie-parser"; 
import authRoute from "./routes/auth.route.js";
import axios from"axios"
import testRoute from "./routes/test.route.js";  
import userRoute from "./routes/user.route.js";
 
  
const app = express();
import dotenv from "dotenv" 

dotenv.config();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser()); 
const db=mysql2.createConnection({
	host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  database:  process.env.DB_NAME,
  port:"3306"
});

const apiKey = "MK_TEST_SVEY66TFTA"; 
const secretKey = "8598S8WFM033Y54S4PPR4T715ZXNE9VN"; 
const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

app.post('/api/initiate-payment', async (req, res) => {
  const paymentData = req.body;
  try {
    const response = await axios.post(
      'https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction',
      paymentData,
      {
        headers: {
          Authorization: `Basic ${authToken}`, 
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
});

// // Function to verify Monnify signature
// function verifyMonnifySignature(req) {
//   const monnifySignature = req.headers['monnify-signature'];
//   const calculatedSignature = crypto.createHmac('sha512', process.env.Secret_Key)
//     .update(JSON.stringify(req.body))
//     .digest('hex');

//   return monnifySignature === calculatedSignature; 
// }

app.post('/api/fund/webhook', (req, res) => {
  const transactionInfo = req.body;

  // const { paymentReference, amountPaid, customer: { email }, paymentStatus } = transactionInfo;
   const amountPaid=transactionInfo.responseBody.amountPaid  
  const email=transactionInfo.responseBody.customer.email 
    const paymentStatus=transactionInfo.responseBody.paymentStatus  
 
  if (paymentStatus === 'PAID') {

    db.query(`SELECT * FROM customer WHERE email = ?`, [email], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error'); 
      }

 
      if (result.length > 0) {
        const user = result[0];

        const newBalance = parseFloat(user.Price) + parseFloat(amountPaid); 
        db.query(`UPDATE customer SET Price = ? WHERE email = ?`, [newBalance, email], (err) => {
          if (err) {
            console.error('Error updating balance:', err);
            return res.status(500).send('Failed to update balance');
          }

          return res.status(200).json(newBalance);
        });
      } else {
        console.error('User not found'); 
        return res.status(404).send('User not found');
      }
    });
  } else { 
    console.error('Payment failed or not completed');
    return res.status(400).send('Payment not successful');
  }  
});      

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);    

app.use("/api/test", testRoute); 


app.listen(4000, () => {
  console.log("Server is running atport 4000!");
});
