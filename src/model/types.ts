export interface NodeBase {
  name: string;
  id: number;
  label: NodeLabel;
}
export enum NodeLabel {
  Prog = "Program",
  Pkg = "Package",
  File = "File",
  Func = "Function",
  Global = "Global",
  Const = "Const",
  Container = "Container"
}
export interface ProgramNode extends NodeBase {}
export interface PackageNode extends NodeBase {
  path: string;
}
export interface ContainerNode extends NodeBase {
  children: NodeLabel;
  rid: number;
}
export interface ElementNode extends NodeBase {
  pkg: string;
  file: string;
}
export interface FileNode extends ElementNode {
  path: string;
  lines: number;
}
export interface FunctionNode extends ElementNode {
  sign: string;
}
export interface GlobalNode extends ElementNode {
  type: string;
}
export interface ConstNode extends ElementNode {
  type: string;
  value: string;
}
export interface TypeNode extends ElementNode {
  underlying: string;
  methods: string[];
  fields: string[];
}
export interface PathBase {
  from: NodeBase;
  to: NodeBase;
  length: number;
  segments: PathSeg[];
}
export interface PathSeg {
  from: NodeBase;
  to: NodeBase;
  r: Rbase;
}
export interface Rbase {
  from: number;
  to: number;
  id: number;
  type: string;
}
