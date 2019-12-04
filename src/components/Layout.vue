<template>
  <div class="components-container">
    <!-- [-|-] -->
    <SplitPane split="vertical" :min-percent="20" :default-percent="30">
      <template slot="paneL">
        <!-- 左侧树[-] -->
        <div class="left-container">
          <MainTree ref="mainTree" @on-graph="toGraph"></MainTree>
        </div>
      </template>
      <template slot="paneR">
        <!-- 右侧图形属性[-] -->
        <div class="right-container">
          <Graph :toGraphNode="toGraphNode" ref="graph" />
        </div>
      </template>
    </SplitPane>
  </div>
</template>
<script>
import MainTree from "./MainTree.vue";
import Graph from "./Graph.vue";
import SplitPane from "vue-splitpane";
export default {
  name: "layout",
  components: {
    MainTree,
    Graph,
    SplitPane
  },
  data() {
    return {
      propertiesData: {}, //属性数据
      isNode: false, //是否是节点
      isEdge: false, //是否是边
      toGraphNode: {} //需要绘图的数据
    };
  },
  methods: {
    toGraph(node) {
      this.toGraphNode = node;
      console.log("to graph:", node);
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
.left-container {
  /* background-color: #F38181; */
  overflow: scroll;
  width: 100%;
  height: 100%;
}
.right-container {
  /* background-color: #FCE38A; */
  width: 100%;
  height: 90%;
}
.el-tree {
  min-width: 100%;
  font-size: 14px;
  display: inline-block !important;
}
</style>
