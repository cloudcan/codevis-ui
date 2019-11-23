import { error } from "util";
import { DataSet } from 'vis';
export function adaptMovie(data) {
    if (Array.isArray(data)) {
        var nodes = [];
        var edges = [];
        data.forEach(ele => {
            nodes.push({
                id: ele.id,
                label: ele.title,
                color: 'red',
                data: ele
            });
            //存在关系
            if (ele.roles) {
                ele.roles.forEach(role => {
                    var person = role.person;
                    nodes.push({
                        id: person.id,
                        label: person.name,
                        color: 'blue',
                        data: person
                    });
                    edges.push({
                        id: role.id,
                        from: person.id,
                        to: ele.id,
                        label: '参演',
                        data: role
                    });
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
 * 数据去重
 */
export function dataFilter(data) {
    if (Array.isArray(data)) {
        let r = [];
        data.forEach(ele => {
            if (notInArray(ele, r)) {
                r.push(ele);
            } else {
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
                    console.log("id:" + nn.id + "已经存在！");
                }
            });
            edges.forEach(ee => {
                if (notInArray(ee, e)) {
                    e.push(ee);
                } else {
                    console.log("id:" + nn.id + "已经存在！");
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
                    console.log("id:" + ele.id + "已经存在！");
                }
            });
        } else {
            if (notInArray(add, raw)) {
                raw.push(add);
            } else {
                console.log("id:" + add.id + "已经存在！");
            }
        }
    } else if (raw instanceof DataSet) {
        if (Array.isArray(add)) {
            add.forEach(ele => {
                try {
                    raw.add(ele);
                } catch (error) {
                    console.log("id:" + ele.id +"已经存在！");
                }

            });
        } else {
            try {
                raw.add(add);
            } catch (error) {
                console.log("id:" + add.id+"已经存在！");
            }

        }
    } else {
        throw new Error("数据格式错误")
    }
    return raw;
}
