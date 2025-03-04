import express from "express";
import {

  updateUser
  

} from "../controllers/user.controller.js";
import {verifyToken,update} from "../middleware/verifyToken.js";

const router = express.Router();

router.put("/p/:id", update);
router.put("/:id", verifyToken,updateUser);

export default router;
