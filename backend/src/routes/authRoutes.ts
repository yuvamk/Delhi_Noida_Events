import { Router } from "express";
import {
  register, login, getMe, updateProfile,
  changePassword, logout, refreshToken,
  generateOTP, verifyOTP, toggle2FA, googleLogin
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validate, registerSchema, loginSchema } from "../middleware/validation";

const router = Router();

router.post("/register",        validate(registerSchema), register);
router.post("/login",           validate(loginSchema),    login);
router.post("/google-login",                              googleLogin);
router.post("/logout",          protect,                  logout);
router.post("/refresh-token",                             refreshToken);
router.get("/me",               protect,                  getMe);
router.put("/profile",          protect,                  updateProfile);
router.put("/change-password",  protect,                  changePassword);
router.post("/toggle-2fa",      protect,                  toggle2FA);
router.post("/generate-otp",                              generateOTP);
router.post("/verify-otp",                                verifyOTP);

export default router;
