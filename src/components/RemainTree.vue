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
        <el-row>
              <el-tree
                  :props="props"
                  ref="tree"
                  node-key="key"
                  lazy
                  :filter-node-method="filterNode"
                  @node-contextmenu="onContextMenu"
                  :load="loadChildrenNode">
              </el-tree>
        </el-row>
        <!-- 右键菜单 -->
        <context-menu id="context-menu" ref="ctxMenu">
          <li @click="addNode"  v-if="canAdd" class="el-menu-item "><i class="el-icon-plus"></i>新建分类</li>
          <li @click="restoreNode"  v-if="canRestore" class="el-menu-item "><i class="el-icon-check"></i>恢复</li>
          <li @click="deleteNode"     v-if="canDelete" class=" el-menu-item"><i class="el-icon-close"></i>彻底删除</li>
          <li @click="moveNode"     v-if="canMove" class=" el-menu-item "><i class="el-icon-rank"></i>移动</li>
          <li @click="toGraph"      v-if="canGraph" class=" el-menu-item"><i class="el-icon-view"></i>图形</li>
          <li @click="refreshNode"  v-if="canRefresh" class=" el-menu-item"><i class="el-icon-refresh"></i>刷新</li>
        </context-menu>
        <!-- 新建节点对话框 -->
        <el-dialog title="新建分类" :visible.sync="isAddNodeDialogShow" @close="addNodeDialogClose" >
          <el-form ref="addForm" :model="addFormData" label-width="80px" :rules="addFormRules">
              <el-form-item label="名称" prop="name">
                <el-input v-model="addFormData.name"></el-input>
              </el-form-item>
              <!-- <el-form-item label="类型" prop="nodeType">
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
              </el-form-item> -->
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

              <!-- <el-form-item label="建立关联" prop="edgeType">
                <el-radio-group v-model="addFormData.edgeType">
                  <el-radio label="Inherit">继承</el-radio>
                  <el-radio label="Composition">组合</el-radio>
                  <el-radio label="Derivative">衍生</el-radio>
                  <el-radio label="Association" disabled>联系</el-radio>
                </el-radio-group>
              </el-form-item> -->
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
                    :load="loadDustbinNode">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                      <span>{{ data.name }}</span>
                      <span v-if="data.id==currentNode.parent.data.id||node.level==1" class="opreate-tip">
                          {{['父节点','根节点'][data.id==currentNode.parent.data.id?0:1]}}
                      </span>
                      <span v-else class="opreate-tip">
                        <el-button
                          type="text"
                          size="mini"
                          v-popover:movePopover
                          @click.stop="()=>chooseNode(1,data)">
                          移动
                        </el-button>
                      </span>
                   </span>
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
  // getParents,
  // pruningNode,
  moveNode,
  // dropNode,
  linkNode,
  deleteNode,
  restoreNode,
  getPath,
  getDustbinChildren,
  getNotLeafNode
} from "@/api/tree";
import { createKey, addKeyToData, arrayToString } from "@/utils/treeUtils";
import { searchNode } from "@/api/graph";
import contextMenu from "vue-context-menu";
export default {
  name: "tree",
  props: {
    event: "ongraph"
  },
  components: {
    contextMenu
  },
  watch: {},
  data() {
    return {
      filterText: "", //树节点过滤输入文本
      filterText2: "", //树节点过滤输入文本
      currentNode: {}, //当前节点
      defaultRoot: {}, //默认的根节点
      loadingData: false, //加载数据
      resultNodes: [], //查询结果数据
      resultNodes2: [], //搜索结果
      loadingData2: false, //正在加载数据
      props: {
        isLeaf: this.checkLeaf, //检查当前节点是否是叶子节点
        label: "name" //树节点显示属性
      },
      isAddNodeDialogShow: false,
      isChooseNodeDialogShow: false, //是否显示选择节点对话框
      addFormData: {
        name: "",
        nodeType: "Container", //类型默认为容器
        feature: 0, //特征默认为无
        edgeType: "Inherit", //边类型默认为继承
        word_en: "",
        word_zh_CN: "",
        word_ja: "",
        word_ko: "",
        dustbin: true, //添加的节点是垃圾容器
        enable: true,
        parents: [],
        sibling: []
      }, //添加节点数据
      addFormRules: {
        name: [
          { required: true, message: "请输入节点名称", trigger: "blur" },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
        ]
      },
      treeData: [], //树节点数据
      canGraph: true, //是否可以显示
      canRefresh: true //是否可以刷新
    };
  },
  computed: {
    canAdd() {
      let node = this.currentNode;
      return node.data && node.data.dustbin;
    },
    /**
     * 是否可以移动
     */
    canMove() {
      let node = this.currentNode;
      return node.data && !node.data.immutable && !node.data.dustbin;
    },
    /**
     * 是否可以销毁
     */
    canDelete() {
      let node = this.currentNode;
      return node.data && !node.data.immutable;
    },
    /**
     * 是否可以恢复
     */
    canRestore() {
      let node = this.currentNode;
      return node.data && !node.data.immutable && !node.data.dustbin;
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
     * 添加节点对话框关闭时回调
     */
    addNodeDialogClose() {
      this.$refs.addForm.resetFields();
    },
    /**
     * 新增节点
     */
    addNode(e) {
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
      this.$refs.addForm.validate(valid => {
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
     * 移动节点
     */
    moveNode() {
      this.isChooseNodeDialogShow = true;
    },
    /**
     * 加载子节点
     */
    loadChildrenNode(node, resolve) {
      if (node.level === 0) {
        //获取根节点
        getRoot({ treeType: 1 }).then(data => {
          resolve(addKeyToData(data, 0));
        });
      } else {
        getChildren({
          nodeId: node.data.id
        }).then(data => {
          let d = addKeyToData(data, node.data.key);
          if (node.level === 1) {
            this.defaultRoot = d.find(ele => ele.name == "未整理");
          }
          resolve(d);
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
    onContextMenu(event, nodeData, node, components) {
      let _this = this;
      this.currentNode = node;
      if (nodeData.id) {
        this.$refs.ctxMenu.open(event);
      }
      event.preventDefault();
    },
    /**
     * 过滤节点
     */
    filterNode(value, data) {
      if (!value) return true;
      return data.id == value;
    },
    /**
     * 图形显示
     */
    toGraph(e) {
      if (this.currentNode.data.id) {
        //触发ongraph事件 此事件由 Layout处理
        this.$emit("ongraph", this.currentNode);
      }
    },
    /**
     * 删除节点
     */
    deleteNode() {
      let nodeData = this.currentNode.data;
      let _this = this;
      _this
        .$confirm(
          "此操作将永久删除`" + nodeData.name + "`, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
        .then(() => {
          deleteNode({
            nodeId: nodeData.id
          }).then(data => {
            _this.$message({
              type: "success",
              message: "操作成功!"
            });
            _this.$refs.tree.remove(_this.currentNode);
          });
        })
        .catch(() => {
          _this.$message({
            type: "info",
            message: "已取消操作!"
          });
        });
    },
    /**
     * 还原节点
     */
    restoreNode() {
      let _this = this;
      let nodeData = this.currentNode.data;
      restoreNode({ nodeId: nodeData.id }).then(data => {
        _this.$message({
          type: "info",
          message: "操作成功!"
        });
        _this.$refs.tree.remove(_this.currentNode.key);
        // _this.refreshNodeByKey(_this.currentNode.parent.key);
      });
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
     * 回收节点
     */
    recycleNode(node) {
      let tree = this.$refs.tree;
      let root = tree.getNode(this.defaultRoot.key);
      if (root) {
        node.key=createKey(node.id,root.key);
        tree.append(node, root);
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
          if (result.data.id != nodeId) {
            result.expanded = true;
          } else {
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
          if (result.data.key != key) {
            result.expanded = true;
          } else {
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
                  tNode.key = createKey(tNode.id, pKey);
                  //不考虑根节点
                  if (i != 0) {
                    //找不到节点
                    if (!traverseFindKey(store.root, tNode.key)) {
                      console.log("添加节点：" + tNode.key + "," + tNode.name);
                      tree.append(tNode, pNode ? pNode.key : store.root);
                    }
                  }
                  if (i != path.length - 1) {
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
      searchNode({ name: query, remain: true }).then(data => {
        this.resultNodes = data;
      });
    },
    /**
     * 判断当前节点是否是叶子节点
     */
    checkLeaf(data, node) {
      if (node.level == 0) {
        return false;
      }
      getNotLeafNode({
        nodeIds: arrayToString([data.id])
      }).then(data => {
        node.isLeaf = data.length == 0;
      });
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
          if (result.data.id != nodeId) {
            result.expanded = true;
          } else {
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
          if (result.data.key != key) {
            result.expanded = true;
          } else {
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

                // eslint disable no-console check
                console.log("第" + x++ + "条路径", path);
                for (let i = 0; i < path.length; i++) {
                  let tNode = path[i];
                  let pNode = i > 0 ? path[i - 1] : null;
                  let pKey = pNode ? pNode.key : 0;
                  //创建key
                  tNode.key = createKey(tNode.id, pKey);
                  //不考虑根节点
                  if (i != 0) {
                    //找不到节点
                    if (!traverseFindKey(store.root, tNode.key)) {
                      console.log("添加节点：" + tNode.key + "," + tNode.name);
                      tree.append(tNode, pNode ? pNode.key : store.root);
                    }
                  }
                  if (i != path.length - 1) {
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
    searchNode2(query) {
      searchNode({ name: query,remain:true,dustbin:true }).then(data => {
        this.resultNodes2 = data;
      });
    },
    /**
     * 加载垃圾容器
     */
    loadDustbinNode(node, resolve) {
      if (node.level === 0) {
        //获取根节点
        getRoot({ treeType: 1 }).then(data => {
          resolve(addKeyToData(data, 0));
        });
      } else {
        getDustbinChildren({
          nodeId: node.data.id
        }).then(data => {
          let d = addKeyToData(data, node.data.key);
          resolve(d);
        });
      }
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
              edgeType: "Inherit",
              originalParentId: _this.currentNode.parent.data.id
            })
              .then(data => {
                _this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                _this.isChooseNodeDialogShow = false;
                _this.$refs.tree.remove(_this.currentNode.key);
                //_this.refreshNodeByKey(_this.currentNode.parent.key);
              })
              .catch(e => {
                // es-lint disable no-console check
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
      }
    },
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
.opreate-tip {
  margin-left: 10px;
}
</style>


