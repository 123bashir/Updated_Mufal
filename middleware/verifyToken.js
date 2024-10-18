import jwt from "jsonwebtoken";
import mysql2 from"mysql2"
import dotenv from "dotenv"

const db=mysql2.createConnection({
  connectionLimit:process.env.f, 
  host:process.env.Database_Host,
  user:process.env.Database_User,
  password:process.env.Database_Password ,
  database:process.env.Database , 

})
dotenv.config();
export const verifyToken = (req, res, next) => { 
  const token = req.cookies.token;
  const username = req.body.username;


  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.Secret_Key, async (err, payload) => {
    if (err) {

      return res.status(403).json({ message: "Token is not Valid!" });
    }


    req.id = payload.id;


    db.query(`SELECT username FROM customer WHERE username="${username}"`, (err, result) => {
      if (err) {

        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }
      
      if (result.length > 1) {
   
        return res.status(409).json({ message: "This Username Already Exists" });
      }

      next();
    });
  });
};
