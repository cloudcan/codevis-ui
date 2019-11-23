export function parseEdgesFromEvent(e, edges) {
    if (e.edges && Array.isArray(e.edges)) {
        return {
            type:'关系',
            data:getById(e.edges[0], edges)
        }
    }
    throw new Error("edge not found in edges");
}
export function parseNodesFromEvent(n, nodes) {
    if (n.nodes && Array.isArray(n.nodes)) {
        return {
            type:'节点',
            data:getById(n.nodes[0], nodes)
        }
    }
    throw new Error("node not found in nodes");
}
function getById(id, arr) {
    for (let index = 0; index < arr.length; index++) {
        if (id == arr[index].id) {
            return arr[index];
        }

    }
}