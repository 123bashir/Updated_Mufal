import mysql2 from"mysql2"
import dotenv from "dotenv"
import bcrypt from "bcrypt";

dotenv.config();
const db=mysql2.createConnection({
  
  connectionLimit:process.env.f, 
  host:process.env.Database_Host,
  user:process.env.Database_User,
  password:process.env.Database_Password ,
  database:process.env.Database , 

})
 
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.id;
  let { password, pwd, username, avatar, email } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  if (!pwd) {
    return res.status(400).json({ message: "You Must Enter Login Detail" });
  }

  try {
    // Check if the provided password matches the user's stored password
    const [passwordResult] = await db.promise().query('SELECT password FROM customer WHERE CustomerId = ?', [id]);
    if (!passwordResult.length || !(await bcrypt.compare(pwd, passwordResult[0].password))) {
      return res.status(401).json({ message: "Incorrect Login Detail" });
    }

    // Check if the username is already taken (excluding the current user)
    const [usernameResult] = await db.promise().query('SELECT username FROM customer WHERE username = ? AND CustomerId != ?', [username, id]);
    if (usernameResult.length > 0) {
      return res.status(409).json({ message: "This Username Already Exists" });
    }

    // Prepare the updated data
    const updates = {
      email,
      username,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      avatar,
    };

    // Update the customer record
    const updateQuery = `
      UPDATE customer
      SET
        email = ?,
        username = ? 
        ${updates.password ? 'password = ?,' : ''}   
        ${updates.avatar ? 'avatar = ?' : ''}  
        
      WHERE CustomerId = ?`;
    const queryParams = [email, username];
    if (updates.password) queryParams.push(updates.password);
    if (updates.avatar) queryParams.push(avatar);
    queryParams.push(id);

    await db.promise().query(updateQuery, queryParams);

    // Retrieve and return the updated user data
    const [updatedUser] = await db.promise().query('SELECT * FROM customer WHERE CustomerId = ?', [id]);
    if (!updatedUser.length) {
      return res.status(404).json({ message: "User not found after update" });
    }

    // Exclude the password from the response
    const { password: _, ...userData } = updatedUser[0];
    return res.status(200).json(userData);

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "An internal error occurred" });
  }
};
