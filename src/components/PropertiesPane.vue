<template>
    <div style="padding:10px">
        <el-row style="margin:10px;text-align:right" >
            <el-button type="primary" 
                        v-if="editMode" 
                        @click="editSubmit">
                        保存
            </el-button>
            <el-button  @click="()=>locked=!locked" 
                        :icon="['el-icon-star-on','el-icon-star-off'][locked?0:1]">
                        {{['解锁','锁定'][locked?0:1]}}
            </el-button>
            <el-button  @click="addAssociation"
                        icon="el-icon-share" v-if="canAssociation">
                        建立关联
            </el-button>
            <el-button  @click="()=>editMode=!editMode" 
                        v-if="canEdit"
                        :icon="['el-icon-close','el-icon-edit'][editMode?0:1]">
                        {{['退出','编辑'][editMode?0:1]}}
            </el-button>
        </el-row>
        <el-form ref="editEdgeForm" :model="formData" label-width="80px" v-if="isEdge" :disabled="!editMode" :rules="editFormRules">
              <el-form-item label="类型" prop="edgeType">
                <el-radio-group v-model="formData.edgeType">
                  <el-radio label="Inherit">继承</el-radio>
                  <el-radio label="Composition">组合</el-radio>
                  <el-radio label="Derivative">衍生</el-radio>
                  <el-radio label="Association" disabled>联系</el-radio>
                </el-radio-group>
              </el-form-item>
              <div class="el-form-item" >
                <label  class="el-form-item__label" style="width: 80px;">端点</label>
                <el-col :span="3" class="el-form-item__label">
                  <label >Left</label>
                </el-col>
                <el-col :span="5">
                  <el-input :value="formData.start.name" readonly v-popover:leftPopover></el-input>
                </el-col>
                <el-col :span="3" class="el-form-item__label">
                  <label>Right</label>
                </el-col>
                <el-col :span="5">
                  <el-input :value="formData.end.name" readonly v-popover:rightPopover></el-input>
                </el-col>
                <el-popover
                  ref="leftPopover"
                  placement="bottom"
                  width="200"
                  trigger="hover">
                  <div slot>
                    <div v-for="(value, key) in formData.start" :key="key">
                      {{ key }}: {{ value }}
                    </div>
                  </div>
                </el-popover>
                <el-popover
                    ref="rightPopover"
                    placement="bottom"
                    width="200"
                    trigger="hover">
                    <div slot>
                      <div v-for="(value, key) in formData.end" :key="key">
                        {{ key }}: {{ value }}
                      </div>
                    </div>
                </el-popover>
              </div>
        </el-form>
        <el-form ref="editNodeForm" :model="formData" label-width="80px" v-if="isNode" :disabled="!editMode" :rules="editFormRules">
              <el-input v-model="formData.id" type="hidden"></el-input>
                  <el-form-item label="名称" prop="name" >
                    <el-col :span="18">
                      <el-input v-model="formData.name" ></el-input>
                    </el-col>
                  </el-form-item>
              <el-form-item label="启用" prop="enable">
                  <el-switch v-model="formData.enable"></el-switch>
              </el-form-item>
              <el-form-item label="类型" prop="nodeType">
                <el-radio-group v-model="formData.nodeType">
                  <el-radio label="Container">容器</el-radio>
                  <el-radio label="Entity">实体</el-radio>
                  <el-radio label="Conception">概念</el-radio>
                  <el-radio label="Logic">逻辑</el-radio>
                  <el-radio label="Connection">关联</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="特征" prop="feature">
                <el-radio-group v-model="formData.feature">
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
                  <el-input :value="formData.parents?formData.parents.length:0" readonly v-popover:parentsPopover></el-input>
                </el-col>
                <el-popover
                  ref="parentsPopover"
                  placement="bottom"
                  width="200"
                  trigger="hover">
                  <div slot>
                    <el-tag
                      v-for="node in formData.parents"
                      :key="node.id"
                      style="margin:3px"
                      type="success">
                      {{node.name}}
                    </el-tag>
                    <span v-if="formData.parents.length==0">该节点没有双亲</span>
                  </div>
                </el-popover>
                <el-col :span="3" class="col-label">
                  <label>兄弟</label>
                </el-col>
                <el-col :span="5">
                  <el-input :value="formData.sibling?formData.sibling.length:0" readonly v-popover:siblingPopover></el-input>
                </el-col>
                <el-popover
                  ref="siblingPopover"
                  placement="bottom"
                  width="200"
                  trigger="hover">
                  <div slot>
                      <el-tag
                      v-for="node in formData.sibling"
                      :key="node.id"
                      style="margin:3px"
                      type="success">
                      {{node.name}}
                    </el-tag>
                    <span v-if="formData.sibling.length==0">该节点没有兄弟姐妹</span>
                  </div>
                </el-popover>
              </el-form-item>

              <!-- <el-form-item label="建立关联" prop="edgeType">
                <el-radio-group v-model="formData.edgeType">
                  <el-radio :label="1">继承</el-radio>
                  <el-radio :label="2">组合</el-radio>
                  <el-radio :label="3">衍生</el-radio>
                  <el-radio :label="4" disabled>联系</el-radio>
                </el-radio-group>
              </el-form-item> -->
              <el-form-item label="单词" prop="word_en">
                <el-col :span="18">
                  <el-input v-model="formData.word_en"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">En</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="word_zh_CN">
                <el-col :span="18">
                  <el-input v-model="formData.word_zh_CN"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">中文</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="word_ja">
                <el-col :span="18">
                  <el-input v-model="formData.word_ja"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">日本语</el-tag>
                </el-col>
              </el-form-item>
              <el-form-item label="单词" prop="work_ko">
                <el-col :span="18">
                  <el-input v-model="formData.word_ko"></el-input>
                </el-col>
                <el-col :span="3" class="col-label">
                  <el-tag type="success">한국어</el-tag>
                </el-col>
              </el-form-item>
            </el-form>
            <el-dialog width="50%"   title="编辑关系" :visible.sync="dialogAddAssociationVisible" > 
              <el-form ref="addAssociationForm" :model="addAssociationData" label-width="80px" ：rules="addAssociationFormRules">
                  <el-form-item label="关联节点" prop="connection" >
                    <el-select v-model="addAssociationData.connection"  filterable placeholder="请选择关联节点">
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
                  <el-button @click="dialogAddAssociationVisible = false">取 消</el-button>
                  <el-button type="primary" @click="confirmAddAssociation">确 定</el-button>
                </span>
            </el-dialog>
    </div>
</template>
<script>
import { editNode, editEdge,getConnection,addEdge } from "@/api/graph";
export default {
  name: "propertiesPane",
  props: {
    propertiesData: {
      type: [Object],
      default: () => {
        return {
          parents: [],
          sibling: []
        };
      }
    },
    isNode: {
      type: [Boolean],
      default: () => {
        true;
      }
    },
    isEdge: {
      type: [Boolean],
      default: () => {
        true;
      }
    },
    // events: ["on-node-update", "on-edge-update","on-add-Association"]
  },
  data() {
    return {
      saveData: {}, //保存的数据
      locked: false, //是否锁定
      editMode: false, //是否启用编辑
      dialogAddAssociationVisible:false,//是否显示添加关联对话框
      connections:[],//关联节点
      addAssociationData:{},//添加节点数据
      editFormRules: {
        name: [
          { required: true, message: "请输入节点名称", trigger: "blur" },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
        ]
      },
      addAssociationFormRules:{
        connection: [
          { required: true, message: "请选择关联节点", trigger: "blur" },
        ]
      }
    };
  },
  computed: {
    formData() {
      return this.locked? this.saveData: this.propertiesData;
    },
    canEdit() {
      return !this.propertiesData.immutable;
    },
    /**
     * 是否可建立关联
     */
    canAssociation(){
      //边两端的节点不能为关联节点
      return this.isEdge&&this.propertiesData.start.nodeType!='Connection'&&this.propertiesData.end.nodeType!='Connection';
    }
  },
  methods: {
    /**
     * 点击边建立关联
     */
    addAssociation(){
      getConnection().then(data => {
          this.connections = data;
          this.dialogAddAssociationVisible=true;
      });
    },
    /**
     * 确认建立关联
     */
    confirmAddAssociation(){
      this.$refs.addAssociationForm.validate(valid=>{
        if(valid){
            let edge=this.propertiesData;
            let _this=this;
              let params = {
              edgeType: 'Association',
              connection: _this.addAssociationData.connection,
              from: edge.start.id,
              to: edge.end.id
            };
            addEdge(params).then(data => {
              _this.dialogAddAssociationVisible = false;
              _this.$emit("on-add-Association",data);
            });
        }else{
          return false;
        }
      });
    },
    /**
     * 保存修改
     */
    editSubmit() {
      //保存节点
      if (this.isNode) {
        //表单验证
        this.$refs.editNodeForm.validate(valid => {
          if (valid) {
            editNode(this.formData).then(data => {
              this.$message({
                message: "节点修改成功!",
                type: "success"
              });
              this.editMode = false;
              //发布节点更新事件
              this.$emit("on-node-update", data);
            });
          } else {
            return false;
          }
        });
      } else if (this.isEdge) {
        //保存关系
        editEdge(this.formData).then(data => {
          this.$message({
            message: "关系修改成功!",
            type: "success"
          });
          this.editMode = false;
          //发布节点更新事件
          this.$emit("on-edge-update", {deletedId:this.formData.id,newEdge:data});
        });
      }
    }
  }
};
</script>
<style scoped>
.col-label {
  text-align: right;
  padding: 0 5px;
}
</style>
