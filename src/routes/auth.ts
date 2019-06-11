import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import AuthController from "../controllers/authController";

const router = Router();

router.post('/login', AuthController.login);

router.post('/change-password', [checkJwt], AuthController.changePassword);

export default router;