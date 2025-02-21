import  express from "express";
import {createRouteHandler} from "uploadthing/express";
import uploadRouter from "./uploadThing.js";

const uploadThingRouter = express.Router();

uploadThingRouter.use(
  "/",
  createRouteHandler({
    router: uploadRouter,
  })
);

export default uploadThingRouter;
