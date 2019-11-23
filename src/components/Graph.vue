<template>
  <div style="display:block;height:100%" class="main-graph">
    <div class="toolbar">
      <el-button @click="gAddEdge"  size="small">新增边</el-button>
      <el-button @click="gDeleteNode" :disabled="!canDeleteNode" size="small">删除节点</el-button>
      <el-button @click="gDeleteEdge" :disabled="!canDeleteEdge" size="small">剪边</el-button>
      <el-button @click="gFocusTree" size="small">定位到树</el-button>
      <el-button @click="()=>appendMode=!appendMode" size="small">{{['刷新模式','添加模式'][appendMode?0:1]}}</el-button>
      <el-button @click="()=>containSibling=!containSibling" size="small">{{['隐藏兄弟','显示兄弟'][containSibling?0:1]}}</el-button>
      <el-button  @click="()=>locked=!locked" :icon="['el-icon-star-on','el-icon-star-off'][locked?0:1]" size="small">{{['解锁','锁定'][locked?0:1]}}</el-button>
    </div>
    <el-dialog width="50%"   title="编辑关系" :visible.sync="dialogEEVisible" @close="handleEEDialogClose"> 
      <el-form ref="edgeForm" :model="eeData" label-width="80px" :rules="edgeFormRules">
          <el-form-item label="关系类型" prop="edgeType">
                <el-radio-group v-model="eeData.edgeType" @change="handleEdgeTypeChange">
                      <el-radio label="Inherit">继承</el-radio>
                      <el-radio label="Composition">组合</el-radio>
                      <el-radio label="Derivative">衍生</el-radio>
                      <el-radio label="Association" :disabled="!canAssociation">联系</el-radio>
                </el-radio-group>
          </el-form-item>
          <el-form-item label="关联节点" prop="connection" v-if="eeData.edgeType=='Association'" >
            <el-select v-model="eeData.connection"  filterable placeholder="请选择关联节点">
              <el-option
                v-for="item in connections"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
        </el-form-item>
      </el-form>
       <span slot="footer" class="dialog-footer">
          <el-button @click="dialogEEVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEEDialog">确 定</el-button>
        </span>
    </el-dialog>
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
</template>
<script>
import Network from "./Network.vue";
import { DataSet } from "vis";
import { dropNode } from "@/api/tree";
import {
  getFamily,
  getRelativeNode,
  addEdge,
  deleteEdge,
  searchNode,
  getConnection,
  canDeleteEdge,
  canDropNode
} from "@/api/graph";
import { adaptPath, addData, adaptFamily } from "@/utils/adapter";
import { parseEdgesFromEvent } from "@/utils/parseEvent";
export default {
  name: "graph",
  components: {
    Network
  },
  props: {
    toGraphData: {
      type: [Array, Object],
      default: () => []
    },
    events: ["on-node-properties", "on-edge-properties", "on-focus-tree","on-drop-node"]
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
        edgeData:null,//连接的点数据
        //编辑关系对话框数据
        edgeType: "Inherit", //选择的边类型
        connection: null //关联节点id
      },
      connections: [], //所有关联
      selectedNode: null, //当前选中的节点
      selectedEdge:null,//当前选中的边
      edgeFormRules:{
        connection: [
            { required: true,message: '请选择关联节点', trigger: 'change' },
        ],
        edgeType: [
            { required: true,message: '请选择关系类型', trigger: 'change' },
        ],
      }
    };
  },
  computed:{
    /**
     * 是否可建立关联
     */
    canAssociation(){
      let t=this.eeData.edgeData;
      if(t){
        let from=this.nodes.get(t.from);
        let to=this.nodes.get(t.to);
        return from&&from.data&&from.data.nodeType!='Connection'&&to&&to.data&&to.data.nodeType!='Connection';
      }else{
        return false;
      }
    }
  },
  asyncComputed: {
    /**
     * 是否可剪边
     */
    canDeleteEdge() {
      if (this.selectedEdge) {
        let edgeId=this.selectedEdge.data.id;
        return canDeleteEdge({
          id: edgeId
        }).then(data => !!data);
      } else {
        return false;
      }
    },
    /**
     * 是否可删除节点
     */
    canDeleteNode() {
      if (this.selectedNode&&!this.selectedNode.data.immutable) {
        let nodeId=this.selectedNode.data.id;
        return canDropNode({
          id: nodeId
        }).then(data => !!data);
      } else {
        return false;
      }
    }
  },
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
     * 确认编辑关系
     */
    confirmEEDialog() {
      //验证编辑边表单
      this.$refs.edgeForm.validate(valid=>{
        if(valid){
            let ed = this.eeData.edgeData;
            let _this = this;
            let params = {
              edgeType: _this.eeData.edgeType,
              connection: _this.eeData.connection,
              from: ed.from,
              to: ed.to
            };
            addEdge(params).then(data => {
              _this.dialogEEVisible = false;
              let _data = adaptPath(data);
              _this.nodes = addData(_this.nodes, _data.nodes);
              _this.edges = addData(_this.edges, _data.edges);
            });
        }else{
          return false;
        }
      });
    },
    /**
     * 处理编辑关系对话框关闭事件
     */
    handleEEDialogClose() {
      this.$refs.gNetwork.disableEditMode();
      this.$refs.edgeForm.resetFields();
      this.eeData.edgeType = "Inherit";
    },
    /**
     * 处理边类型改变事件
     */
    handleEdgeTypeChange() {
      if (this.eeData.edgeType == "Association") {
        getConnection().then(data => {
          this.connections = data;
        });
      }
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
    searchNode() {
      let _this = this;
      let node = _this.nodes.map(item => item).find(n => {
        return n.label == _this.search.nodeName;
      });
      focusNode(nodeId);
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
    dataGraph() {},
    /**
     * 获取指定节点相关的节点
     */
    gNeoNode(nodeId) {
      //锁定模式下无法创建数据
      if (this.locked) {
        return;
      }
      let _this = this;
      let params = {
        nodeId: nodeId,
        members: "Parents,Children,Me" + (this.containSibling ? ",Sibling" : "")
      };
      getFamily(params)
        .then(data => {
          var _data = adaptFamily(data);
          if (!_this.appendMode) {
            //清空所有数据后再添加
            _this.nodes.clear();
            _this.edges.clear();
            _this.nodes.add(_data.nodes);
            _this.edges.add(_data.edges);
          } else {
            _this.nodes = addData(_this.nodes, _data.nodes);
            _this.edges = addData(_this.edges, _data.edges);
          }
          //关注节点
          _this.focusNode(nodeId);
        })
        .catch();
    },
    /**
     * 处理单击事件
     */
    gClick(e) {
      if (e.nodes.length == 0 && e.edges.length == 0) {
        //点击空白区域
        this.selectedNode = null;
        this.selectedEdge=null;
      } else if (e.nodes.length != 0) {
        //单击节点
        // this.gOncontext(e);
      }
    },
    /**
     * 处理双击事件
     */
    gDoubleClick(e) {
      // console.log(e);
      if (e.nodes.length != 0) {
        let _this = this;
        let params = {
          nodeId: e.nodes[0]
        };
        getRelativeNode(params).then(data => {
          var _data = adaptPath(data);
          _this.nodes = addData(_this.nodes, _data.nodes);
          _this.edges = addData(_this.edges, _data.edges);
        });
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
    gStabilized() {},
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
     * 剪边
     */
    gDeleteEdge() {
      let _this = this;
      let edgeId = this.selectedEdge.data.id;
      deleteEdge({ id: edgeId }).then(data => {
        this.edges.remove(edgeId);
      });
    },
    /**
     * 删除节点
     */
    gDeleteNode() {
      let _this = this;
      let nodeId = this.selectedNode.data.id;
      dropNode({ nodeId: nodeId }).then(data => {
        _this.nodes.remove(nodeId);
        _this.$emit("on-drop-node",_this.selectedNode.data);
        _this.selectedNode=null;
      });
    },
    /**
     * 改变鼠标
     */
    changeCursor(cursor) {
      this.$refs.gNetwork.$refs.visualization.children[0].style.cursor = cursor;
    },
    gDeleteSelected() {
      this.$refs.gNetwork.deleteSelected();
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

