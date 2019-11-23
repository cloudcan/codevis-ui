import request from '@/utils/request'
/**
 * 查询所有电影
 * @param {*} query 
 */
export function getMovies(query) {
  return request({
    url: '/graph/movies',
    method: 'get',
    params: query
  })
}
/**
 * 获取相关的节点
 * @param {*} query 
 */
export function getRelativeNode(query){
  return request({
    url: '/graph/relative',
    method: 'get',
    params: query
  })
}
/**
 * 查看家庭成员
 * @param {}} query 
 */
export function getFamily(query){
  return request({
    url: '/graph/family',
    method: 'get',
    params: query
  })
}
/**
 * 编辑节点
 * @param {*} data {}
 */
export function editNode(data){
  return request({
    url: '/graph/node/'+data.id,
    method: 'put',
    data: data
  })
}

/**
 * 编辑边
 * @param {*} data {}
 */
export function editEdge(data){
  return request({
    url: '/graph/edge/'+data.id,
    method: 'put',
    data: data
  })
}
/**
 * 添加边
 */
export function addEdge(data){
  return request({
    url: '/graph/edge/',
    method: 'post',
    data: data
  })
}
/**
 * 获取两个节点间的路径
 * @param {*} data 
 */
export function getPath(data){
  return request({
    url: '/graph/path/',
    method: 'get',
    params: data
  })
}
/**
 * 搜索节点
 * @param {*} data 
 */
export function searchNode(data){
  return request({
    url: '/graph/node/',
    method: 'get',
    params: data
  })
}
/**
 * 获取关联节点
 * @param {*} data 
 */
export function getConnection(data){
  return request({
    url: '/graph/connection/',
    method: 'get',
    params: data
  })
}
/**
 * 剪边
 * @param {*} data 
 */
export function deleteEdge(data){
  return request({
    url: '/graph/edge/'+data.id,
    method: 'delete',
  })
}
/**
 * 是否可剪边
 * @param {*} data 
 */
export function canDeleteEdge(data){
  return request({
    url: '/graph/canDeleteEdge',
    method: 'get',
    params:data
  })
}
/**
 * 是否废弃节点
 * @param {*} data 
 */
export function canDropNode(data){
  return request({
    url: '/graph/canDropNode',
    method: 'get',
    params:data
  })
}


