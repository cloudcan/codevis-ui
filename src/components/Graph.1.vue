<template>
<el-container style="display:relative">
  <el-header height="100px">
    <div style="padding:10px" 
      @ondragenter="e=>console.log('@ondragenter',e)" 
      @ondragleave="e=>console.log('@ondragleave',e)" 
      @ondragover="e=>console.log('@ondragover',e)" 
      @ondrop="e=>console.log('@ondrop',e)">
      <el-button @click="getAll">填充数据</el-button>
      <el-button @click="gAddNode">添加节点</el-button>
      <el-button @click="gAddEdge">添加关系</el-button>
      <el-button @click="gDeleteSelected">删除</el-button>
      <el-button @click="gNeoNode">创世模式</el-button>
      <el-autocomplete style="margin:0 10px"
          class="inline-input"
          v-model="search.nodeName"
          :fetch-suggestions="querySearch"
          placeholder="请输入节点名称"
          :trigger-on-focus="false"
          value-key="label"
          clearable
          @select="searchNode">
        <el-button  slot="append" icon="el-icon-search"  @click="searchNode"></el-button>
      </el-autocomplete>
    </div>
    <!-- <el-input placeholder="请输入节点名称" v-model="search.nodeName" clearable class="input-with-select">
      <el-button  slot="append" icon="el-icon-search"  @click="searchNode"></el-button>
    </el-input> -->
  </el-header>
  <el-main class="main-graph" >
    <div >
      <Network 
              :nodes=nodes 
              :edges=edges 
              :options="gOptions"
              @click="gClick"
              @selectEdge="gSelectEdge"
              @doubleClick="gDoubleClick"
              @oncontext="gOncontext"
              @afterDrawing="gAfterDrawing"
              @stabilized="gStabilized"
              @dragEnd="gDragEnd"
              @hover="gHover"
              @dragging="gDragging"
              @hold="gHold"
              ref="gNetwork"
              @selectNode="gSelectNode">
      </Network>
    </div>
    
  </el-main>
  <el-footer height="260px">
    <div>
        <ul>
          <li v-if="selectedObject.type">类型：{{selectedObject.type}}</li>
          <li v-for="(value,key) in selectedObject.data ">
            {{key}}:{{value}}
          </li>
        </ul>
    </div>
  </el-footer>
</el-container>
   
</template>
<script>
import Network from "./Network.vue";
import { DataSet } from "vis";
import { getMovies, getRelativeNode } from "@/api/graph";
import { adaptMovie, addData } from "@/utils/adapter";
import { parseEdgesFromEvent, parseNodesFromEvent } from "@/utils/parseEvent";
export default {
  name: "graph",
  components: {
    Network
  },
  data() {
    return {
      nodes: new DataSet(), //节点
      edges: new DataSet(), //边
      gOptions: {}, //选项
      search: {
        nodeName: ""
      },
      model: 0, //模式 0 默认 1创世模式
      selectedObject: {} //当前选中的对象
    };
  },
  methods: {
    /**
     * 初始化网络图
     */
    init() {
      //初始化配置
      this.gOptions = {
        //节点设置
        nodes: {
          shape: "dot",
          font: {
            //vadjust:30
          },
          size: 16
        },
        edges: {
          arrows: "to"
        },
        interaction: {
          navigationButtons: true,
          keyboard: false
        }
      };
    },
    querySearch(queryString, cb) {
      var nodes = this.nodes.map(e => e);
      var results = queryString
        ? nodes.filter(
            n => n.label.toLowerCase().indexOf(queryString.toLowerCase()) === 0
          )
        : nodes;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    getAll() {
      let _this = this;
      let params = {
        skip: 0,
        limit: 200
      };
      getMovies(params)
        .then(data => {
          var _data = adaptMovie(data);
          //清空所有数据后再添加
          _this.nodes.clear();
          _this.edges.clear();
          _this.nodes.add(_data.nodes);
          _this.edges.add(_data.edges);
        })
        .catch();
    },
    searchNode() {
      let _this = this;
      let node = _this.nodes.map(item => item).find(n => {
        return n.label == _this.search.nodeName;
      });
      if (node) {
        let net = _this.$refs.gNetwork;
        net.focus(node.id, {
          scale: 2
          //fixed:true
        });
        //节点高亮
        //net.nodes.update([{ id: node.id, color: { background: "#F4A460" } }]);
        net.selectNodes([node.id]);
        //net.stabilize([1,2,3]);
        // let vPosition=_this.$refs.gNetwork.getViewPosition();
        // var n = _this.$refs.gNetwork.getPositions(node.id);
        // let p = _this.$refs.gNetwork.canvasToDom(vPosition);
        // _this.$refs.gNetwork.moveTo({
        //   position: vPosition,
        //   scale: 3
        // });
      }
    },
    gNeoNode() {
      this.model = 1;
      let _this = this;
      let params = {
        nodeId: 7119
      };
      getRelativeNode(params)
        .then(data => {
          var _data = adaptMovie(data);
          //清空所有数据后再添加
          _this.nodes.clear();
          _this.edges.clear();
          _this.nodes.add(_data.nodes);
          _this.edges.add(_data.edges);
        })
        .catch();
    },
    gClick(e) {
      //  console.log(e);
      if (e.nodes.length == 0 && e.edges.length == 0) {
        this.selectedObject = {};
      }
    },
    gDoubleClick(e) {
      // console.log(e);
      if (e.nodes.length != 0) {
        let _this = this;
        let params = {
          nodeId: e.nodes[0]
        };
        getRelativeNode(params)
          .then(data => {
            var _data = adaptMovie(data);
            _this.nodes = addData(_this.nodes, _data.nodes);
            _this.edges = addData(_this.edges, _data.edges);
          })
          .catch();
      }
    },
    gDragEnd(e) {
      console.log(e);
    },
    gHover(e) {
      console.log(e);
    },
    gHold(e) {
      console.log(e);
    },
    gDragging(e) {
      console.log(e);
    },
    gOncontext(e) {
      let gNetwork = this.$refs.gNetwork;
      let ctx = gNetwork.network.canvas.getContext("2d");
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
        let offsetR = 2;
        ctx.beginPath();
        //绘制右下扇形
        ctx.arc(
          nn.x,
          nn.y,
          nWidth,
          5 * Math.PI / 180,
          85 * Math.PI / 180,
          false
        );

        //ctx.lineTo();
        ctx.arc(
          nn.x,
          nn.y,
          0.5 * nWidth + offsetR,
          85 * Math.PI / 180,
          5 * Math.PI / 180,
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
        //ctx.addHitRegion({id:'a'});
        // //绘制左下扇形
        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   nWidth,
        //   275 * Math.PI / 180,
        //   355 * Math.PI / 180,
        //   false
        // );

        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   0.5 * nWidth + offsetR,
        //   355 * Math.PI / 180,
        //   275 * Math.PI / 180,
        //   true
        // );
        // ctx.closePath();
        // ctx.stroke();
        // // ctx.addHitRegion({id:'b'});
        // //绘制左上扇形
        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   nWidth,
        //   95 * Math.PI / 180,
        //   175 * Math.PI / 180,
        //   false
        // );
        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   0.5 * nWidth + offsetR,
        //   175 * Math.PI / 180,
        //   95 * Math.PI / 180,
        //   true
        // );
        // ctx.closePath();
        // ctx.stroke();
        // // ctx.addHitRegion({id:'c'});
        // //绘制右上扇形
        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   nWidth,
        //   185 * Math.PI / 180,
        //   265 * Math.PI / 180,
        //   false
        // );
        // ctx.arc(
        //   nn.x,
        //   nn.y,
        //   0.5 * nWidth + offsetR,
        //   265 * Math.PI / 180,
        //   185 * Math.PI / 180,
        //   true
        // );
        // // ctx.addHitRegion({id:'d'});
        // ctx.closePath();
        // ctx.stroke();

        //屏蔽默认右键行为
        e.event.preventDefault();
      }
    },
    gStabilized() {},
    gSelectEdge(e) {
      //console.log(e);
      if (e.nodes.length == 0) {
        let edgeId = e.edges[0];
        this.selectedObject = this.edges.get(edgeId);
      }
    },
    gSelectNode(e) {
      //console.log(e);
      let nodeId = e.nodes[0];
      this.selectedObject = this.nodes.get(nodeId);
    },
    gAddNode() {
      this.$refs.gNetwork.addNodeMode();
    },
    gAddEdge() {
      this.$refs.gNetwork.addEdgeMode();
    },
    gDeleteSelected() {
      this.$refs.gNetwork.deleteSelected();
    },
    gAfterDrawing(ctx) {}
  },
  mounted() {
    this.init();
  }
};
</script>
<style>
.main-graph div {
  width: 100%;
  height: 100%;
  border: 1px solid lightgray;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: left;
  line-height: 22px;
}
.el-main {
  background-color: #e9eef3;
  color: rgb(177, 130, 130);
  text-align: center;
  /* line-height: 160px; */
  height: 600px;
}
</style>

