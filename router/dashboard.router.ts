import { Router } from "express";
const router = Router();
import * as controller from "../controller/dashboard.controller";

router.get("/",controller.dashboard);

export default router;