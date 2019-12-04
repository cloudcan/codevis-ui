<template>
  <div style="display:block;height:100%" class="main-graph">
    <div class="toolbar">
      <!-- <el-button @click="gAddEdge"  size="small">新增边</el-button>
      <el-button @click="gDeleteNode" :disabled="!canDeleteNode" size="small">删除节点</el-button>
      <el-button @click="gDeleteEdge" :disabled="!canDeleteEdge" size="small">剪边</el-button>
      <el-button @click="gFocusTree" size="small">定位到树</el-button>
      <el-button @click="()=>appendMode=!appendMode" size="small">{{['刷新模式','添加模式'][appendMode?0:1]}}</el-button>
      <el-button @click="()=>containSibling=!containSibling" size="small">{{['隐藏兄弟','显示兄弟'][containSibling?0:1]}}</el-button>
      <el-button  @click="()=>locked=!locked" :icon="['el-icon-star-on','el-icon-star-off'][locked?0:1]" size="small">{{['解锁','锁定'][locked?0:1]}}</el-button>-->
    </div>
    <Network
      :nodes="nodes"
      :edges="edges"
      :options="gOptions"
      @click="gClick"
      @doubleClick="gDoubleClick"
      @oncontext="gOncontext"
      ref="gNetwork"
      @selectNode="gSelectNode"
    ></Network>
  </div>
</template>
<script>
import Network from "./Network.vue";
import { DataSet } from "vis";
import { getChildrenPath } from "@/api";
import { addNode, getChildrenPathParams, addPath } from "@/utils/adapter";
import { NodeLabel } from "../model/types";
export default {
  name: "graph",
  components: {
    Network
  },
  props: {
    toGraphNode: {
      type: Object,
      default: () => {}
    }
    // events: ["on-node-properties", "on-edge-properties", "on-focus-tree","on-drop-node"]
  },
  watch: {
    toGraphNode: function(newVal, oldVal) {
      this.gNeoNode(newVal);
    }
  },
  data() {
    return {
      nodes: new DataSet(), //节点
      edges: new DataSet(), //边
      gOptions: {}, //选项
      search: {
        nodeName: ""
      },
      appendMode: false, //添加模式
      dialogEEVisible: false, //编辑关系对话框
      containSibling: false, //是否包含兄弟姐妹
      locked: false, //是否锁定
      eeData: {
        edgeData: null, //连接的点数据
        //编辑关系对话框数据
        edgeType: "Inherit", //选择的边类型
        connection: null //关联节点id
      },
      connections: [], //所有关联
      selectedNode: null, //当前选中的节点
      selectedEdge: null //当前选中的边
    };
  },
  computed: {},
  methods: {
    /**
     * 初始化网络图
     */
    init() {
      let _this = this;
      //初始化配置
      this.gOptions = {
        //节点设置
        nodes: {
          borderWidth: 2,
          shape: "dot",
          size: 16
        },
        edges: {
          arrows: "to"
        },
        interaction: {
          navigationButtons: true,
          keyboard: false
        },
        manipulation: {
          enabled: false,
          addEdge: function(edgeData, callback) {
            //还原鼠标样式
            _this.changeCursor("default");
            if (edgeData.from === edgeData.to) {
              _this.$refs.gNetwork.disableEditMode();
            } else {
              _this.dialogEEVisible = true;
              _this.eeData.edgeData = edgeData;
              _this.eeData.callback = callback;
            }
          }
        }
      };
      //this.getAll();
    },
    /**
     * 关注节点
     */
    focusNode(nodeId) {
      let net = this.$refs.gNetwork;
      net.focus(nodeId, {
        scale: 1.2
        //fixed:true
      });
      //节点高亮
      //net.nodes.update([{ id: node.id, color: { background: "#F4A460" } }]);
      net.selectNodes([nodeId]);
    },
    //利用传来的数据作图
    dataGraph(data) {},
    /**
     * 获取指定节点相关的节点
     */
    gNeoNode(node) {
      //锁定模式下无法创建数据
      if (this.locked) {
        return;
      }
      //清空所有数据后再添加
      this.nodes.clear();
      this.edges.clear();
      addNode(this.nodes, node);
    },
    /**
     * 处理单击事件
     */
    gClick(e) {
      if (e.nodes.length == 0 && e.edges.length == 0) {
        //点击空白区域
        this.selectedNode = null;
        this.selectedEdge = null;
      } else if (e.nodes.length != 0) {
        //单击节点
        console.log("select node:", e.nodes);
      }
    },
    /**
     * 处理双击事件
     */
    gDoubleClick(e) {
      if (e.nodes.length != 0) {
        let _this = this;
        let cNode = _this.nodes.get(e.nodes[0]).data;
        if (
          cNode.label == NodeLabel.Container ||
          cNode.label == NodeLabel.Prog ||
          cNode.label == NodeLabel.File
        ) {
          let { pid, label, r } = getChildrenPathParams(cNode);
          getChildrenPath(pid, label, r).then(data => {
            addPath(_this.nodes, _this.edges, ...data);
          });
        }
      }
    },
    /**
     * 处理右键事件
     */
    gOncontext(e) {
      let gNetwork = this.$refs.gNetwork;
      let canvas = gNetwork.network.canvas;
      let ctx = canvas.getContext("2d");
      let x = e.pointer.DOM.x;
      let y = e.pointer.DOM.y;
      let nodeId = gNetwork.getNodeAt(e.pointer.DOM);
      if (nodeId) {
        let node = gNetwork.network.body.nodes[nodeId];
        let scale = gNetwork.getScale(); //缩放
        let nWidth = node.shape.width * scale; //节点的宽度
        let nHeight = node.shape.height * scale; //节点的高度
        let n = gNetwork.getPositions(nodeId);
        let nn = gNetwork.canvasToDom(n[nodeId]);
        let offsetR = 5;
        //重绘
        gNetwork.redraw();
        ctx.beginPath();
        //绘制右下扇形
        ctx.arc(
          nn.x,
          nn.y,
          1.5 * nWidth,
          (5 * Math.PI) / 180,
          (85 * Math.PI) / 180,
          false
        );

        //ctx.lineTo();
        ctx.arc(
          nn.x,
          nn.y,
          0.5 * nWidth + offsetR,
          (85 * Math.PI) / 180,
          (5 * Math.PI) / 180,
          true
        );
        //添加点击事件
        ctx.canvas.addEventListener("click", e => {
          let x = e.pageX - ctx.canvas.getBoundingClientRect().left;
          let y = e.pageY - ctx.canvas.getBoundingClientRect().top;
          if (ctx.isPointInPath(x, y)) {
            console.log("========");
          }
        });
        ctx.closePath();
        //ctx.stroke();
        ctx.fillStyle = "rgba(255,165,0,0.5)";
        ctx.fill();
        //屏蔽默认右键行为
        e.event.preventDefault();
      }
    },
    /**
     * 选中边事件
     */
    gSelectEdge(e) {
      //console.log(e);
      if (e.nodes.length == 0) {
        let edgeId = e.edges[0];
        this.selectedEdge = this.edges.get(edgeId);
        //触发边属性事件
        this.$emit("on-edge-properties", this.selectedEdge);
      }
    },
    /**
     * 选中节点事件
     */
    gSelectNode(e) {
      //console.log(e);
      let nodeId = e.nodes[0];
      this.selectedNode = this.nodes.get(nodeId);
      //触发节点属性事件
      this.$emit("on-node-properties", this.selectedNode);
    },
    gAddNode() {
      this.$refs.gNetwork.addNodeMode();
    },
    /**
     * 添加边
     */
    gAddEdge() {
      this.changeCursor("crosshair");
      this.$refs.gNetwork.addEdgeMode();
    },
    /**
     * 改变鼠标
     */
    changeCursor(cursor) {
      this.$refs.gNetwork.$refs.visualization.children[0].style.cursor = cursor;
    },
    gAfterDrawing(ctx) {},
    /**
     * 定位到树
     */
    gFocusTree() {
      //选中了节点
      if (this.selectedNode) {
        this.$emit("on-focus-tree", this.selectedNode);
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style>
.main-graph .vis {
  width: 100%;
  height: 100%;
}
.toolbar {
  position: absolute;
  right: 0px;
  top: 20px;
  height: 50px !important;
  width: auto !important;
  z-index: 999;
}
</style>

