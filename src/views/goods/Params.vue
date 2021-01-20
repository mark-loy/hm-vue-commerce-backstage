<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--alert提示-->
      <el-alert title="注意：只允许为第三级分类设置参数！" type="warning" show-icon :closable="false"></el-alert>
      <!--选择商品分类区域-->
      <el-row>
        <el-col :span="8">
          <span>选择商品分类：</span>
          <el-cascader v-model="cateForm" :options="cateData"
                       :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                       @change="selectGoodsHandleChange" clearable style="width: 70%">
          </el-cascader>
        </el-col>
      </el-row>
      <!--参数配置区域-->
      <el-tabs v-model="paramsActiveName" @tab-click="paramsHandleClick">
        <!--动态参数区域-->
        <el-tab-pane label="动态参数" name="many">
          <!--添加参数按钮-->
          <el-button type="primary" size="mini" @click="showAddParamsDialog" :disabled="!isDisabled">添加参数</el-button>
          <!--添加参数表格-->
          <el-table :data="addParamsData" stripe style="width: 100%">
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag type="primary" size="medium" @close="removeTag(scope.row, index)" closable v-for="(item, index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                <!--动态编辑标签区域-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                        size="small" style="width: 120px" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditParamsDialog(scope.row)" type="primary" size="mini">编辑</el-button>
                <el-button @click="showMessageBox(scope.row.attr_id)" type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--静态属性区域-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" @click="showAddParamsDialog" :disabled="!isDisabled">添加属性</el-button>
          <!--添加参数表格-->
          <el-table :data="addParamsData" stripe style="width: 100%">
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag type="primary" size="medium" @close="removeTag(scope.row, index)" closable v-for="(item, index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                <!--动态编辑标签区域-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                          size="small" style="width: 120px" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditParamsDialog(scope.row)" type="primary" size="mini">编辑</el-button>
                <el-button @click="showMessageBox(scope.row.attr_id)" type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--添加参数、属性对话框-->
    <el-dialog :title="'添加' + dialogTitle" @close="addParamsDialogClosed" :visible.sync="addParamsDialogVisible" width="50%">
      <!--表单区域-->
      <el-form :model="addParamsForm" :rules="addParamsRules" ref="addParamsRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑参数、属性对话框-->
    <el-dialog :title="'编辑' + dialogTitle" :visible.sync="editParamsDialogVisible" width="50%">
      <!--表单区域-->
      <el-form :model="editParamsForm" :rules="editParamsRules" ref="editParamsRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsSubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Params",
    data() {
      return {
        /*分类表单*/
        cateForm: {},
        /*分类数据源*/
        cateData: [],
        /*控制参数配置tab选择*/
        paramsActiveName: 'many',
        /*商品分类选择的层级*/
        cateSelected: 0,
        /*分类id*/
        cateId: 0,
        /*添加分类表格数据源*/
        addParamsData: [],
        /*控制添加参数对话框显示、隐藏*/
        addParamsDialogVisible: false,
        /*添加参数对话框表单数据源*/
        addParamsForm: {
          attr_name: ''
        },
        /*添加参数对话框表单验证规则*/
        addParamsRules: {
          attr_name: [{ required: true, message: '数据不能为空', trigger: 'blur' }]
        },
        /*控制编辑参数对话框显示、隐藏*/
        editParamsDialogVisible: false,
        /*编辑参数对话框表单数据源*/
        editParamsForm: {
          attr_id: 0,
          attr_name: ''
        },
        /*编辑参数对话框表单验证规则*/
        editParamsRules: {
          attr_name: [{ required: true, message: '数据不能为空', trigger: 'blur' }]
        },
      }
    },
    created() {
      this.getCateData()
    },
    computed: {
      /*控制参数按钮的显示状态*/
      isDisabled() {
        return this.cateSelected === 3;
      },
      /*获取对话框title*/
      dialogTitle() {
        if (this.paramsActiveName === 'many') {
          return '参数'
        }
        return '属性'
      }
    },
    methods: {
      /*获取商品分类数据源*/
      getCateData() {
        request({
          method: 'get',
          url: 'categories',
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.cateData = res.data
        })
      },
      /*根据分类id获取分类参数详情数据*/
      getCateDataDetail() {
        request({
          method: 'get',
          url: `categories/${this.cateId}/attributes`,
          params: {
            sel: this.paramsActiveName
          }
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          //将attr_vals属性转换为array类型
          res.data.forEach((item, i) => {
            res.data[i].attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []
            res.data[i].inputVisible = false
            res.data[i].inputValue = ''
          })
          this.addParamsData = res.data
        })
      },
      /*监听选择商品分类改变*/
      selectGoodsHandleChange(value) {
        this.cateSelected = value.length
        if (value.length === 3) {
          this.cateId = value[2]
          //发送请求、获取数据
          this.getCateDataDetail()
        } else {
          //清空table数据
          this.addParamsData = []
          this.cateId = 0
          this.cateForm = {}
        }
      },
      /*参数配置*/
      paramsHandleClick() {
        //发送请求、获取数据
        this.getCateDataDetail()
      },
      /*打开添加参数对话框*/
      showAddParamsDialog() {
        //显示对话框
        this.addParamsDialogVisible = true
      },
      /*关闭添加参数对话框*/
      addParamsDialogClosed() {
        //置空表单
        this.$refs.addParamsRef.resetFields()
      },
      /*提交添加参数表单*/
      addParamsSubmit() {
        //效验数据
        this.$refs.addParamsRef.validate(valid => {
          if (!valid) return this.$message.error("数据不能为空")
          //效验通过，发送数据请求
          request({
            method: 'post',
            url: `categories/${this.cateId}/attributes`,
            data: {
              attr_name: this.addParamsForm.attr_name,
              attr_sel: this.paramsActiveName
            }
          }).then(res => {
            if (res.meta.status !== 201) {
              return this.$message.error(res.meta.msg)
            }
            //刷新商品分类table数据源
            this.getCateDataDetail()
          })
        })
        //关闭对话框
        this.addParamsDialogVisible = false
      },
      /*编辑参数对话框表单提交*/
      editParamsSubmit() {
        //效验数据
        this.$refs.editParamsRef.validate(valid => {
          if (!valid) return this.$message.error("数据不能为空")
          //发送编辑参数请求
          request({
            method: 'put',
            url: `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
            data: {
              attr_name: this.editParamsForm.attr_name,
              attr_sel: this.paramsActiveName
            }
          }).then(res => {
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            //提示
            this.$message.success(res.meta.msg)
            //刷新table数据
            this.getCateDataDetail()
            //关闭对话框
            this.editParamsDialogVisible = false
          })
        })
      },
      /*打开编辑对话框*/
      showEditParamsDialog(params) {
        this.editParamsForm.attr_name = params.attr_name
        this.editParamsForm.attr_id = params.attr_id
        this.editParamsDialogVisible = true
      },
      /*删除提示打开*/
      showMessageBox(attr_id) {
        this.$confirm(`此操作将永久删除该${this.dialogTitle}, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          //发送删除请求
          request({
            method: 'delete',
            url: `categories/${this.cateId}/attributes/${attr_id}`
          }).then(res => {
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            //删除成功
            //提示
            this.$message.success(res.meta.msg)
            //刷新table
            this.getCateDataDetail()
          })
        }).catch(err => {
          this.$message.error("取消了删除")
        })
      },
      /*监听动态编辑标签enter、blur事件*/
      handleInputConfirm: function (row) {
        //判断输入框中的值是否为空
        if (!row.inputValue.trim()) {
          //input置空
          row.inputValue = ''
          //隐藏input框
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue)
        this.updateParamsTag(row)
        //清空input框
        row.inputValue = ''
        //隐藏input框
        row.inputVisible = false
      },
      /*移除标签*/
      removeTag(row, index) {
        row.attr_vals.splice(index, 1)
        this.updateParamsTag(row)
      },
      /*更新分类标签数据源*/
      updateParamsTag(row) {
        //发送请求，更新数据源
        request({
          method: 'put',
          url: `categories/${this.cateId}/attributes/${row.attr_id}`,
          data: {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(" ")
          }
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          //提示
          this.$message.success(res.meta.msg)
        })
      },
      /*监听动态标签button点击*/
      showInput(row) {
        //显示输入框
        row.inputVisible = true
        //自动获取动态编辑标签焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }
    },
  }
</script>

<style scoped>
  .el-alert {
    margin-bottom: 15px;
  }

  .el-tabs {
    margin-top: 15px;
  }

  .el-tag {
    margin: 10px;
  }
</style>