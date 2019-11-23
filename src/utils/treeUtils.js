/**
 * 创建key
 * @param nId 节点数据ID
 * @param pId 父节点key
 */
export function createKey(nId,pKey) {
    return pKey+'-'+nId;
}
/**
 * 将数据中添加key
 * @param {}} data 
 */
export function addKeyToData(data,pKey) {
    if (Array.isArray(data)) {
        var r = [];
        data.forEach(ele => {
            ele.key=createKey(ele.id,pKey);
            r.push(ele);
        });
        return r;
    }else{
        throw new Error("不合法的参数！");
    }
}
/**
 * 将数组转化成string a,b,c
 */
export function arrayToString(arr){
    let arrStr='';
    if(Array.isArray(arr)){
        arr.forEach(ele=>{
            arrStr+=ele+',';
        });
    }
    return arrStr.endsWith(',')?arrStr.substring(0,arrStr.length-1):'';
}