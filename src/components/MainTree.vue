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
        reserve-keyword
        placeholder="请输入关键词过滤"
        :loading="loadingData"
      >
        <el-option v-for="node in resultNodes" :key="node.id" :label="node.name" :value="node.id"></el-option>
      </el-select>
    </el-row>
    <!-- 主树 -->
    <el-row>
      <el-tree
        :props="props"
        ref="tree"
        node-key="uuid"
        :highlight-current="true"
        :render-after-expand="false"
        lazy
        @node-contextmenu="onContextMenu"
        :filter-node-method="filterNode"
        :load="loadChildrenNode"
      ></el-tree>
    </el-row>
    <!-- 右键菜单 -->
    <context-menu id="context-menu" ref="ctxMenu">
      <li @click="toGraph" v-if="canGraph" class="el-menu-item">
        <i class="el-icon-view"></i>图形
      </li>
      <li @click="refreshNode" v-if="canRefresh" class="el-menu-item">
        <i class="el-icon-refresh"></i>刷新
      </li>
    </context-menu>
  </div>
</template>
<script>
import { getRoot, getChildren, getNode } from "@/api";
import contextMenu from "vue-context-menu";
export default {
  name: "tree",
  components: {
    contextMenu
  },
  data() {
    return {
      filterText: "", //树节点过滤输入文本
      loadingData: false, //正在加载数据
      currentNode: {}, //当前被选中的节点
      resultNodes: [],
      props: {
        isLeaf: this.checkLeaf, //检查当前节点是否是叶子节点
        label: "name" //树节点显示属性
      }
    };
  },
  computed: {},
  methods: {
    /**
     * 组件初始化方法
     */
    init() {
      this.initLoad();
    },
    checkLeaf(data, node) {
      return data.leaf || false;
    },
    /**
     * 加载子节点
     */
    async loadChildrenNode(node, resolve) {
      let nlevel = node.level;
      if (nlevel === 0) {
        resolve([
          {
            id: 0,
            name: "All Programs",
            uuid: "0000",
            label: "Container",
            children: "Program"
          }
        ]);
      } else if (nlevel === 1) {
        //获取根节点
        let data = await getRoot();
        resolve(data.map(n => Object.assign(n, { label: "Program" })));
      } else if (nlevel === 2) {
        let rid = node.data.id;
        resolve([
          {
            id: 1,
            name: "File",
            children: "File",
            uuid: "2221",
            label: "Container",
            rid
          },
          {
            id: 2,
            name: "Package",
            children: "Package",
            uuid: "2222",
            label: "Container",
            rid
          },
          {
            id: 3,
            name: "Const",
            children: "Const",
            uuid: "2223",
            label: "Container",
            rid
          },
          {
            id: 4,
            name: "Global",
            children: "Global",
            uuid: "2224",
            label: "Container",
            rid
          },
          {
            id: 5,
            name: "Type",
            children: "Type",
            uuid: "2225",
            label: "Container",
            rid
          },
          {
            id: 6,
            name: "Function",
            children: "Function",
            uuid: "2226",
            label: "Container",
            rid
          }
        ]);
      } else {
        let r = await getNode(node.data.rid, node.data.children);
        resolve(r.map(n => Object.assign(n, { leaf: true })));
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
      if (nodeData) {
        _this.currentNode = nodeData;
      }
      _this.$refs.ctxMenu.open(event);
      event.preventDefault();
    },
    canGraph() {},
    canRefresh() {},
    toGraph(node) {
      console.log(node)
      if (node.level == 0) {
        return;
      }
      this.$emit("on-graph", this.currentNode);
    },
    refreshNode() {},
    /**
     * 过滤节点
     */
    filterNode(value, data) {
      console.log(data.name);
      if (!value) return true;
      return data.id == value;
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
.opreate-tip {
  margin-left: 10px;
}
</style>


