<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--添加角色区域-->
      <el-row>
        <el-col :span="6">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" stripe>
        <el-table-column type="expand">
          <!--角色信息展开区域-->
          <template slot-scope="scope">
            <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id"
                    :class="['cus-el-row', 'cus-el-row-center', index1===0 ? 'cus-el-row-top' : '']">
              <!--一级权限-->
              <el-col :span="5">
                <el-tag closable @close="showDeleteDialog(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级、三级权限区域-->
              <el-col :span="19">
                <el-row v-for="(item2, index2) in item1.children"
                        :key="item2.id"
                        :class="['cus-el-row-center','cus-el-row-padding', index2===0 ? '' : 'cus-el-row-top']">
                  <!--二级权限-->
                  <el-col :span="8">
                    <el-tag closable @close="showDeleteDialog(scope.row, item2.id)" type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--三级权限区域-->
                  <el-col :span="16">
                    <el-tag closable v-for="(item3, index3) in item2.children" :key="item3.id"
                            class="cus-item3" type="warning" @close="showDeleteDialog(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" @click="" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" @click="" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" @click="showRightDialog(scope.row)" icon="el-icon-setting" size="mini">权限分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--权限分配对话框区域-->
    <el-dialog title="权限分配" :visible.sync="rightDialogVisible" @close="rightDialogClosed" width="50%">
      <!--树型权限内容区域-->
      <el-tree :data="rightList" default-expand-all ref="rightTree"
               :default-checked-keys="defaultRightList"
               show-checkbox node-key="id" :props="rightDefaultProps"></el-tree>
      <!--确认、取消按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleRight()">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Roles",
    data() {
      return {
        roleId: 0,
        /*角色数据*/
        roleList: [],
        /*控制权限分配对话框，显示或隐藏*/
        rightDialogVisible: false,
        /*权限分配对话框中所有权限信息*/
        rightList: [],
        /*配置权限分配树形结构字段：标签值、子分支*/
        rightDefaultProps: {
          label: 'authName',
          children: 'children'
        },
        /*默认展开权限分配选中的权限列表*/
        defaultRightList: []
      }
    },
    created() {
      this.findRoleList()
    },
    methods: {
      /*发送请求，获取所有角色信息*/
      findRoleList() {
        request({
          method: 'get',
          url: 'roles'
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.roleList = res.data
        })
      },
      /*展示删除权限对话框*/
      showDeleteDialog(role, rightId) {
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //发送请求，删除权限
          request({
            method: 'delete',
            url: `roles/${role.id}/rights/${rightId}`
          }).then(res => {
            console.log(res);
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }
            role.children = res.data
            this.$message.success(res.meta.msg)
          })
        }).catch(() => {
          this.$message.info("取消了删除")
        });
      },
      /*显示权限分配对话框*/
      showRightDialog(role) {
        //发送请求，获取所有权限信息
        request({
          method: 'get',
          url: 'rights/tree'
        }).then(res => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.rightList = res.data
        })
        //获取该角色下所有的三级权限id
        this.filterRightId(role, this.defaultRightList)
        //显示对话框
        this.rightDialogVisible = true
        //设置角色id
        this.roleId = role.id
      },
      /*递归，得到角色下的三级权限id*/
      filterRightId(node, array) {
        //判断该节点，是否为三级权限
        if (!node.children) {
          return array.push(node.id)
        }
        //递归调用
        node.children.forEach(item => this.filterRightId(item, array))
      },
      /*关闭分配权限对话框的回调函数*/
      rightDialogClosed() {
        //清空默认展开权限分配选中的权限列表
        this.defaultRightList = []
      },
      /*发送请求，更新角色权限*/
      updateRoleRight() {
        //获取被选中和半选状态的节点key
        const array = [this.$refs.rightTree.getCheckedKeys(), this.$refs.rightTree.getHalfCheckedKeys()]
        const ids = array.join(',')
        request({
          method: 'post',
          url: `roles/${this.roleId}/rights`,
          data: {
            rids: ids
          }
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error("更新角色权限失败！")
          }
          this.$message.success(res.meta.msg)
        })
        //刷新权限列表
        this.findRoleList()
        //关闭对话框
        this.rightDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .cus-el-row {

    border-bottom: solid 1px #eeeeee;
  }

  .cus-el-row-padding {
    padding: 10px 0;
  }

  .cus-el-row-top {
    border-top: solid 1px #eeeeee;
  }

  .cus-el-row-center {
    display: flex;
    align-items: center;
  }

  .cus-item3 {
    margin: 5px 10px 5px 0;
  }


</style>