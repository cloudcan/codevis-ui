import Router from "koa-router";
import controllers from "../controller";

const router = new Router()
  .get("/api/root", controllers.getRoot)
  .get("/api/node", controllers.getNode)
  .get("/api/cpath", controllers.getChildrenPath)
  .get("/api/ppath", controllers.getParentPath);

export default router;
