import request from "@/api/request";
import { NodeLabel, Rbase } from "@/model/types";
/**
 * 获取树的根节点
 */
export async function getRoot() {
  return request({
    url: "/root",
    method: "get"
  });
}
/**
 * 获取树的子节点
 * @param rid 程序ID
 * @param label 子节点标签
 */
export async function getNode(rid: number, label: NodeLabel) {
  return request({
    url: "/node",
    method: "get",
    params: {
      rid,
      label
    }
  });
}
/**
 * 获取子节点路径
 * @param pid 父节点ID
 * @param label 子节点标签
 * @param r 关系
 */
export async function getChildrenPath(
  pid: number,
  label: NodeLabel,
  r: string
) {
  return request({
    url: "/cpath",
    method: "get",
    params: {
      pid,
      label,
      r
    }
  });
}
/**
 * 获取父节点路径
 * @param cid 子节点ID
 * @param label 父节点标签
 * @param r 关系
 */
export async function getParentPath(
  pid: number,
  label: NodeLabel,
  r: string
) {
  return request({
    url: "/ppath",
    method: "get",
    params: {
      pid,
      label,
      r
    }
  });
}
