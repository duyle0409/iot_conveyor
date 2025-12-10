import { Request, Response } from "express";
import { initMqtt } from "../config/mqtt";
import Session from "../model/session.model";

export const dashboard = async (req: Request, res: Response) => {
  const sessionList = await Session.find({
    status : "stopped"
  })

  
  res.render("dashboard", {
    sessionList: sessionList
  });
}