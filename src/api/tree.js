import request from '@/utils/request'
/**
 * 
 * @param {*} query 查询条件：节点类型 {treeType:0|1} 0：主节点 1：垃圾节点
 */
export function getRoot(query) {
  return request({
    url: '/tree/root',
    method: 'get',
    params: query
  });
}
/**
 * 获取子节点
 * @param {*} query 查询条件：nodeId
 */
export function getChildren(query) {
  return request({
    url: '/tree/children',
    method: 'get',
    params: query
  });
}
/**
 * 获取垃圾容器
 * @param {*} query 查询条件：nodeId
 */
export function getDustbinChildren(query) {
  return request({
    url: '/tree/dustbinChildren',
    method: 'get',
    params: query
  });
}
/**
 * 获取父节点
 * @param {}} query 
 */
export function getParents(query) {
  return request({
    url: '/tree/parents',
    method: 'get',
    params: query
  });
}
/**
 * 添加节点数据
 * @param node 节点数据
 */
export function addNode(node) {
  return request({
    url: '/tree/node/',
    method: 'post',
    data: node
  });
}
/**
 * 节点剪枝
 * @param {*} data  {nodeId:子节点ID parentId:父节点ID}
 */
export function pruningNode(params){
  return request({
    url: '/tree/pruning/'+params.parentId+'/to/'+params.nodeId,
    method: 'put',
  })
}
/**
 * 节点关联
 * @param {*} data  {nodeId:子节点ID parentId:父节点ID edgeType:关系类型}
 */
export function linkNode(data){
  return request({
    url: '/tree/link/'+data.parentId+'/'+data.edgeType+'/'+data.nodeId,
    method: 'put',
  })
}
/**
 * 节点移动
 * @param {*} data  {originalParentId :原来的父节点 nodeId:子节点ID parentId:父节点ID edgeType:关系类型}
 */
export function moveNode(data){
  return request({
    url: '/tree/pruning/'+data.originalParentId+'/to/'+data.nodeId+'/link/'+data.parentId+'/'+data.edgeType,
    method: 'put',
  })
}
/**
 * 节点删除(可恢复)
 * @param {*} data  {nodeId:节点ID}
 */
export function dropNode(data){
  return request({
    url: '/tree/drop/'+data.nodeId,
    method: 'delete',
  })
}

/**
 * 节点删除
 * @param {*} data  {nodeId:节点ID}
 */
export function deleteNode(data){
  return request({
    url: '/tree/node/'+data.nodeId,
    method: 'delete',
  })
}

/**
 * 节点还原
 * @param {*} data  {nodeId:节点ID}
 */
export function restoreNode(data){
  return request({
    url: '/tree/restore/'+data.nodeId,
    method: 'put',
  })
}

/**
 * 获取两个节点间的路径
 * @param {*} data 
 */
export function getPath(data){
  return request({
    url: '/tree/path',
    method: 'get',
    params: data
  })
}
/**
 * 得到给定节点中的非叶子节点
 * @param {*} data 
 */
export function getNotLeafNode(data){
  return request({
    url: '/tree/getNotLeafNode',
    method: 'get',
    params: data
  })
}
