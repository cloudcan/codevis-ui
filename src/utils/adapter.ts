import {
  NodeBase,
  NodeLabel,
  ContainerNode,
  ProgramNode,
  Rbase,
  PathBase,
  PathSeg
} from "@/model/types";
import {
  CONSTANT_ICON,
  APPLICATION_ICON,
  PACKAGE_ICON,
  FILE_ICON,
  FUNCTION_ICON,
  GLOBAL_ICON,
  NODE_ICON,
  CONTAINER_ICON
} from "@/assets/icon";
import { DataSet } from "vis";
export interface VisNode {
  label: string;
  id: number;
  data: Object;
}
export interface VisEdge {
  from: number;
  to: number;
  id: number;
  data: Object;
}
function parseNode(n: NodeBase): VisNode {
  return {
    id: n.id,
    label: n.name,
    title: `<div style="background-color:#ff0">${n.name}</div>`,
    data: n,
    shape: "image",
    image: getImage(n)
  } as VisNode;
}
function parseRelationship(r: Rbase): VisEdge {
  return {
    from: r.from,
    to: r.to,
    id: r.id,
    data: r
  } as VisEdge;
}
/**
 * 添加节点
 * @param nodes
 */
export function addNode(nodes: DataSet<VisNode>, ...nodeData: NodeBase[]) {
  nodeData.forEach(node => {
    let n = parseNode(node);
    try {
      nodes.add(n);
    } catch (error) {
    //   console.warn(error);
    }
  });
}
/**
 * 添加边
 * @param edges
 */
export function addEdge(edges: DataSet<VisEdge>, ...rData: Rbase[]) {
  rData.forEach(r => {
    let e = parseRelationship(r);
    try {
      edges.add(e);
    } catch (error) {
    //   console.warn(error);
    }
  });
}
/**
 * 添加路径
 * @param paths
 */
export function addPath(
  nodes: DataSet<VisNode>,
  edges: DataSet<VisEdge>,
  ...pathData: PathBase[]
) {
  pathData.forEach(path => {
    path.segments.forEach(ps => {
      addNode(nodes, ps.from);
      addNode(nodes, ps.to);
      addEdge(edges, ps.r);
    });
  });
}
function getImage(node: NodeBase) {
  switch (node.label) {
    case "Program":
      return APPLICATION_ICON;
    case "Package":
      return PACKAGE_ICON;
    case "File":
      return FILE_ICON;
    case "Function":
      return FUNCTION_ICON;
    case "Global":
      return GLOBAL_ICON;
    case "Const":
      return CONSTANT_ICON;
    case "Container":
      return CONTAINER_ICON;
    default:
      return NODE_ICON;
  }
}
export function getChildrenPathParams(
  node: NodeBase
): { r: string; label: NodeLabel; pid: number } {
  switch (node.label) {
    case NodeLabel.Container:
      return {
        r: "Belong",
        label: (<ContainerNode>node).children,
        pid: (<ContainerNode>node).rid
      };
    case NodeLabel.Prog:
      return {
        r: "Belong",
        label: NodeLabel.Pkg,
        pid: node.id
      };
    case NodeLabel.Pkg:
      return {
        r: "Contains",
        label: NodeLabel.File,
        pid: node.id
      };
    case NodeLabel.File:
      return {
        r: "Declare",
        label: NodeLabel.Func,
        pid: node.id
      };
    default:
      throw new Error("this node no children");
  }
}
