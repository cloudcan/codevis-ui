<template>
    <div>
      <!-- 节点名称过滤输入框 -->
        <el-row style="padding:10px">
          <el-select
            style="width:100%"
            v-model="filterText"
            filterable
            clearable
            remote
            @change="focusNode"
            reserve-keyword
            placeholder="请输入关键词过滤"
            :remote-method="searchNode"
            :loading="loadingData">
            <el-option
              v-for="node in resultNodes"
              :key="node.id"
              :label="node.name"
              :value="node.id">
            </el-option>
          </el-select>
        </el-row>
        <!-- 主树 -->
        <el-row >
              <el-tree
                  :props="props"
                  ref="tree"
                  node-key="key"
                  :highlight-current="true"
                  :render-after-expand="false"
                  lazy
                  @node-expand="onNodeExpand"
                  :filter-node-method="filterNode"
                  @node-contextmenu="onContextMenu"
                  :load="loadChildrenNode">
              </el-tree>
        </el-row>
        <!-- 右键菜单 -->
        <context-menu id="context-menu" ref="ctxMenu">
          <li @click="addNode"      v-if="canAdd" class="el-menu-item "><i class="el-icon-plus"></i>新增</li>
          <li @click="moveNode"     v-if="canMove" class=" el-menu-item "><i class="el-icon-rank"></i>移动</li>
          <li @click="linkNode"     v-if="canLink" class=" el-menu-item"><i class="el-icon-share"></i>链接</li>
          <li @click="dropNode"     v-if="canDrop" class=" el-menu-item"><i class="el-icon-delete"></i>删除</li>
          <li @click="pruningNode"  v-if="canPruning" class=" el-menu-item"><i class="el-icon-minus"></i>剪边</li>
          <li @click="toGraph"      v-if="canGraph" class=" el-menu-item"><i class="el-icon-view"></i>图形</li>
          <li @click="refreshNode"  v-if="canRefresh" class=" el-menu-item"><i class="el-icon-refresh"></i>刷新</li>
        </context-menu>
        <!-- 新建节点对话框 -->
        <el-dialog title="新建节点" :visible.sync="isAddNodeDialogShow" @close="addNodeDialogClose" >
          <el-form ref="addForm" :model="addFormData" label-width="80px" :rules="addFormRules">
              <el-form-item label="名称" prop="name">
                <el-input v-model="addFormData.name"></el-input>
              </el-form-item>
              <el-form-item label="类型" prop="nodeType">
                <el-radio-group v-model="addFormData.nodeType">
                  <el-radio label="Container">容器</el-radio>
                  <el-radio label="Entity" >实体</el-radio>
                  <el-radio label="Conception" >概念</el-radio>
                  <el-radio label="Logic" >逻辑</el-radio>
                  <el-radio label="Connection" >关联</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="特征" prop="feature">
                <el-radio-group v-model="addFormData.feature">
                  <el-radio-button :label="0">无</el-radio-button>
                  <el-radio-button :label="1">阻挡</el-radio-button>
                  <el-radio-button :label="2">穿透</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="家庭成员">
                <el-col :span="3" class="col-label">
                  <label >双亲</label>
                </el-col>
                <el-col :span="5">
                  <el-input :value="addFormData.parents.length" readonly v-popover:parentsPopover></el-input>
                </el-col>
                <el-popover
                  ref="parentsPopover"
                  placement="bottom"
                  width="200"
                  trigger="hover">
                  <div slot>
                    <el-tag
                      v-for="node in addFormData.parents"
                      :key="node.id"
                      style="margin:3px"
                      type="success">
                      {{node.name}}
                    </el-tag>
                    <span v-if="addFormData.parents.length==0">该节点没有双亲</span>
                  </div>
                </el-popover>
                <el-col :span="3" class="col-label">
                  <label>兄弟</label>
                </el-col>
                <el-col :span="5">
                  <el-input :value="addFormData.sibling.length" readonly v-popover:siblingPopover></el-input>
                </el-col>
                <el-popover
                  ref="siblingPopover"
                  placement="bottom"
                  width="200"
                  trigger="hover">
                  <div slot>
                      <el-tag
                      v-for="node in addFormData.sibling"
                      :key="node.id"
                      style="margin:3px"
                      type="success">
                      {{node.name}}
                    </el-tag>
                    <span v-if="addFormData.sibling.length==0">该节点没有兄弟姐妹</span>
                  </div>
                </el-popover>
              </el-form-item>

              <el-form-item label="建立关联" prop="edgeType">
                <el-radio-group v-model="addFormData.edgeType">
                  <el-radio label="Inherit">继承</el-radio>
                  <el-radio label="Composition">组合</el-radio>
                  <el-radio label="Derivative">衍生</el-radio>
                  <el-radio label="Association" disabled>联系</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="单词" prop="word_en">
                <el-col :span="18">
                  <el-input v-model="addFormData.word_en"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">En</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="word_zh_CN">
                <el-col :span="18">
                  <el-input v-model="addFormData.word_zh_CN"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">中文</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="word_ja">
                <el-col :span="18">
                  <el-input v-model="addFormData.word_ja"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">日本语</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="word_ko">
                <el-col :span="18">
                  <el-input v-model="addFormData.word_ko"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">한국어</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="启用" prop="enable">
                <el-switch v-model="addFormData.enable"></el-switch>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addSubmit">立即创建</el-button>
                <el-button @click="isAddNodeDialogShow=false">取消</el-button>
              </el-form-item>
            </el-form>
        </el-dialog>
        <!-- 选择节点对话框 -->
        <el-dialog title="选择目标节点" :visible.sync="isChooseNodeDialogShow" >
          <el-row style="padding:10px">
            <el-radio-group v-model="selectedEdgeType">
                  <el-radio label="Inherit">继承</el-radio>
                  <el-radio label="Composition">组合</el-radio>
                  <el-radio label="Derivative">衍生</el-radio>
                  <el-radio label="Association" disabled>联系</el-radio>
            </el-radio-group>
          </el-row>
          <el-row style="padding:10px">
              <el-select
            style="width:100%"
            v-model="filterText2"
            filterable
            clearable
            remote
            @change="focusNode2"
            reserve-keyword
            placeholder="请输入关键词过滤"
            :remote-method="searchNode2"
            :loading="loadingData2">
            <el-option
              v-for="node in resultNodes2"
              :key="node.id"
              :label="node.name"
              :value="node.id">
            </el-option>
          </el-select>
          </el-row>
          <!-- 选择树 -->
          <el-row >
                <el-tree
                    :props="props"
                    ref="chooseTree"
                    node-key="key"
                    lazy
                    :filter-node-method="filterNode"
                    :load="loadChildrenNode">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                      <span>{{ data.name }}</span>
                      <span v-if="data.id==currentNode.data.id||data.id==currentNode.parent.data.id||node.level==1" class="opreate-tip">
                          {{['当前节点','父节点','根节点'][data.id==currentNode.data.id?0:(node.level!=1?1:2)]}}
                      </span>
                      <span v-else class="opreate-tip">
                        <el-button
                          type="text"
                          size="mini"
                          v-popover:movePopover
                          @click.stop="()=>chooseNode(1,data)">
                          移动
                        </el-button>
                        <el-button
                          type="text"
                          size="mini"
                          v-popover:movePopover
                          :disabled="data.id==currentNode.data.id||data.id==currentNode.parent.data.id"
                          @click.stop="()=>chooseNode(2,data)">
                          链接
                        </el-button>
                      </span>
                   </span>
                   <!-- <el-popover
                          ref="movePopover"
                          placement="top"
                          trigger="click"
                          v-model="isMovePopoverShow"
                          width="160">
                          <p>确定将节点{{currentNode.name}}移动到此节点下吗？</p>
                          <div style="text-align: right; margin: 0">
                            <el-button size="mini" type="text" @click="isMovePopoverShow = false">取消</el-button>
                            <el-button type="primary" size="mini" @click="isMovePopoverShow = false">确定</el-button>
                          </div>
                    </el-popover> -->
                </el-tree>
          </el-row>
        </el-dialog>
    </div>
</template>
<script>
import {
  getRoot,
  getChildren,
  addNode,
  getParents,
  pruningNode,
  moveNode,
  dropNode,
  linkNode,
  getPath,
  getNotLeafNode,
} from "@/api/tree";
import { searchNode,canDropNode } from "@/api/graph";
import { createKey, addKeyToData,arrayToString } from "@/utils/treeUtils";
import contextMenu from "vue-context-menu";
export default {
  name: "tree",
  props: {
    // events: ["ongraph", "ondrop", "onmove", "onpruning"]
  },
  components: {
    contextMenu
  },
  data() {
    return {
      filterText: "", //树节点过滤输入文本
      filterText2: "", //树节点过滤输入文本
      loadingData: false, //正在加载数据
      loadingData2: false, //正在加载数据
      resultNodes: [], //搜索结果
      resultNodes2: [], //搜索结果
      currentNode: {}, //当前节点
      // selectedNode: {}, //被选中的节点
      pNodeType: "", //
      selectedEdgeType: "Inherit", //被选中的关系类型
      isAddNodeDialogShow: false, //是否显示添加节点对话框
      isChooseNodeDialogShow: false, //是否显示选择节点对话框
      isMovePopoverShow: false, //是否显示移动确认弹出框
      props: {
        isLeaf:this.checkLeaf,//检查当前节点是否是叶子节点
        label: "name" //树节点显示属性
      },
      treeData: [], //树节点数据
      addFormData: {
        name:'',
        nodeType: "Container", //类型默认为容器
        feature: 0, //特征默认为无
        edgeType: "Inherit", //边类型默认为继承
        word_en:'',
        word_zh_CN:'',
        word_ja:'',
        word_ko:'',
        enable: true,
        parents: [],
        sibling: []
      } ,//添加节点数据
      addFormRules:{
        name: [
            { required: true, message: '请输入节点名称', trigger: 'blur' },
            { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
      }
    };
  },
  computed: {
    /**
     * 是否可以添加子节点
     */
    canAdd() {
      let node = this.currentNode;
      return node.data && node.data.nodeType != "Root";
    },
    /**
     * 是否可以刷新
     */
    canRefresh() {
      return true;
    },
    /**
     * 是否可以图形化显示
     */
    canGraph() {
      return true;
    },
    /**
     * 是否可以移动
     */
    canMove() {
      let node = this.currentNode;
      return node.data && !node.data.immutable;
    },
    /**
     * 是否可以建立关系
     */
    canLink() {
      let node = this.currentNode;
      return node.data && !node.data.immutable;
    }
  },
  asyncComputed: {
    /**
     * 是否可删除
     */
    canDrop() {
      let node = this.currentNode;
      // let _this = this;
      if (node.data && node.data.id&&!node.data.immutable) {
        return canDropNode({
          id: node.data.id
        }).then(data => !!data);
      } else {
        return false;
      }
    },
    /**
     * 是否可剪边
     */
    canPruning() {
      let node = this.currentNode;
      let _this = this;
      if (node.data && node.data.id&&!node.data.immutable) {
        return getParents({ nodeId: node.data.id }).then(
          data => Array.isArray(data) && data.length > 1
        );
      } else {
        return false;
      }
    }
  },
  methods: {
    /**
     * 组件初始化方法
     */
    init() {
      this.initLoad();
    },
    /**
     * 加载子节点
     */
    loadChildrenNode(node, resolve) {
      let nlevel = node.level;
      if (nlevel === 0) {
        //获取根节点
        getRoot({ treeType: 0 }).then(data => {
          resolve(addKeyToData(data, 0));
        });
      } else {
        getChildren({
          nodeId: node.data.id
        }).then(data => {
          resolve(addKeyToData(data, node.data.key));
        });
      }
    },
    /**
     * 初始化加载
     */
    initLoad() {},
    /**
     * 右键事件菜单
     */
    onContextMenu(event, nodeData, node) {
      let _this = this;
      if (node.data) {
        _this.currentNode = node;
      }
      _this.$refs.ctxMenu.open(event);
      event.preventDefault();
    },
    /**
     * 过滤节点
     */
    filterNode(value, data) {
      console.log(data.name);
      if (!value) return true;
      return data.id == value;
    },
    /**
     * 新增节点
     */
    addNode() {
      let pNode = this.currentNode.data;
      let _this = this;
      //已选中节点
      if (pNode.id) {
        let params = {
          nodeId: pNode.id,
          nodeType: pNode.nodeType
        };
        getChildren(params).then(data => {
          _this.addFormData.parentId = pNode.id;
          _this.addFormData.parents = [pNode];
          _this.addFormData.sibling = Array.isArray(data) ? data : [];
          _this.isAddNodeDialogShow = true;
        });
      }
    },
    /**
     * 新增提交
     */
    addSubmit() {
      //表单验证
      this.$refs.addForm.validate((valid) => {
          if (valid) {
            let params = this.addFormData;
            addNode(params).then(data => {
              this.$message({
                message: "节点添加成功!",
                type: "success"
              });
              data.key = createKey(data.id, this.currentNode.parent.data.key);
              this.$refs.tree.append(data, this.currentNode);
              this.isAddNodeDialogShow = false;
            });
          } else {
            return false;
          }
      });
    },
    /**
     * 添加节点对话框关闭时回调
     */
    addNodeDialogClose() {
      this.$refs.addForm.resetFields();
    },
    /**
     * 图形显示
     */
    toGraph() {
      if (this.currentNode.data) {
        //触发ongraph事件 此事件由 Layout处理
        this.$emit("ongraph", this.currentNode);
      }
    },
    /**
     * 移动节点
     */
    moveNode() {
      this.isChooseNodeDialogShow = true;
    },
    /**
     * 删除节点
     */
    dropNode() {
      let _this = this;
      let node = _this.currentNode;
      let nodeData = _this.currentNode.data;
      if (nodeData.id) {
        // let parent = node.parent.data;
        this.$confirm("此操作将删除`" + nodeData.name + ", 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            let params = {
              nodeId: nodeData.id
            };
            dropNode(params).then(() => {
              //将树中相同的数据节点全部移除
              _this.removeNodeById(nodeData.id);
              //_this.$refs.tree.remove(node);
              _this.$emit("ondrop", nodeData);
              _this.$message({
                type: "success",
                message: "操作成功"
              });
            });
          })
          .catch(() => {
            _this.$message({
              type: "info",
              message: "已取消操作"
            });
          });
      }
    },
    /**
     * 将树中指定ID的节点移除
     */
    removeNodeById(id){
      let tree=this.$refs.tree;
      tree.store._getAllNodes().forEach(node=>{
          if(node.data&&node.data.id==id){
            tree.remove(node.data);
          }
      });
    },
    /**
     * 剪边
     */
    pruningNode() {
      let _this = this;
      let currentNode = _this.currentNode.data;
      if (currentNode) {
        let parent = _this.currentNode.parent.data;
        this.$confirm(
          "此操作将剪断`" +
            currentNode.name +
            "`与`" +
            parent.name +
            "`的关系, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            let params = {
              nodeId: currentNode.id,
              parentId: parent.id
            };
            pruningNode(params).then(data => {
              _this.$refs.tree.remove(_this.currentNode);
              _this.$emit("onpruning", params);
              _this.$message({
                type: "success",
                message: "操作成功"
              });
            });
          })
          .catch(() => {
            _this.$message({
              type: "info",
              message: "已取消操作"
            });
          });
      }
    },
    /**
     * 建立关联
     */
    linkNode() {
      this.isChooseNodeDialogShow = true;
    },
    /**
     * 刷新节点
     */
    refreshNode() {
      this.refreshNodeByKey(this.currentNode.key);
    },
    /**
     * 刷新指定key的节点
     */
    refreshNodeByKey(key) {
      let _this = this;
      let tree = _this.$refs.tree;
      let node = tree.getNode(key);
      getChildren({ nodeId: node.data.id }).then(data => {
        if(data!=null&&Array.isArray(data)){
          tree.updateKeyChildren(key, addKeyToData(data, key));
        }
      });
    },
    /**
     * 刷新指定id的节点
     */
    refreshNodeById(id){
      let tree=this.$refs.tree;
      tree.store._getAllNodes().forEach(node=>{
          if(node.data&&node.data.id==id){
            getChildren({
              nodeId: node.data.id
            }).then(data => {
              if(data!=null&&Array.isArray(data)){
                tree.updateKeyChildren(key, addKeyToData(data, node.data.key));
              }
            });
          }
      });
    },
    /**
     * 选择节点操作
     * type:操作类型 1：移动 2：链接
     * data:选择的节点
     */
    chooseNode(type, pData) {
      let _this = this;
      let nodeData = _this.currentNode.data;
      if (type === 1) {
        _this
          .$confirm(
            "此操作将移动`" +
              nodeData.name +
              "`到`" +
              pData.name +
              "`, 是否继续?",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          )
          .then(() => {
            moveNode({
              nodeId: nodeData.id,
              parentId: pData.id,
              edgeType: _this.selectedEdgeType,
              originalParentId: _this.currentNode.parent.data.id
            })
              .then(_ => {
                _this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                _this.isChooseNodeDialogShow = false;
                _this.$refs.tree.remove(_this.currentNode.key);
                // _this.refreshNodeByKey(_this.currentNode.parent.key);
              })
              .catch(e => {
                console.log(e);
              });
          })
          .catch(e => {
            console.log(e);
            _this.$message({
              type: "info",
              message: "已取消操作!"
            });
          });
      } else if (type === 2) {
        _this
          .$confirm(
            "此操作将链接`" +
              nodeData.name +
              "`到`" +
              pData.name +
              "`, 是否继续?",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          )
          .then(() => {
            linkNode({
              nodeId: nodeData.id,
              parentId: pData.id,
              edgeType: _this.selectedEdgeType
            }).then(data => {
              _this.$message({
                type: "success",
                message: "操作成功!"
              });
              _this.isChooseNodeDialogShow = false;
            });
          })
          .catch(() => {
            _this.$message({
              type: "info",
              message: "已取消操作!"
            });
          });
      }
    },
    /**
     * 定位到节点
     */
    focusNode(nId) {
      let tree = this.$refs.tree;
      let store = tree.store;
      if (!nId || nId == "") {
        tree.filter("");
        return;
      }
      if (!this.filterText || this.filterText == "") {
        this.filterText = nId;
      }
      let rootId = store.root.childNodes[0].data.id;
      //遍历所有节点查找指定nodeId
      function traverseFindId(node, nodeId) {
        let childNodes = node.root ? node.root.childNodes : node.childNodes;
        let result = childNodes.find(
          ele => (ele.data.id == nodeId ? true : traverseFindId(ele, nodeId))
        );
        //展开路径上的所有父节点
        if (result) {
          if(result.data.id!=nodeId){
            result.expanded = true;
          }else{
            result.expanded = false;
          }
        }
        return result;
      }
      //遍历所有节点查找指定key
      function traverseFindKey(node, key) {
        let childNodes = node.root ? node.root.childNodes : node.childNodes;
        let result = childNodes.find(
          ele => (ele.data.key == key ? true : traverseFindKey(ele, key))
        );
        //展开路径上的所有父节点
        if (result) {
          if(result.data.key!=key){
            result.expanded = true;
          }else{
            result.expanded = false;
          }
        }
        return result;
      }
      if (traverseFindId(store.root, nId)) {
        //当前树的数据中包含此节点
        tree.filter(nId);
      } else {
        let params = {
          from: nId,
          to: rootId
        };
        console.log(store);
        getPath(params).then(data => {
          if (Array.isArray(data)) {
            var x = 1;
            data.forEach(path => {
              if (Array.isArray(path)) {
                console.log("第" + x++ + "条路径", path);
                for (let i = 0; i < path.length; i++) {
                  let tNode = path[i];
                  let pNode = i > 0 ? path[i - 1] : null;
                  let pKey = pNode ? pNode.key : 0;
                  //创建key
                  tNode.key = createKey(tNode.id,pKey);
                  //不考虑根节点
                  if (i != 0) {
                    //找不到节点
                    if (!traverseFindKey(store.root, tNode.key)) {
                      console.log("添加节点：" + tNode.key + "," + tNode.name);
                      tree.append(tNode, pNode ? pNode.key : store.root);
                    }
                  }
                  if(i!=path.length-1){
                    //展开路径上的所有父级节点
                    tree.getNode(tNode.key).expanded = true;
                  }
                }
              }
            });
          }
          tree.filter(nId);
        });
      }
    },
    focusNode2(nId) {
      let tree = this.$refs.chooseTree;
      let store = tree.store;
      if (!nId || nId == "") {
        tree.filter("");
        return;
      }
      if (!this.filterText2 || this.filterText2 == "") {
        this.filterText2 = nId;
      }
      let rootId = store.root.childNodes[0].data.id;
      //遍历所有节点查找指定nodeId
      function traverseFindId(node, nodeId) {
        let childNodes = node.root ? node.root.childNodes : node.childNodes;
        let result = childNodes.find(
          ele => (ele.data.id == nodeId ? true : traverseFindId(ele, nodeId))
        );
        //展开路径上的所有父节点
        if (result) {
          if(result.data.id!=nodeId){
            result.expanded = true;
          }else{
            result.expanded = false;
          }
        }
        return result;
      }
      //遍历所有节点查找指定key
      function traverseFindKey(node, key) {
        let childNodes = node.root ? node.root.childNodes : node.childNodes;
        let result = childNodes.find(
          ele => (ele.data.key == key ? true : traverseFindKey(ele, key))
        );
        //展开路径上的所有父节点
        if (result) {
          if(result.data.key!=key){
            result.expanded = true;
          }else{
            result.expanded = false;
          }
        }
        return result;
      }
      if (traverseFindId(store.root, nId)) {
        //当前树的数据中包含此节点
        tree.filter(nId);
      } else {
        let params = {
          from: nId,
          to: rootId
        };
        console.log(store);
        getPath(params).then(data => {
          if (Array.isArray(data)) {
            var x = 1;
            data.forEach(path => {
              if (Array.isArray(path)) {
                console.log("第" + x++ + "条路径", path);
                for (let i = 0; i < path.length; i++) {
                  let tNode = path[i];
                  let pNode = i > 0 ? path[i - 1] : null;
                  let pKey = pNode ? pNode.key : 0;
                  //创建key
                  tNode.key = createKey(tNode.id,pKey);
                  //不考虑根节点
                  if (i != 0) {
                    //找不到节点
                    if (!traverseFindKey(store.root, tNode.key)) {
                      console.log("添加节点：" + tNode.key + "," + tNode.name);
                      tree.append(tNode, pNode ? pNode.key : store.root);
                    }
                  }
                  if(i!=path.length-1){
                    //展开路径上的所有父级节点
                    tree.getNode(tNode.key).expanded = true;
                  }
                }
              }
            });
          }
          tree.filter(nId);
        });
      }
    },
    /**
     * 搜索节点
     */
    searchNode(query) {
      searchNode({ name: query }).then(data => {
        this.resultNodes = data;
      });
    },
    /**
     * 搜索节点
     */
    searchNode2(query) {
      searchNode({ name: query }).then(data => {
        this.resultNodes2 = data;
      });
    },
    /**
     * 添加树节点数据
     */
    addTreeData(data) {
      let tree = this.$refs.tree;
    },
    /**
     * 节点收拢
     */
    // onNodeCollapse(data, node, component) {
    // },
    /**
     * 节点展开
     */
    // onNodeExpand(data, node, component){
    // },
    /**
     * 判断当前节点是否是叶子节点
     */
    checkLeaf(data,node){
      if(node.level==0){
        return false;
      }
      getNotLeafNode({
        nodeIds:arrayToString([data.id])
      }).then(data=>{
        node.isLeaf=data.length==0
      });
    }
  },
  /**
   * 加载组件时调用
   */
  mounted() {
    this.init();
  }
};
</script>

<style scoped>
.col-label {
  text-align: right;
  padding: 0 5px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: 0 8px;
}
.opreate-tip{
  margin-left: 10px;
}
</style>


