import { Router } from "express";
import {
  register, login, getMe, updateProfile,
  changePassword, logout, refreshToken,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validate, registerSchema, loginSchema } from "../middleware/validation";

const router = Router();

router.post("/register",        validate(registerSchema), register);
router.post("/login",           validate(loginSchema),    login);
router.post("/logout",          protect,                  logout);
router.post("/refresh-token",                             refreshToken);
router.get("/me",               protect,                  getMe);
router.put("/profile",          protect,                  updateProfile);
router.put("/change-password",  protect,                  changePassword);

export default router;
