<template>
  <div class="components-container">
    <!-- [-|-] -->
    <SplitPane split="vertical" :min-percent='20' :default-percent='30'> 
          <template slot="paneL">
            <!-- 左侧树[-] -->
            <SplitPane split="horizontal" :min-percent='20' :default-percent='70'>
              <template slot="paneL">
                <div class="left-top-container">
                  <MainTree ref="mainTree" @ongraph="handleGraph" @ondrop="handleDrop"></MainTree>
                </div>
              </template>
              <template slot="paneR">
                <div class="left-bottom-container">
                  <RemainTree ref="remainTree" @ongraph="handleGraph"></RemainTree>
                </div>
              </template>
            </SplitPane>
          </template>
          <template slot="paneR">
            <!-- 右侧图形属性[-] -->
            <SplitPane split="horizontal" :min-percent='40' :default-percent='60'>
              <template slot="paneL">
                <div class="right-top-container">
                  <Graph :toGraphData="toGraphData" 
                        ref="graph" 
                        @on-focus-tree="handleFocusTree"
                        @on-drop-node="handleDrop"
                        @on-node-properties="handleNodeProperties" 
                        @on-edge-properties="handleEdgeProperties">
                  </Graph>
                </div>
              </template>
              <template slot="paneR">
                <div class="right-bottom-container">
                  <properties-pane :properties-data="propertiesData" 
                                    :is-node="isNode"
                                    :is-edge="isEdge"
                                    @on-edge-update="handleEdgeUpdate"
                                    @on-add-association="handleAddAssociation"
                                    @on-node-update="handleNodeUpdate">
                  </properties-pane>
                </div>
              </template>
            </SplitPane>
          </template>
      </SplitPane>
  </div>
  
</template>
<script>
import MainTree from "./MainTree.vue";
import RemainTree from "./RemainTree.vue";
import Graph from "./Graph.vue";
import SplitPane from "vue-splitpane";
import PropertiesPane from "./PropertiesPane.vue";
import { getFamily } from "@/api/graph";
import { getColor, adaptPath, addData, getArrowsType } from "@/utils/adapter";
export default {
  name: "layout",
  components: {
    MainTree,
    RemainTree,
    Graph,
    SplitPane,
    PropertiesPane
  },
  data() {
    return {
      propertiesData: {}, //属性数据
      isNode: false, //是否是节点
      isEdge: false, //是否是边
      toGraphData: [] //需要绘图的数据
    };
  },
  methods: {
    /**
     * 处理图像请求
     */
    handleGraph(e) {
      this.toGraphData = e.data;
      this.$refs.graph.gNeoNode(e.data.id);
    },
    /**
     * 处理节点属性事件
     */
    handleNodeProperties(e) {
      let nodeData = e.data;
      let params = {
        nodeId: nodeData.id,
        members: "Parents,Sibling"
      };
      getFamily(params).then(data => {
        this.isEdge = false;
        this.isNode = true;
        this.propertiesData = data.me;
        this.propertiesData.parents = data.parents;
        this.propertiesData.sibling = data.sibling;
      });
    },
    /**
     * 处理边属性事件
     */
    handleEdgeProperties(e) {
      this.isEdge = true;
      this.isNode = false;
      this.propertiesData = e.data;
    },
    /**
     * 处理节点删除事件
     */
    handleDrop(e) {
      this.$refs.remainTree.recycleNode(e);
    },
    /**
     * 处理节点更新事件
     */
    handleNodeUpdate(e) {
      this.$refs.graph.nodes.update({
        id: e.id,
        label: e.name,
        color: getColor(e.nodeType),
        data: e
      });
    },
    /**
     * 处理边更新事件
     */
    handleEdgeUpdate(e) {
      let deletedId = e.deletedId;
      let newEdge = e.newEdge;
      this.$refs.graph.edges.remove(deletedId);
      this.$refs.graph.edges.update({
        id: newEdge.id,
        from: newEdge.start.id,
        to: newEdge.end.id,
        data: newEdge,
        arrows: {
          to: {
            type: getArrowsType(newEdge.edgeType)
          }
        },
        dashes: e.edgeType == "Association"
      });
    },
    /**
     * 处理定位到树事件
     */
    handleFocusTree(e) {
      this.$refs.mainTree.focusNode(e.data.id);
    },
    /**
     * 处理添加关联事件
     */
    handleAddAssociation(e) {
      let _data = adaptPath(e);
      let nodes = this.$refs.graph.nodes;
      let edges = this.$refs.graph.edges;
      this.$refs.graph.nodes = addData(nodes, _data.nodes);
      this.$refs.graph.edges = addData(edges, _data.edges);
    }
  }
};
</script>
<style  >
.components-container {
  padding: 5px;
  overflow: scroll;
  position: relative;
  height: 98vh;
}
.left-top-container {
  /* background-color: #F38181; */
  overflow: scroll;
  width: 100%;
  height: 100%;
}
.left-bottom-container {
  /* background-color: #FCE38A; */
  overflow: scroll;
  width: 100%;
  height: 100%;
}
.right-top-container {
  /* background-color: #FCE38A; */
  width: 100%;
  height: 100%;
}
.right-bottom-container {
  width: 100%;
  /* background-color: #95E1D3; */
  height: 100%;
  overflow: scroll;
}
.el-tree {
  min-width: 100%;
  font-size: 14px;
  display: inline-block !important;
}
</style>
