import service from "../service";
import { IMiddleware } from "koa-router";
import { ParameterizedContext } from "koa";
import { NodeLabel, Rbase } from "../../model/types";

// 获取所有程序
async function getRoot(ctx: ParameterizedContext) {
  ctx.body = await service.getPrograms();
}
async function getNode(ctx: ParameterizedContext) {
  const rid: number = parseInt(ctx.query["rid"]);
  const label: NodeLabel = ctx.query["label"];
  ctx.body = await service.getNode(rid, label);
}
async function getChildrenPath(ctx: ParameterizedContext) {
  const pid: number =  parseInt(ctx.query["pid"]);
  const label: NodeLabel = ctx.query["label"];
  const r: string = ctx.query["r"];
  ctx.body = await service.getChildrenPath(pid, label, r);
}
async function getParentPath(ctx: ParameterizedContext) {
  const cid: number =  parseInt(ctx.query["cid"]);
  const label: NodeLabel = ctx.query["label"];
  const r: string = ctx.query["r"];
  ctx.body = await service.getParentPath(cid, label, r);
}
export default {
  getRoot,
  getNode,
  getChildrenPath,
  getParentPath
};
