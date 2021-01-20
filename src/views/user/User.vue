<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--内容区域-->
    <el-card class="box-card">
      <div class="search_box">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input clearable placeholder="请输入用户名" v-model="queryParam.query" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="userInfo"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="showDialog">添加员工</el-button>
          </el-col>
        </el-row>
      </div>
      <!--员工信息区域-->
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮件"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="updateState(scope.row)" active-color="#13ce66"
                       inactive-color="#ff4949"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑员工" placement="top-start" :enterable="false">
              <el-button type="primary" @click="showEditDialog(scope.row.id)" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除员工" placement="top-start" :enterable="false">
              <el-button type="danger" @click="openDeleteConfirm(scope.row.id)" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="角色分配" placement="top-start" :enterable="false">
              <el-button type="warning" @click="showRoleDialog(scope.row)" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryParam.pagenum" :page-sizes="[1, 2, 5, 10]"
                     :page-size="queryParam.pagesize" :total="totalCount"
                     layout="total, sizes, prev, pager, next, jumper">

      </el-pagination>
    </el-card>
    <!--添加员工对话框区域-->
    <el-dialog title="添加用户" @close="addUserFormClose" :visible.sync="dialogVisible" width="50%">
      <!--员工表单区域-->
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!--取消，确认按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserClick">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改员工对话框区域-->
    <el-dialog title="修改用户" @close="editUserFormClose" :visible.sync="editDialogVisible" width="50%">
      <!--员工表单区域-->
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input disabled v-model="editUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!--取消，确认按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserClick">确 定</el-button>
      </span>
    </el-dialog>

    <!--角色设置对话框-->
    <el-dialog title="角色分配" :visible.sync="roleDialogVisible" @close="roleDialogClosed" width="50%">
      <div>
        <p>当前用户： {{userInfo.username}}</p>
        <p>当前角色： {{userInfo.role_name}}</p>
        <p class="cus-select">
          修改角色为：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleInfo" :key="item.id"
                       :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="roleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="updateUserRole">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "User",
    data() {
      const checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          //效验通过
          return callback()
        }
        callback(new Error('请填写合法的电话'))
      };
      const checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          //效验通过
          return callback()
        }
        callback(new Error('请填写合法的邮箱'))
      }
      return {
        tableData: [],
        queryParam: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        totalCount: 0,
        dialogVisible: false,
        /*添加员工表单数据*/
        addUserForm: {
          username: '',
          password: '',
          mobile: '',
          email: '',
        },
        /*添加员工表单数据验证*/
        addUserFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入电话', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
        },
        editDialogVisible: false,
        editUserForm: {
          id: 0,
          username: '',
          mobile: '',
          email: '',
        },
        editUserFormRules: {
          mobile: [
            {required: true, message: '请输入电话', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
        },
        /*控制角色分配对话框显示、隐藏*/
        roleDialogVisible: false,
        /*当前的用户信息*/
        userInfo: {},
        /*所有的角色信息*/
        roleInfo: [],
        /*select选择的角色信息*/
        selectedRoleId: ''
      }
    },
    created() {
      //获取员工信息
      this.getUserInfo()
    },
    methods: {
      /*获取员工信息*/
      getUserInfo() {
        request({
          url: 'users',
          params: this.queryParam
        }).then(res => {
          /*请求失败，弹出错误信息*/
          if (res.meta.status !== 200) {
            this.$message.error(res.meta.msg)
            return false
          }
          /*请求成功，响应数据*/
          this.tableData = res.data.users
          this.totalCount = res.data.total
        })
      },
      /*修改员工状态*/
      updateState(userInfo) {
        request({
          method: 'put',
          url: 'users/' + userInfo.id + '/state/' + userInfo.mg_state
        }).then(res => {
          if (res.meta.status !== 200) {
            this.$message.error(res.meta.msg)
          } else {
            this.$message.success(res.meta.msg)
          }
        })
      },
      handleSizeChange(newValue) {
        this.queryParam.pagesize = newValue
        this.getUserInfo()
      },
      handleCurrentChange(newValue) {
        this.queryParam.pagenum = newValue
        this.getUserInfo()
      },
      showDialog() {
        this.dialogVisible = true
      },
      /*关闭添加用户对话框时，回调函数*/
      addUserFormClose() {
        //重置对话框
        this.$refs.addUserFormRef.resetFields()
      },
      addUserClick() {
        //效验表单
        this.$refs.addUserFormRef.validate(valida => {
          if (!valida) {
            this.$message.error("填写合法信息")
          } else {
            //效验成功，发送请求
            request({
              method: 'post',
              url: 'users',
              data: this.addUserForm
            }).then(res => {
              console.log(res);
              if (res.meta.status !== 201) {
                this.$message.error(res.meta.msg)
              } else {
                this.$message.success(res.meta.msg)
              }
            })
          }
        })
        //重新获取表单数据
        this.getUserInfo()
        //隐藏对话框
        this.dialogVisible = false
      },
      /*显示修改用户对话框，并根据id查询用户信息*/
      showEditDialog(id) {
        this.editDialogVisible = true
        request({
          url: 'users/' + id,
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          } else {
            this.editUserForm.id = res.data.id
            this.editUserForm.username = res.data.username
            this.editUserForm.mobile = res.data.mobile
            this.editUserForm.email = res.data.email
          }
        })
      },
      /*关闭修改用户对话框时，回调函数*/
      editUserFormClose() {
        //重置对话框
        this.$refs.editUserFormRef.resetFields()
      },
      /*效验并提交修改用户信息*/
      editUserClick() {
        this.$refs.editUserFormRef.validate(valid => {
          if (!valid) {
            return false
          } else {
            //效验成功，发送修改用户请求
            request({
              method: 'put',
              url: '/users/' + this.editUserForm.id,
              data: {
                mobile: this.editUserForm.mobile,
                email: this.editUserForm.email
              }
            }).then(res => {
              if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
              //关闭对话框
              this.editDialogVisible = false
              //刷新用户列表
              this.getUserInfo()
              //弹出提示信息
              this.$message.success(res.meta.msg)
            })
          }
        })
      },
      /*删除员工，弹出提示框*/
      openDeleteConfirm(id) {
        this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //发送请求，根据id删除员工
          request({
            method: 'delete',
            url: 'users/' + id
          }).then(res => {
            console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error(res.meta.msg)
              return
            } else {
              this.$message.success("删除用户成功")
            }
            //刷新用户列表
            this.getUserInfo()
          })
        }).catch(() => {
          this.$message.info("删除用户取消")
        });
      },
      /*显示角色分配对话框*/
      showRoleDialog(role) {
        //设置当前用户信息
        this.userInfo.id = role.id
        this.userInfo.username = role.username
        this.userInfo.role_name = role.role_name
        //获取所有的角色信息
        request({
          method: 'get',
          url: 'roles'
        }).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.roleInfo = res.data
        })
        //显示对话框
        this.roleDialogVisible = true
      },
      /*更新当前用户的角色信息*/
      updateUserRole() {
        console.log('用户id'+this.userInfo.id);
        console.log('角色id'+this.selectedRoleId);

        //发送请求，更新用户角色信息
        request({
          method: 'put',
          url: `users/${this.userInfo.id}/role`,
          data: {
            rid: this.selectedRoleId
          }
        }).then(res => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
        })
        //关闭对话框
        this.roleDialogVisible = false
      },
      /*关闭角色分配对话框时，回调函数*/
      roleDialogClosed() {
        //将用户信息、选择的角色信息置空
        this.userInfo = {}
        this.selectedRoleId = ''
      }
    }
  }
</script>

<style scoped>

  .search_box {
    margin-bottom: 20px;
  }

  .cus-select {
    margin-top: 10px;
  }
</style>