import jwt from "jsonwebtoken";

export const shouldBeLoggedIn = async (req, res) => {
  console.log(req.userID)
  console.log("masha allah")
  res.status(200).json({ message: "You are Authenticated" });
};

export const shouldBeAdmin = async (req, res) => {
  const token = req.cookies.token;
console.log(token)
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });
  jwt.verify(token, process.env.Secret_Key, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Not authorized!" }) ;
      
    }
   });

  res.status(200).json({ message: "You are Authenticated" } );
  
};
