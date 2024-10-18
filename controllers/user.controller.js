import mysql2 from"mysql2"
import dotenv from "dotenv"

dotenv.config();
const db=mysql2.createConnection({
  connectionLimit:process.env.f, 
  host:process.env.Database_Host,
  user:process.env.Database_User,
  password:process.env.Database_Password ,
  database:process.env.Database , 

})
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    // const users = await prisma.user.findMany();
    // res.status(200).json(users); 
    db.query('select *  from user ',(err,result)=>{
      if(err){console.log(err)}
          res.status(200).json(result); 
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    // const user = await prisma.user.findUnique({
    //   where: { id },
    // });
    db.query('select * from user where id=?'[id],(err,result)=>{
      if(err){ console.log(err)}
      res.status(200).json(result);
    })
  
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;

  const tokenUserId = req.id;
 
  let { password, username,avatar,email} = req.body;
     
  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
    
  }



  let updatedPassword = null;

    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
 db.query(`update customer set email = "${email}" , username="${username}" where CustomerId ="${id}" ` ,(err,result)=>{
      if(err){ console.log(err)}
   
    }) 
    
 
    
   if(password &&avatar ){
    db.query(`update Customer set email = "${email}" ,username="${username}" ,password ="${updatedPassword}" , avatar="${avatar}" where Customerid="${id}"`,(err,result)=>{
      if(err){ console.log(err)}
    
    })
   } else if(!password && !avatar ){
    db.query(`update Customer set email = "${email}" , username="${username}" where CustomerId ="${id}" ` ,(err,result)=>{
      if(err){ console.log(err)}

      
  
    }) 
    

   }

   else if(!password &&avatar){
    db.query(`update Customer set email = "${email}" ,username="${username}" , avatar="${avatar}" where CustomerId ="${id}"`,(err,result)=>{
      if(err){ console.log(err)}
    })
   }
   else {
    db.query(`update Customer set email = "${email}" ,username="${username}" ,password ="${updatedPassword}" where CustomerId="${id}" `,(err,result)=>{
      if(err){ console.log(err)}
    })
   }
 

    
   db.query(`select * from Customer where CustomerId ="${id}"`,(err,result)=>{
    if(err){console.log(err)}
         const [v]=result
         const {password,...rest}=v
         res.status(200).json(rest)
  }) 



 
  
  

 
 };

 
  
  

 
 


export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    db.query(`delete from user where id=${id}`,(err,result)=>{
      if(err){console.log(err)}
    })

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

// export const savePost = async (req, res) => {
//   const postId = req.body.postId;
//   const tokenUserId = req.userId;

//   try {
//     const savedPost = await prisma.savedPost.findUnique({
//       where: {
//         userId_postId: {
//           userId: tokenUserId,
//           postId,
//         },
//       },
//     });

//     if (savedPost) {
//       await prisma.savedPost.delete({
//         where: {
//           id: savedPost.id,
//         },
//       });
//       res.status(200).json({ message: "Post removed from saved list" });
//     } else {
//       await prisma.savedPost.create({
//         data: {
//           userId: tokenUserId,
//           postId,
//         },
//       });
//       res.status(200).json({ message: "Post saved" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to delete users!" });
//   }
// };

// export const profilePosts = async (req, res) => {
//   const tokenUserId = req.userId;
//   try {
//     const userPosts = await prisma.post.findMany({
//       where: { userId: tokenUserId },
//     });
//     const saved = await prisma.savedPost.findMany({
//       where: { userId: tokenUserId },
//       include: {
//         post: true,
//       },
//     });

//     const savedPosts = saved.map((item) => item.post);
//     res.status(200).json({ userPosts, savedPosts });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to get profile posts!" });
//   }
// };

// export const getNotificationNumber = async (req, res) => {
//   const tokenUserId = req.userId;
//   try {
//     const number = await prisma.chat.count({
//       where: {
//         userIDs: {
//           hasSome: [tokenUserId],
//         },
//         NOT: {
//           seenBy: {
//             hasSome: [tokenUserId],
//           },
//         },
//       },
//     });
//     res.status(200).json(number);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to get profile posts!" });
//   }
// };
