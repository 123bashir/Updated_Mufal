import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql2 from "mysql2"
import nodemailer from"nodemailer"
import https from "https"
import postmark from"postmark" 
import dotenv from "dotenv"

dotenv.config();
const db=mysql2.createConnection({
  connectionLimit:process.env.f, 
  host:process.env.Database_Host,
  user:process.env.Database_User, 
  password:process.env.Database_Password ,
  database:process.env.Database , 

})


export const register=(req,res)=>{
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;

 

     
 
  db.query('select email from customer where email =?',[email],async(err,result)=>{
      if(err){
          console.log(err)
      }
      if(result.length > 0){
          return  res.status(500).json({message:"this user already exist"})
      }
        db.query(`select username from customer where username="${username}"`,(err,result)=>{
          if(err){console.log(err)} 
          if(result.length > 0){
              res.status(500).json({message:"username exist take another one"})

        }
     
      
        })
     
                   const hashedPassword= await bcrypt.hash(password,12)

console.log(username,email,password,hashedPassword)

            const random =  Math.floor(Math.random()*1213009478547770)
          
          db.query('insert into customer set  ?',{customerid:random, username:username,email:email,Password:hashedPassword},(err,result)=>{
            if (err){ console.log(err)}
            res.json()
          
        }  )
         

      
  })

}
 








 export const login=(req,res)=>{ 
  
  const username=req.body.username; 
  const password=req.body.password; 
  console.log(username,password) 
  if(!username||!password){
      return res.status(501).json({message:"please enter Username or password  "}) 
  }
  else{ 

      db.query('select * from customer where username=?',[username],async(err,result)=>{
          if(err){
              console.log(err)
          }
           if (!result.length||! await bcrypt.compare(password,result[0].password))

          {
              res.status(501).json({message:"Incorrect Username Or Password"})

          }
          else{   
               
              const token=jwt.sign({id:result[0].CustomerId,
                isAdmin:false
 
              },process.env.Secret_Key,{  
                  expiresIn: 1000*60*60*24*7
              })

              const cookieExpires={
                  expiresIn:24*60*60*1000*7
              } 
              result[0]
              const{password:userPassword,...userInfo}=result[0]
              res.cookie("token",token,cookieExpires,{
                httpOnly:true
              }) 

  
              console.log(userInfo)
                       if(userInfo.transactionPin=='000'){
                        console.log(userInfo)

                        return res.status(200).json({data:userInfo ,pinset:false,id:userInfo.CustomerId})

                       } 
                else   {
                  console.log(userInfo)

                      return res.status(200).json({data:userInfo ,pinset:true,id:userInfo.CustomerId})

                    }


           
          }
       })
  }
 
}


export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};

export const pin= async(req,res)=>{
 const pin=req.body.pin 
 const pin2=req.body.Confirmpin 

 console.log(pin,pin2) 
 const id=req.params.id 
if(pin!=pin2){ 
  res.status(501).json({message:"Pin Does'nt Match"})
}   
  else{ 
const hashedpin= await bcrypt.hash(pin,12)
db.query(`update customer set transactionpin="${hashedpin}" where Customerid="${id}"`,(err,result)=>{
  if(err){ console.log(err)} 
  db.query(`select * from customer where  customerid="${id}"`,(err,result)=>{
    if(err){console.log(err)} 
    const{password:userPassword,...userInfo}=result[0]
    return res.status(200).json(userInfo) 

  })
})}
}
export const PasswordForgot=(req,res)=>{
const Email=req.body.email  
db.query(`select email from customer where email="${Email}"`,(err,result)=>{
  if(err){ console.log(err)}

  if(!Email){
    return res.status(501).json({message:"Please Enter Your Email "})
}
     if(result[0]==undefined){
      res.status(401).json({message:"This Email Does Not registerer"})
     }
     else{  
      db.query(`select password,customerId from customer where email="${Email}"`,(err,result)=>{
        if(err){console.log(err)}
        const secret=process.env.Secret_Key+result[0].password

        const payload={
               email:Email,  
               id:result[0].customerId
              
        } 
        const token=jwt.sign(payload,secret,{expiresIn:'4m'})
        const link=`http://localhost:5173/ResetPassword/${result[0].customerId}/${token}`
        const transporter = nodemailer.createTransport({
          host: 'smtp.titan.email',
          port: 465,
          secure: true, 
          auth: {  
            user: 'nazifi@abdulfortech.com',
            pass: 'Nazifi@abdulfortech1',
          },
        });
        
        const mailOptions = {
          from: "nazifi@abdulfortech.com",
          to: Email, 
          subject: 'Mufal DataSub Reset Link', 
          text: link, 
          html:`<h1>Click This Link To Reset Your Passwor</h1>` +link,
        };
        
        // Send email and handle errors with detailed logging
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error occurred:', error); // Log the entire error object for better debugging
            if (error.response) {
              console.error('SMTP Response:', error.response); // Log the SMTP response in case of failure
            } 
            if (error.code) {
              console.error('Error Code:', error.code); // Log the error code if available 
            }
            if (error.command) {
              console.error('Command Error:', error.command); // Log the command that caused the error if available
            }
            return console.log('Error details:', error.message); // Log the error message
          }
        
          console.log('Message sent: %s', info.messageId); // Log the message ID when sent successfully
        });
        

         res.status(200).json({message:"Reset Link Was Successfully Sent To "+"  "+Email +" And Will Expire In 1Minute"})
   

      })
      
    
     }


     
})


} 

export const resetPassword = (req, res) => {
  const { id, token, pwd, Cpwd } = req.body;

  // Verify the token
  db.query(`SELECT password FROM customer WHERE customerId="${id}"`, async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" }); // Add return to stop further execution
    }

    if (!result[0]) {
      return res.status(404).json({ message: "User not found" }); // Add return to stop further execution
    }

    const secret = process.env.Secret_Key + result[0].password;

    try {
      const payload = jwt.verify(token, secret);

      if (payload.id !== id) {
        return res.status(401).json({ message: "Invalid token" }); // Add return to stop further execution
      }

      // Check if passwords match
      if (pwd !== Cpwd) {
        return res.status(401).json({ message: "Passwords do not match" }); // Add return to stop further execution
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(Cpwd, 12);

      // Update the password in the database
      db.query(`UPDATE customer SET password="${hashedPassword}" WHERE customerId="${id}"`, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update password" }); // Add return to stop further execution
        }

        return res.status(200).json({ message: "Password updated successfully" });
      });

    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }); 
 };

export const dialog=(req,res)=>{
    db.query(`select dialogmessage from dataprice where muhdid="38271764"`,(err,result)=>{
      if(err) {console.log(err)}
      res.status(200).json(result[0].dialogmessage)
    })
}

export const fund=(req,res)=>{

res.json({message:"Successful"}) 
 
} 
export const CPin=(req,res)=>{ 
 const {OldP,NewP,CNewP,d}=req.body 
 db.query(`select transactionpin from Customer where CustomerId="${d}"`,async(err,result)=>{
  if(err){ console.log(err)} 
  if (!result.length||! await bcrypt.compare(OldP,result[0].transactionpin)){
    res.status(501).json({message:"Incorrect Old Pin"})
  }  
    else{ 
      if(NewP!=CNewP){
        res.status(501).json({message:"New Pin Does'nt Match"})
      }else{ 
        const hashedPassword= await bcrypt.hash(NewP,12)
       db.query(`update customer set transactionpin="${hashedPassword}" where customerid=${d}`,(err,result)=>{
        if(err){console.log(err)}
         
             res.status(200).json()
       })

      }
    }
 })

}
export const pricing=async(req,res)=>{
  try {
     db.query(`select * from dataprice where muhdid=${38271764}`,(err,result)=>{
      if(err){console.log(err)}
      res.status(200).json(result)
     })
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 
export const BuyData=(req,response)=>{ 
  const { network,datatype,mtnplan,nairaSign,phonenumber,pin,id,checkbox,mtnsme500,mtnsme1gb,mtnsme2gb,mtnsme3gb,mtnsme5gb,mtnsme10gb,mtnsme2500mb,mtnsme21gb,mtnsme21p5,mtnsme22gb,mtnsme23gb,mtnsme24gb,mtnsme25gb,mtnsme210gb,mtndatashare1gb,mtndatashare2gb,mtndatashare3gb,mtndatashare5gb
    , mtndatashare500mb,mtncooperate500mb,byepass,mtncooperate250mb,mtncooperate1gb,mtncooperate2gb,mtncooperate3gb,mtncooperate5gb,mtncooperate10gb,mtngifting500mb,mtngifting1gb,mtngifting1p5gb,mtngifting2p5gb,mtngifting3p5gb,mtngifting15gb,airelgifting1gb,airelgifting3gb,airelgifting10gb,airelcooperate500mb,airelcooperate300mb,airelcooperate1gb,airelcooperate2gb,airelcooperate5gb,airelcooperate10gb,airelcooperate15gb,glo200mb,glo500mb,glo1gb,glo2gb,glo3gb,glo5gb,glo10gb,nine500mb,nine1gb,nine2gb,nine3gb,nine5gb,nine10gb,nine15gb}=req.body  
                db.query(`select price,transactionpin from customer where customerid="${id}"`,async(err,result) =>{
               if(err){console.log(err)}
                
                var r=null 
                if(byepass==="on"){
                  r=true
                }
                else{r=false}
          
         if(network==="MTN"){
             if(datatype==="SME"){
                     if(mtnplan==="500MB   "+nairaSign+mtnsme500){
                    if(result[0].price>=mtnsme500){
                      if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                                response.status(501).json({message:"INCORRECT PIN"})
                      } 
                      else{
                        //api
                        
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 290,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
          const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme500
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme500}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  response.status(200).json(result)
                 })  


          }
          else{
            response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
                        

                      }

                    }
                    else{
                      response.status(501).json({message:"INSUFFICIENT BALANCE"})
                    }

                     }
                     else if(mtnplan==="1GB   "+nairaSign+mtnsme1gb){
                      if(result[0].price>=mtnsme1gb){
                        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                          response.status(501).json({message:"INCORRECT PIN"})
                }
                else{
                  //api 
                  
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 291,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme1gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme1gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  response.status(200).json(result)
                 })  


          }
          else{
            response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

                }

                      }
                      else{
                        response.status(501).json({message:"INSUFFICIENT BALANCE"})
                      }



                     }
                     else if(mtnplan==="2GB   "+nairaSign+mtnsme2gb){
                      if(result[0].price>=mtnsme2gb){
                        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                          response.status(501).json({message:"INCORRECT PIN"})
                }
                else{
                      //api 
                      
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 292,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme2gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme2gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  response.status(200).json(result)
                 })  


          }
          else{
            response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
                }

                      }
                      else{
                        response.status(501).json({message:"INSUFFICIENT BALANCE"})
                      }
                     }
                     else if(mtnplan==="3GB   "+nairaSign+mtnsme3gb){
                      if(result[0].price>=mtnsme3gb){
                        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                          response.status(501).json({message:"INCORRECT PIN"})
                }
                else{
                           //api 
                           
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 293,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme3gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme3gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  response.status(200).json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
                }

                      }
                      else{
                       response.status(501).json({message:"INSUFFICIENT BALANCE"})
                      }

                     }
                     else if(mtnplan==="5GB   "+nairaSign+mtnsme5gb){
                      if(result[0].price>=mtnsme5gb){
                        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                         response.status(501).json({message:"INCORRECT PIN"})
                }
                else{
                        //api
                        
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 295,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme5gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme5gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
                }

                      }
                      else{
                       response.status(501).json({message:"INSUFFICIENT BALANCE"})
                      }

                     }
                     else if(mtnplan==="10GB   "+nairaSign+mtnsme10gb){

                      if(result[0].price>=mtnsme10gb){
                        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                         response.status(501).json({message:"INCORRECT PIN"})
                }
                else{
                     //api
                          
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 294,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme10gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme10gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();    

                }
                      }
                      else{
                       response.status(501).json({message:"INSUFFICIENT BALANCE"})
                      }

                     }
                     else{
                     response.status(501).json({message:"SELECT VALID MTN TYPE"})
                     }


              //sme end

             }
             else if(datatype==="SME2"){
              if(mtnplan==="500MB   "+nairaSign+mtnsme2500mb){
                if(result[0].price>=mtnsme2500mb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
            //api  

            
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 321,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme2500mb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme2500mb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="1GB   "+nairaSign+mtnsme21gb){
                if(result[0].price>=mtnsme21gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
                          //api
                          
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 322,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme21gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme21gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="2GB   "+nairaSign+mtnsme22gb){

                if(result[0].price>=mtnsme22gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
                  //api 
                  
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 323,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme22gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme22gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="1.5GB   "+nairaSign+mtnsme21p5){
                if(result[0].price>=mtnsme21p5){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
            //api 
            
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 354,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme21p5
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme21p5}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="3GB   "+nairaSign+mtnsme23gb){

                if(result[0].price>=mtnsme23gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
            //api
            
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 325,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme23gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme23gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="4GB   "+nairaSign+mtnsme24gb){

                if(result[0].price>=mtnsme24gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
                   //api
                   
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 332,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme24gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme24gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="5GB   "+nairaSign+mtnsme25gb){

                if(result[0].price>=mtnsme25gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{
            //api 
            
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 326,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme25gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme25gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else if(mtnplan==="10GB   "+nairaSign+mtnsme210gb){
                if(result[0].price>=mtnsme210gb){
                  if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                   response.status(501).json({message:"INCORRECT PIN"})
          }
          else{

          }
                }
                else{
                 response.status(501).json({message:"INSUFFICIENT BALANCE"})
                }

              }
              else{
              response.status(501).json({message:"SELECT VALID MTN TYPE"})
              }
              //sme2 end
             }
               else if(datatype==="DATA SHARE"){
                if(mtnplan==="500MB   "+nairaSign+mtndatashare500mb){
                  if(result[0].price>=mtndatashare500mb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 353,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtnsme210gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtnsme210gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="1GB   "+nairaSign+mtndatashare1gb){
                  if(result[0].price>=mtndatashare1gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                         //api 
                         
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 339,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtndatashare1gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtndatashare1gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="2GB   "+nairaSign+mtndatashare2gb){
                  if(result[0].price>=mtndatashare2gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 340,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtndatashare2gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtndatashare2gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="3GB   "+nairaSign+mtndatashare3gb){


                  if(result[0].price>=mtndatashare3gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
              const postData = JSON.stringify({
                network: 1,       
                mobile_number: phonenumber,
                plan: 341,            
                Ported_number:r
              });
              
                                const options = {
                                  hostname: 'elrufaidatalink.com', 
                                  path: '/api/data/',
                                  port:443,
                                  method: 'POST',
                                  headers: {
                                    'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                                    'Content-Type': 'application/json',
                                    'Content-Length': postData.length 
                                  }
                                };
                                
          
              const req = https.request(options, (res) => {
                let data = '';
              
        
                res.on('data', (chunk) => {
                  data += chunk;
                });
              
        
                res.on('end', () => {
                 const kano=JSON.parse(data)
                  if(kano.Status==="successful"){
                    const NewBalance=result[0].price-mtndatashare3gb
                    const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
                      db.query(`update customer set price="${NewBalance}"`)
                      db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtndatashare3gb}",userid="${id}" ,planName="500MB" `)
                         db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                          if(err){console.log(err)}
                          res.json(result)
                         })  
        
        
                  }
                  else{
                   response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
                  }
                });
              });
              
        
              req.on('error', (e) => {
                console.error(`Problem with request: ${e.message}`);
              });
        
              req.write(postData);
              
        
              req.end();
        
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="5GB   "+nairaSign+mtndatashare5gb){
                  if(result[0].price>=mtndatashare5gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                          //api 
                          
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 342,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtndatashare5gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtndatashare5gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
            
                else{
                response.status(501).json({message:"SELECT VALID MTN TYPE"})
                }
                       //datashare end
                     
               }

              else if(datatype==="COOPERATE GIFTING"){
                if(mtnplan==="250MB   "+nairaSign+mtncooperate250mb){
                  if(result[0].price>=mtncooperate250mb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 338,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate250mb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate250mb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="500MB   "+nairaSign+mtncooperate500mb){

                  if(result[0].price>=mtncooperate500mb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
             //api 
             
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 296,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate500mb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate500mb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="1GB   "+nairaSign+mtncooperate1gb){

                  if(result[0].price>=mtncooperate1gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                     //api
                     
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 297,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate1gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate1gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="2GB   "+nairaSign+mtncooperate2gb){

                  if(result[0].price>=mtncooperate2gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                         //api 
                         
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 298,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate2gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate2gb

              }",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="3GB   "+nairaSign+mtncooperate3gb){

                  if(result[0].price>=mtncooperate3gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 300,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate3gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate3gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="5GB   "+nairaSign+mtncooperate5gb){
                  if(result[0].price>=mtncooperate5gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                       //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 301,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate5gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate5gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="10GB   "+nairaSign+mtncooperate10gb){
                  if(result[0].price>=mtncooperate10gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{ 
                       //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 302,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtncooperate10gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate10gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
              
 
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else{
                response.status(501).json({message:"SELECT VALID MTN TYPE"})
                }
                //cooperate end

              }
              else if(datatype==="gifting"){
                if(mtnplan==="500MB   "+nairaSign+mtngifting500mb){
                  if(result[0].price>=mtngifting500mb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 333,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtngifting500mb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtngifting500mb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="1.5GB   "+nairaSign+mtngifting1p5gb){
                  if(result[0].price>=mtngifting1p5gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                //api 
              
                const postData = JSON.stringify({
                  network: 1,       
                  mobile_number: phonenumber,
                  plan: 302,            
                  Ported_number:r
                });
                
                                  const options = {
                                    hostname: 'elrufaidatalink.com', 
                                    path: '/api/data/',
                                    port:443,
                                    method: 'POST',
                                    headers: {
                                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                                      'Content-Type': 'application/json',
                                      'Content-Length': postData.length 
                                    }
                                  };
                                  
            
                const req = https.request(options, (res) => {
                  let data = '';
                
          
                  res.on('data', (chunk) => {
                    data += chunk;
                  });
                
          
                  res.on('end', () => {
                   const kano=JSON.parse(data)
                    if(kano.Status==="successful"){
                      const NewBalance=result[0].price-mtncooperate10gb
                      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
                        db.query(`update customer set price="${NewBalance}"`)
                        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtncooperate10gb}",userid="${id}" ,planName="500MB" `)
                           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                            if(err){console.log(err)}
                            res.json(result)
                           })  
          
          
                    }
                    else{
                     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
                    }
                  });
                });
                
          
                req.on('error', (e) => {
                  console.error(`Problem with request: ${e.message}`);
                });
          
                req.write(postData);
                
          
                req.end();
                        
           
                      }
                            }
                            else{
                             response.status(501).json({message:"INSUFFICIENT BALANCE"})
                            }
          
                          }
                          else{
                          response.status(501).json({message:"SELECT VALID MTN TYPE"})
                          }
                          //cooperate end
          
                        }
                        else if(datatype==="GIFTING"){
                          if(mtnplan==="500MB   "+nairaSign+mtngifting500mb){
                            if(result[0].price>=mtngifting500mb){
                              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                               response.status(501).json({message:"INCORRECT PIN"})
                      }
                      else{
                        //api 
                        
                const postData = JSON.stringify({
                  network: 1,       
                  mobile_number: phonenumber,
                  plan: 331,            
                  Ported_number:r
                });
                
                                  const options = {
                                    hostname: 'elrufaidatalink.com', 
                                    path: '/api/data/',
                                    port:443,
                                    method: 'POST',
                                    headers: {
                                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                                      'Content-Type': 'application/json',
                                      'Content-Length': postData.length 
                                    }
                                  };
                                  
            
                const req = https.request(options, (res) => {
                  let data = '';
                
          
                  res.on('data', (chunk) => {
                    data += chunk;
                  });
                
          
                  res.on('end', () => {
                   const kano=JSON.parse(data)
                    if(kano.Status==="successful"){
                      const NewBalance=result[0].price-mtngifting1p5gb
                      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
                        db.query(`update customer set price="${NewBalance}"`)
                        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtngifting1p5gb}",userid="${id}" ,planName="500MB" `)
                           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                            if(err){console.log(err)}
                            res.json(result)
                           })  
          
          
                    }
                    else{
                     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
                    }
                  });
                });
                
          
                req.on('error', (e) => {
                  console.error(`Problem with request: ${e.message}`);
                });
          
                req.write(postData);
                
          
                req.end();
          
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="2.5GB   "+nairaSign+mtngifting2p5gb){
                  if(result[0].price>=mtngifting2p5gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 330,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtngifting2p5gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtngifting2p5gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="3.5GB   "+nairaSign+mtngifting3p5gb){
                  if(result[0].price>=mtngifting3p5gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
              //api 
              
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 349,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtngifting3p5gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtngifting3p5gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();

            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
                else if(mtnplan==="15GB   "+nairaSign+mtngifting15gb){
                  if(result[0].price>=mtngifting15gb){
                    if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
                     response.status(501).json({message:"INCORRECT PIN"})
            }
            else{
                    //api 
                    
      const postData = JSON.stringify({
        network: 1,       
        mobile_number: phonenumber,
        plan: 351,            
        Ported_number:r
      });
      
                        const options = {
                          hostname: 'elrufaidatalink.com', 
                          path: '/api/data/',
                          port:443,
                          method: 'POST',
                          headers: {
                            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length 
                          }
                        };
                        
  
      const req = https.request(options, (res) => {
        let data = '';
      

        res.on('data', (chunk) => {
          data += chunk;
        });
      

        res.on('end', () => {
         const kano=JSON.parse(data)
          if(kano.Status==="successful"){
            const NewBalance=result[0].price-mtngifting15gb
            const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
              db.query(`update customer set price="${NewBalance}"`)
              db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${mtngifting15gb}",userid="${id}" ,planName="500MB" `)
                 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
                  if(err){console.log(err)}
                  res.json(result)
                 })  


          }
          else{
           response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
          }
        });
      });
      

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
      });

      req.write(postData);
      

      req.end();
            }
                  }
                  else{
                   response.status(501).json({message:"INSUFFICIENT BALANCE"})
                  }

                }
            
                else{
                response.status(501).json({message:"SELECT VALID MTN TYPE"})
                }
                //gifting end
              }
              else{

               response.status(501).json({message:"SELECT DATA TYPE"})
              }




         }  
         else if(network==="AIRTEL"){

          if(datatype==="300MB   COOPERATE GIFTING"+nairaSign+airelcooperate300mb){
            if(result[0].price>=airelcooperate300mb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 334,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate300mb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate300mb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }


          }
          else if(datatype==="500MB   COOPERATE GIFTING"+nairaSign+airelcooperate500mb){
            if(result[0].price>=airelcooperate500mb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 304,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate500mb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate500mb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

          }
          else if(datatype==="1GB   GIFTING"+nairaSign+airelgifting1gb){
            if(result[0].price>=airelgifting1gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 352,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelgifting1gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelgifting1gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

            
          }
          else if(datatype==="1GB   COOPERATE GIFTING"+nairaSign+airelcooperate1gb){
            if(result[0].price>=airelcooperate1gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 1,       
  mobile_number: phonenumber,
  plan: 305,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate1gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate1gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

            
          }
          else if(datatype==="2GB   COOPERATE GIFTING"+nairaSign+airelcooperate2gb){
            if(result[0].price>=airelcooperate2gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 306,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate2gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate2gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

            
          }
          else if(datatype==="3GB   GIFTING"+nairaSign+airelgifting3gb){
            if(result[0].price>=airelgifting3gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,   
  mobile_number: phonenumber,
  plan: 346,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelgifting3gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelgifting3gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

            
          }
          else if(datatype==="5GB   COOPERATE GIFTING"+nairaSign+airelcooperate5gb){
            if(result[0].price>=airelcooperate5gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 307,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate5gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate5gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

          }
          else if(datatype==="10GB   GIFTING"+nairaSign+airelgifting10gb){
            if(result[0].price>=airelgifting10gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 347,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelgifting10gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelgifting10gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

            
          }
          else if(datatype==="10GB   COOPERATE GIFTING"+nairaSign+airelcooperate10gb){
            if(result[0].price>=airelcooperate10gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 308,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate10gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate10gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

          }
          else if(datatype==="15GB   COOPERATE GIFTING"+nairaSign+airelcooperate15gb){
            if(result[0].price>=airelcooperate15gb){
              if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
               response.status(501).json({message:"INCORRECT PIN"})
      }
      else{
        //api 
        
const postData = JSON.stringify({
  network: 4,       
  mobile_number: phonenumber,
  plan: 309,            
  Ported_number:r
});

                  const options = {
                    hostname: 'elrufaidatalink.com', 
                    path: '/api/data/',
                    port:443,
                    method: 'POST',
                    headers: {
                      'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length 
                    }
                  };
                  

const req = https.request(options, (res) => {
  let data = '';


  res.on('data', (chunk) => {
    data += chunk;
  });


  res.on('end', () => {
   const kano=JSON.parse(data)
    if(kano.Status==="successful"){
      const NewBalance=result[0].price-airelcooperate15gb
      const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
        db.query(`update customer set price="${NewBalance}"`)
        db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${airelcooperate15gb}",userid="${id}" ,planName="500MB" `)
           db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
            if(err){console.log(err)}
            res.json(result)
           })  


    }
    else{
     response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
    }
  });
});


req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

      }
            }
            else{
             response.status(501).json({message:"INSUFFICIENT BALANCE"})
            }

         }
          else{
                  response.status(501).json({message:"SELECT VALID AIRTEL PLAN"})
          }

//airtel
         }      
     else if(network==="GLO"){
      if(datatype==="200MB   COOPERATE GIFTING"+nairaSign+glo200mb){
        if(result[0].price>=glo200mb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  } 
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 310,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo200mb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo200mb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }


}
   else if(datatype==="500MB   COOPERATE GIFTING"+nairaSign+glo500mb){
    if(result[0].price>=glo500mb){
      if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
       response.status(501).json({message:"INCORRECT PIN"})
}
else{
//api 

const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 299,            
Ported_number:r
});

          const options = {
            hostname: 'elrufaidatalink.com', 
            path: '/api/data/',
            port:443,
            method: 'POST',
            headers: {
              'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
              'Content-Type': 'application/json',
              'Content-Length': postData.length 
            }
          };
          

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
const NewBalance=result[0].price-glo500mb
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo500mb}",userid="${id}" ,planName="500MB" `)
   db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
    if(err){console.log(err)}
    res.json(result)
   })  


}
else{
res.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

}
    }
    else{
     response.status(501).json({message:"INSUFFICIENT BALANCE"})
    }


      }
      else if(datatype==="1GB   COOPERATE GIFTING"+nairaSign+glo1gb){
        if(result[0].price>=glo1gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 303,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo1gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo1gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

        
      }
      else if(datatype==="2GB   COOPERATE GIFTING"+nairaSign+glo2gb){
        if(result[0].price>=glo2gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 311,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo2gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo2gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

         
      }
      else if(datatype==="3GB   COOPERATE GIFTING"+nairaSign+glo3gb){
        if(result[0].price>=glo3gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 312,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';  


res.on('data', (chunk) => {
data += chunk;
}); 


res.on('end', () => {
  const kano=JSON.parse(data)
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo3gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo3gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

        
      }
      else if(datatype==="5GB   COOPERATE GIFTING"+nairaSign+glo5gb){
        if(result[0].price>=glo5gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 313,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo5gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo5gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }
    
      }
      else if(datatype==="10GB   COOPERATE GIFTING"+nairaSign+glo10gb){
        if(result[0].price>=glo10gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 2,       
mobile_number: phonenumber,
plan: 314,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-glo10gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${glo10gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

        
      }
      else{
     response.status(501).json({message:"SELECT VALID GLO PLAN"})
      }
  //glo
     }
     else if(network==="9MOBILE"){
      if(datatype==="500MB   COOPERATE GIFTING"+nairaSign+nine500mb){
        if(result[0].price>=nine500mb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 327,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine500mb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine500mb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="1GB   COOPERATE GIFTING"+nairaSign+nine1gb){
        if(result[0].price>=nine1gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network:3 ,       
mobile_number: phonenumber,
plan: 316,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine1gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine1gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="2GB   COOPERATE GIFTING"+nairaSign+nine2gb){
        if(result[0].price>=nine2gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 317,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine2gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine2gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="3GB   COOPERATE GIFTING"+nairaSign+nine3gb){
        if(result[0].price>=nine3gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 318,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine3gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine3gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="5GB   COOPERATE GIFTING"+nairaSign+nine5gb){
        if(result[0].price>=nine3gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 319,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => { 
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine5gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine5gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)} 
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="10GB   COOPERATE GIFTING"+nairaSign+nine10gb){
        if(result[0].price>=nine10gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 320,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine10gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine10gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
        res.json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}

});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();


  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else if(datatype==="15GB   COOPERATE GIFTING"+nairaSign+nine15gb){
        if(result[0].price>=nine15gb){
          if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
           response.status(501).json({message:"INCORRECT PIN"})
  }
  else{
    //api 
    
const postData = JSON.stringify({
network: 3,       
mobile_number: phonenumber,
plan: 324,            
Ported_number:r
});

              const options = {
                hostname: 'elrufaidatalink.com', 
                path: '/api/data/',
                port:443,
                method: 'POST',
                headers: {
                  'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
                  'Content-Type': 'application/json',
                  'Content-Length': postData.length 
                }
              };
              

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});


res.on('end', () => {
console.log(JSON.parse(data));
if(kano.Status==="successful"){
  const NewBalance=result[0].price-nine15gb
  const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
    db.query(`update customer set price="${NewBalance}"`)
    db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Data Sub" ,transactionstatus="successful", recipientnumber="${phonenumber} ",tansactionamount="${nine15gb}",userid="${id}" ,planName="500MB" `)
       db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
        if(err){console.log(err)}
       response.status(200).json(result)
       })  


}
else{
 response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})

}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});

req.write(postData);


req.end();

  }
        }
        else{
         response.status(501).json({message:"INSUFFICIENT BALANCE"})
        }

      }
      else{
       response.status(501).json({message:"SELECT VALID 9MOBILE PLAN"})
      }
               //9mobiole
     }
     else{
     response.status(501).json({message:"SELECT NETWORK TYPE"})
     }






 








































    })

}
 

export const pinforgot=(req,res)=>{ 
  const{pwd,t}=req.body  
  db.query(`select password,email from customer where customerid="${t}"`,async(err,result)=>{
    if(err){ console.log(err)} 
    if (!result.length||! await bcrypt.compare(pwd,result[0].password))

      {
         res.status(501).json({message:"Incorrect Login Password "})

      } 
    else{ 
      const secret=process.env.Secret_Key+result[0].password 

      const payload={
             email:result[0].email,
             id:t
      }  
      const token=jwt.sign(payload,secret,{expiresIn:'12m'})
      const link=`http://localhost:5173/ResetPassword/${t}/${token}`
      console.log(link)

    }
    
    
    })
}




export const BuyAirtime=(req,response)=>{
 const {network,pin,id,Plan,phonenumber,byepass}=req.body
 var t=null 
 if(byepass==="on"){
  t=true
 }
 else{
  t=false
 }
 db.query(`select transactionpin,price from customer where customerid="${id}"`,async(err,result)=>{
      if(err){console.log(err)}
      console.log(result)
  if(network==="MTN"){
    if(Plan==="₦100  @₦99"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 100,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-98
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="MTN" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${98}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦300  @₦297"){
      if(result[0].price>=300){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 300,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-297
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="MTN AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${297}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦200  @₦198"){
      if(result[0].price>=200){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 200,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-198
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="MTN AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${198}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    } 
    else if(Plan==="₦500  @₦495"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 500,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-495
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="MTN AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${495}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦1000  @₦990"){
      if(result[0].price>=1000){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 1000,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-990
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="MTN AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${990}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else{
      response.status(501).json({message:"SELECT VALID MTN PLAN"})
    }
  
   }
  
  else if(network==="AIRTEL"){  

 if(Plan==="₦100  @₦99"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){  
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 4,        // Replace with the actual network ID
  amount: 100,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-98
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${98}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦300  @₦297"){
      if(result[0].price>=300){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 4,        // Replace with the actual network ID
  amount: 300,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-297
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${297}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦200  @₦198"){
      if(result[0].price>=200){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 4,        // Replace with the actual network ID
  amount: 200,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-198
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${198}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    } 
    else if(Plan==="₦500  @₦495"){
      if(result[0].price>=500){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 4,        // Replace with the actual network ID
  amount: 500,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-495
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${495}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦1000  @₦990"){
      if(result[0].price>=1000){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 1,        // Replace with the actual network ID
  amount: 1000,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-990
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${990}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else{
      response.status(501).json({message:"SELECT VALID MTN PLAN"})
    }
  
  }
  else if(network==="GLO"){
    if(Plan==="₦100  @₦99"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 2,        // Replace with the actual network ID
  amount: 100,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-98
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="GLO AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${98}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦300  @₦297"){
      if(result[0].price>=300){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 2,        // Replace with the actual network ID
  amount: 300,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-297
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="GLO AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${297}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦200  @₦198"){
      if(result[0].price>=200){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 2,        // Replace with the actual network ID
  amount: 200,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-198
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="GLO AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${198}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    } 
    else if(Plan==="₦500  @₦495"){
      if(result[0].price>=500){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 2,        // Replace with the actual network ID
  amount: 500,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-495
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="GLO AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${495}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦1000  @₦990"){
      if(result[0].price>=1000){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 2,        // Replace with the actual network ID
  amount: 1000,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-990
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="GLO AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${990}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else{
      response.status(501).json({message:"SELECT VALID MTN PLAN"})
    }
  
  }
  
  else if(network==="9MOBILE"){
    if(Plan==="₦100  @₦99"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 3,        // Replace with the actual network ID
  amount: 100,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-98
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="9MOBILE AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${98}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦300  @₦297"){
      if(result[0].price>=300){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 3,        // Replace with the actual network ID
  amount: 300,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-297
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="9MOBILE AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${297}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦200  @₦198"){
      if(result[0].price>=200){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 3,        // Replace with the actual network ID
  amount: 200,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-198
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="9MOBILE AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${198}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    } 
    else if(Plan==="₦500  @₦495"){
      if(result[0].price>=100){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 3,        // Replace with the actual network ID
  amount: 500,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-495
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="Airtel" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${495}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else if(Plan==="₦1000  @₦990"){
      if(result[0].price>=1000){
        if(!result.length||! await bcrypt.compare(pin,result[0].transactionpin )){
          response.status(501).json({message:"INCORRECT PIN"})
}
else{
      //api 
      
const postData = JSON.stringify({
  network: 3,        // Replace with the actual network ID
  amount: 1000,             // Replace with the actual amount
  mobile_number: phonenumber,       // Replace with the actual mobile number
  Ported_number: t,        // Indicates if the number is ported or not
  airtime_type: "VTU"
});

        const options = {
          hostname: 'elrufaidatalink.com', 
          path: '/api/topup/',
          port:443,
          method: 'POST',
          headers: {
            'Authorization': 'Token 3c88c484d3d405c4cb80b92bd3dc8eab182a4c50',
            'Content-Type': 'application/json',
            'Content-Length': postData.length 
          }
        };
        

const req = https.request(options, (res) => {
let data = '';


res.on('data', (chunk) => {
data += chunk;
});

 
res.on('end', () => { 
console.log(JSON.parse(data));
const kano=JSON.parse(data) 
if(kano.Status==="successful"){
const NewBalance=result[0].price-990
const MDS="MDS"+Math.floor(Math.random()*1213009478547770)
db.query(`update customer set price="${NewBalance}"`)
db.query(`insert into transactionhistory set transactionid="${MDS}" ,transactiontype="9MOBILE AIRTIME" ,transactionstatus="successful", recipientnumber="${phonenumber} ",transactionamount="${990}",userid="${id}" ,planName="100 Naira" `)
 db.query(`select * from customer where customerid="${id}"`,(err,result)=>{
  if(err){console.log(err)}
  response.status(200).json(result)
 })  


}
else{
response.status(501).json({message:"NETWORK ERROR ,PLEASE TRY AGAIN"})
}
});
});


req.on('error', (e) => {
console.error(`Problem with request: ${e.message}`);
});
 
req.write(postData);


req.end();
}

      }
      else{
        response.status(501).json({message:"INSUFFICIENT BALANCE"})
      }
    }
    else{
      response.status(501).json({message:"SELECT VALID MTN PLAN"})
    }
  
  }
  else{
    response.status(501).json({message:"SELECT VALID NETWORK "}) 
  }
         
 })   
   
}  
  

export const transaction=(req,res)=>{
  const id=req.params.id
 db.query(`select transactionid,transactionstatus,planname from transactionhistory  where userid=${id}`,(err,result)=>{
  if(err){console.log(err)} 
res.status(200).json(result) 
 })

}

export const transactionDetail=(req,res)=>{
  const id=req.params.id
 db.query(`select * from transactionhistory  where transactionid="${id}"`,(err,result)=>{
  if(err){console.log(err)} 
res.status(200).json(result)
console.log(result)
 })

}
















