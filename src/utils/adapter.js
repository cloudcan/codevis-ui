import { error } from "util";
import { DataSet } from 'vis';
/**
 * 适配路径数据
 * @param {} data [{start:{},end:{},relationShip:{}}]
 */
export function adaptPath(data) {
    if (Array.isArray(data)) {
        var nodes = [];
        var edges = [];
        //遍历每一条路径
        data.forEach(ele => {
            //处理start
            if (ele.start) {
                let node = ele.start;
                nodes.push({
                    id: node.id,
                    label: node.name,
                    color: getColor(node.nodeType),
                    data: node
                });
            }
            //处理end
            if (ele.end) {
                let node = ele.end;
                nodes.push({
                    id: node.id,
                    label: node.name,
                    color: getColor(node.nodeType),
                    data: node
                });
            }
            //处理relationShip
            if (ele.relationShip) {
                let r = ele.relationShip;
                edges.push({
                    id: r.id,
                    from: r.start.id,
                    to: r.end.id,
                    data: r,
                    arrows:{
                        to:{
                            type:getArrowsType(r.edgeType)
                        }
                    },
                    dashes:r.edgeType=='Association'
                });
            }
        });
        return dataFilter({
            nodes: nodes,
            edges: edges
        });
    } else {
        throw new Error("数据格式错误");
    }
}
/**
 * 适配节点家庭数据
 */
export function adaptFamily(data) {
    //
    if (data.me) {
        var nodes = [];
        var edges = [];
        let me = data.me;
        let parents = data.parents;
        let sibling = data.sibling;
        let children = data.children;
        let r = data.relationShips;
        //me
        nodes.push({
            id: me.id,
            label: me.name,
            color: getColor(me.nodeType),
            data: me
        });
        //双亲数据
        parents.forEach(node => {
            nodes.push({
                id: node.id,
                label: node.name,
                color: getColor(node.nodeType),
                data: node
            });
        });
        //兄弟姐妹数据
        sibling.forEach(node => {
            nodes.push({
                id: node.id,
                label: node.name,
                color: getColor(node.nodeType),
                data: node
            });
        });
        //孩子数据
        children.forEach(node => {
            nodes.push({
                id: node.id,
                label: node.name,
                color: getColor(node.nodeType),
                data: node
            });
        });
        //家庭关系
        r.forEach(edge => {
            edges.push({
                id: edge.id,
                from: edge.start.id,
                to: edge.end.id,
                data: edge,
                arrows:{
                    to:{
                        type:getArrowsType(edge.edgeType)
                    }
                },
                dashes:edge.edgeType=='Association'
            });
        });
        return dataFilter({
            nodes: nodes,
            edges: edges
        });
    } else {
        throw new Error("错误的数据格式");
    }
}
/**
 * 数据去重
 */
export function dataFilter(data) {
    if (Array.isArray(data)) {
        let r = [];
        data.forEach(ele => {
            if (notInArray(ele, r)) {
                r.push(ele);
            } else {
                // eslint-disable-next-line no-console
                console.log("id:" + ele.id + "已经存在！");
            }
        });
        return r;
    } else {
        if (data && data.nodes && data.edges) {
            let n = [];
            let e = [];
            let nodes = data.nodes;
            let edges = data.edges;
            nodes.forEach(nn => {
                if (notInArray(nn, n)) {
                    n.push(nn);
                } else {
                    // eslint-disable-next-line no-console
                    console.log("id:" + nn.id + "已经存在！");
                }
            });
            edges.forEach(ee => {
                if (notInArray(ee, e)) {
                    e.push(ee);
                } else {
                    // eslint-disable-next-line no-console
                    console.log("id:" + ee.id + "已经存在！");
                }
            });
            return {
                nodes: n,
                edges: e
            };
        } else {
            throw new error("非法的对象");
        }

    }
}
/**
 * 断言数组中不包含此对象
 * @param {*} ele 
 * @param {*} arr 
 */
function notInArray(ele, arr) {
    for (let index = 0; index < arr.length; index++) {
        if (ele.id == arr[index].id) {
            return false;
        }
    }
    return true;
}

/**
 * 添加数据
 */
export function addData(raw, add) {
    if (Array.isArray(raw)) {
        if (Array.isArray(add)) {
            add.forEach(ele => {
                if (notInArray(ele, raw)) {
                    raw.push(ele);
                } else {
                    // eslint-disable-next-line no-console
                    console.log("id:" + ele.id + "已经存在！");
                }
            });
        } else {
            if (notInArray(add, raw)) {
                raw.push(add);
            } else {
                // eslint-disable-next-line no-console
                console.log("id:" + add.id + "已经存在！");
            }
        }
    } else if (raw instanceof DataSet) {
        if (Array.isArray(add)) {
            add.forEach(ele => {
                try {
                    raw.add(ele);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.log("id:" + ele.id + "已经存在！");
                }

            });
        } else {
            try {
                raw.add(add);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log("id:" + add.id + "已经存在！");
            }

        }
    } else {
        throw new Error("数据格式错误")
    }
    return raw;
}
/**
 * 获取节点颜色
 * @param {*} nodeType 
 */
export function getColor(nodeType) {
    switch (nodeType) {
        case 'Container':
            return { background: 'LIGHTSALMON', border: 'LIGHTSALMON', highlight: { background: 'Darksalmon', border: 'RED' } };//红色
        case 'Conception':
            return { background: 'MOCCASIN', border: 'MOCCASIN', highlight: { background: 'GOLD', border: 'yellow' } };//黄色
        case 'Connection':
            return { background: 'THISTLE', border: 'THISTLE', highlight: { background: 'VIOLET', border: 'MAGENTA' } };//紫色
        case 'Entity':
            return { background: 'LIGHTGREEN', border: 'LIGHTGREEN', highlight: { background: 'LIMEGREEN', border: 'SEAGREEN' } };//绿色
        case 'Logic':
            return { background: 'SILVER', border: 'SILVER', highlight: { background: 'GRAY', border: 'black' } };//灰色
        case 'Root':
            return { background: 'AQUAMARINE', border: 'AQUAMARINE', highlight: { background: 'DARKTURQUOISE', border: 'CADETBLUE' } };//蓝色
        default:
            return { background: '#F03967', border: '', highlight: { background: 'red', border: 'black' } };
    }
}
export function getArrowsType(edgeType){
    switch(edgeType){
        case 'Inherit':
            return "arrow";
        case 'Derivative':
            return 'circle';
        case 'Composition':
            return 'bar';
        case 'Association':
            return 'arrow';
    }
}
