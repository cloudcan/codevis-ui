import router from "./router";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

import koaLogger from "koa-logger";
import convert from "koa-convert";
import cors from "koa2-cors";

export function serveHttp() {
  const app = new Koa();
  // 配置请求解析
  app.use(bodyParser());
  // 配置日志
  app.use(convert(koaLogger()));
  // 配置cors
  app.use(cors());
  // 配置路由
  app.use(router.routes()).use(router.allowedMethods());

  //开启端口监听
  app.listen(3000);
  console.log("server listen on 3000");
}
