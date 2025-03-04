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

import bcrypt from "bcrypt";
export const update = async (req, res) => {
  const { password, Opassword, Cpassword } = req.body;
  const id = req.params.id;

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not Authenticated!" });
  }

  try {
    // Verify token
    const payload = jwt.verify(token, process.env.Secret_Key);
    const tokenId = payload.id;
  console.log(id,tokenId)
    if (id !== tokenId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    db.query(
      `SELECT password FROM customer WHERE customerid = ?`,
      [id],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server Error" });
        }

        
        // Check if user exists and the old password matches
        if (!result.length || !(await bcrypt.compare(Opassword, result[0].password))) {
          return res.status(400).json({ message: "Put New Password Or Incorrect Old Password" });
        }  

        // Check if new password and confirm password match
        if (password !== Cpassword || !password) { 
          return res.status(400).json({ message: "Passwords Do Not Match" });
        }

        // Hash the new password
        const updatedPassword = await bcrypt.hash(password, 10);

        // Update the password in the database
        db.query(
          `UPDATE customer SET password = ? WHERE customerid = ?`,
          [updatedPassword, id],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Error Updating Password" });
            }
            db.query(`select * from customer where CustomerId="${id}"`,(err,result)=>{
              if(err){console.log(err)}  
              const { password: userPassword, ...userInfo } = result[0];

              return res.status(200).json(userInfo); 

            }) 
          } 
        );
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Token is not Valid!" });
  }
};




export const verifyToken = (req, res, next) => { 

  const token = req.cookies.token; 
  const username = req.body.username;


  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.Secret_Key, async (err, payload) => {
    if (err) {

      return res.status(403).json({ message: "Token is not Valid!" });
    }

    req.id = payload.id;

    next();
  
  });
};
