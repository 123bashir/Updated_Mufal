import express from "express";
import { login, logout, register,PopUp,AdminLogin,transactionA,UserInfo,setNineData,Ffunding,setMtnData,setGloData,setAirtelData,fetchPrice,fetchFunding,PasswordForgot,BManual,fetchUser,CPin,BalanceInfo,dialog,resetPassword ,transactionDetail,transaction,fund,BuyData,pricing,BuyAirtime, pin} from "../controllers/auth.controller.js";
      
const router = express.Router(); 
 
router.post("/register", register);           
router.post("/login", login);
router.post("/Adminlogin", AdminLogin);
 router.get("/fetchPrice",fetchPrice)    
router.post("/pin/:id", pin); 
router.post("/popup", PopUp); 

router.post("/Ffunding/:id", Ffunding); 
router.post("/setMtnData",setMtnData)
router.post("/setGloData",setGloData)
router.post("/setNineData",setNineData)
router.post("/setAirtelData",setAirtelData)
router.delete("/logout",logout)
router.get("/home", pricing); 
router.get("/fetchUser", fetchUser); 
router.get("/fetchFunding", fetchFunding); 

router.get("/BManual/:id", BManual); 

router.get("/dialog", dialog); 
router.get("/BalanceInfo",BalanceInfo)
router.get("/transaction/:id", transaction);
router.get("/transactionA/:id", transactionA);

router.get("/user/:id", UserInfo);






router.get("/transactionDetail/:id", transactionDetail);
router.post("/reset-password/:id/:token",resetPassword)



router.post("/PasswordForgot",PasswordForgot)

router.post("/logout", logout);
// router.get("/fund",fund) 
// router.post("/fund",fund)
router.post("/BuyData",BuyData)
router.post("/BuyAirtime",BuyAirtime)


router.post("/ChangePin",CPin)




export default router;
