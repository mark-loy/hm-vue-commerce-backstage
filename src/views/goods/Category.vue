<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!--表格内容区域-->
      <zk-table :data="goodsCateList" :columns="goodsCateColumns"
                show-index index-text="#" :expand-type="false" :selection-type="false">
        <!--是否有效区域-->
        <template slot="isOk" slot-scope="scope">
          <i :class="['el-icon-success', 'cus-icon-success']" v-if="scope.row.cat_deleted === true"></i>
          <i :class="['el-icon-error', 'cus-icon-error']" v-else></i>
        </template>
        <!--级别区域-->
        <template slot="level" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">级别一</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">级别二</el-tag>
          <el-tag size="mini" v-else type="danger">级别三</el-tag>
        </template>
        <!--操作区域-->
        <template slot="option">
          <el-button size="mini" type="primary">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
        </template>
      </zk-table>
      <!--分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="goodsCateInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="goodsCateInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="goodsCateTotal">
      </el-pagination>
    </el-card>
    <!--添加分类对话框区域-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" @close="addCateClosed" width="50%">
      <!--表单区域-->
      <el-form :model="addCateForm" ref="addCateRef" :rules="addCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" ></el-input>
        </el-form-item>
        <el-form-item label="当前分类">
          <el-cascader v-model="addCateForm.cat_pid" :options="addCateData"
                       :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                       @change="handleChange" change-on-select clearable style="width: 100%" >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Category",
    data() {
      return {
        /*商品分类分页数据*/
        goodsCateInfo: {
          pagenum: 1,
          pagesize: 5
        },
        /*商品分类列表数据*/
        goodsCateList: [],
        /*商品分类总记录数*/
        goodsCateTotal: 0,
        /*商品分类表格列属性设置*/
        goodsCateColumns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            prop: 'cat_deleted',
            type: 'template',
            template: 'isOk',
          },
          {
            label: '等级',
            prop: 'cat_level',
            type: 'template',
            template: 'level',
          },
          {
            label: '操作',
            type: 'template',
            template: 'option',
          }
        ],
        /*控制添加分类对话框显示、隐藏*/
        addCateDialogVisible: false,
        /*添加分类表单*/
        addCateForm: {
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },
        /*添加分类表单验证规则*/
        addCateRules: {
          cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
        },
        /*添加分类数据源*/
        addCateData: []
      }
    },
    created() {
      this.getGoodsCateList()
    },
    methods: {
      /*查询商品分类数据*/
      getGoodsCateList() {
        request({
          method: 'get',
          url: 'categories',
          params: {
            pagenum: this.goodsCateInfo.pagenum,
            pagesize: this.goodsCateInfo.pagesize
          }
        }).then(res => {
          this.goodsCateList = res.data.result
          this.goodsCateTotal = res.data.total
        })
      },
      /*分页显示数控制*/
      handleSizeChange(newValue) {
        this.goodsCateInfo.pagesize = newValue
        this.getGoodsCateList()
      },
      /*当前页控制*/
      handleCurrentChange(newValue) {
        this.goodsCateInfo.pagenum = newValue
        this.getGoodsCateList()
      },
      /*展示添加分类对话框,获取数据源*/
      showAddCateDialog() {
        //获取添加分类数据源
        request({
          method: 'get',
          url: 'categories',
          params: {
            type: 2
          }
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          //设置级联选择器设置数据源
          this.addCateData = res.data
        })
        //显示对话框
        this.addCateDialogVisible = true
      },
      /*监听级联选择器发生改变*/
      handleChange(value) {
        //判断value的长度；0：表示未选择父分类，1：表示选择一级父分类，2：表示选择二级父分类
        if (value.length > 0) {
          this.addCateForm.cat_level = value.length
          this.addCateForm.cat_pid = value[value.length - 1]
        }
      },
      /*提交添加分类表单数据*/
      addCateSubmit() {
        //数据效验
        this.$refs.addCateRef.validate(valid => {
          //效验不通过
          if (!valid) {
            return this.$message.error('请填写分类名称')
          } else {
            //效验通过
            request({
              method: 'post',
              url: 'categories',
              data: this.addCateForm
            }).then(res => {
              console.log(res);
              if (res.meta.status !== 201) {
                return this.$message.error(res.meta.msg)
              }
              this.$message.success(res.meta.msg)
              //刷新列表
              this.getGoodsCateList()
            })
          }
        })
        //关闭添加分类对话框
        this.addCateDialogVisible = false
      },
      /*监听添加分类对话框关闭*/
      addCateClosed() {
        //将关闭对话框后的表单置空
        this.$refs.addCateRef.resetFields()
      }
    }
  }
</script>

<style scoped>
  .cus-icon-success {
    color: green;
  }

  .cus-icon-error {
    color: red;
  }

  .zk-table {
    margin-top: 15px;
  }
</style>