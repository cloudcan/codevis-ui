import { Node, Relationship, Path, PathSegment } from "neo4j-driver/types/v1";
import { NodeBase, PathBase, Rbase, PathSeg } from "../../model/types";

// convert neo4j node to nodebase
export function parseNode(node: Node): NodeBase {
  return Object.assign(node.properties, {
    id: node.identity.toNumber(),
    label: node.labels[0]
  }) as NodeBase;
}
export function parseRelationship(r: Relationship): Rbase {
  return Object.assign(r.properties, {
    id: r.identity.toNumber(),
    from: r.start.toNumber(),
    to: r.end.toNumber()
  }) as Rbase;
}
export function parsePathSegment(p: PathSegment): PathSeg {
  return {
    from: parseNode(p.start),
    to: parseNode(p.end),
    r: parseRelationship(p.relationship)
  } as PathSeg;
}
export function parsePath(path: Path): PathBase {
  return {
    from: parseNode(path.start),
    to: parseNode(path.end),
    length: path.length,
    segments: path.segments.map(parsePathSegment)
  } as PathBase;
}
