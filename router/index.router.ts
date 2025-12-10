import { Router } from "express";
const router = Router();
import dashboard from "./dashboard.router";

router.use("/dashboard", dashboard)

export default router;