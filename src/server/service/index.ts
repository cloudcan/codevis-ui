import { execql } from "../db";
import {
  ProgramNode,
  ElementNode,
  NodeBase,
  PathBase,
  Rbase,
  NodeLabel
} from "../../model/types";
import { Node, Path } from "neo4j-driver/types/v1";
import { parseNode, parsePath } from "../util/parseUtil";

/**
 * 获取所有程序节点
 */
async function getPrograms(): Promise<ProgramNode[]> {
  let rows = await execql("match(n:Program) return n");
  let programs: ProgramNode[] = rows.map(row => {
    return parseNode(row.get("n"));
  });
  return programs;
}
/**
 * 查询节点
 * @param rid 程序根节点ID
 * @param label 节点标签
 */
async function getNode(rid: number, label: NodeLabel): Promise<NodeBase[]> {
  let rows = await execql(
    `match(n:Program)-->(m:${label}) where id(n)=${rid} return m limit 1000`
  );
  let leaf: NodeBase[] = rows.map(row => {
    return parseNode(row.get("m"));
  });
  return leaf;
}
/**
 * 获取子节点路径
 * @param pid 父节点ID
 * @param label 子节点标签
 * @param r 关系
 */
async function getChildrenPath(
  pid: number,
  label: NodeLabel,
  r: string
): Promise<PathBase[]> {
  let rows = await execql(
    `match p=(n)-[:${r}]->(m:${label}) where id(n)= ${pid} return  p limit 100`
  );
  let paths: PathBase[] = rows.map(row => {
    return parsePath(row.get("p"));
  });
  return paths;
}
/**
 * 查询父节点路径
 * @param cid 子节点ID
 * @param label 父节点标签
 * @param r 关系
 */
async function getParentPath(
  cid: number,
  label: NodeLabel,
  r: string
): Promise<PathBase[]> {
  let rows = await execql(
    `match p=(n)<-[:${r}]-(m:${label}) where id(n)=${cid} return p limit 100`
  );
  let paths: PathBase[] = rows.map(row => {
    return parsePath(row.get("p"));
  });
  return paths;
}
export default {
  getPrograms,
  getNode,
  getChildrenPath,
  getParentPath
};
