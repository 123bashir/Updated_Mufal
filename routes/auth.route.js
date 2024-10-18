import express from "express";
import { login, logout, register,PasswordForgot,CPin,dialog,pinforgot,resetPassword ,transactionDetail,transaction,fund,BuyData,pricing,BuyAirtime, pin} from "../controllers/auth.controller.js";
 
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/pin/:id", pin); 
router.get("/home", pricing); 
router.get("/dialog", dialog); 

router.get("/transaction/:id", transaction);
router.get("/transactionDetail/:id", transactionDetail);
router.post("/reset-password/:id/:token",resetPassword)


router.post("/pinforgot", pinforgot);

router.post("/PasswordForgot",PasswordForgot)

router.post("/logout", logout);
// router.get("/fund",fund) 
// router.post("/fund",fund)
router.post("/BuyData",BuyData)
router.post("/BuyAirtime",BuyAirtime)


router.post("/ChangePin",CPin)




export default router;
