<template>
  <div id="login">
    <!--表单区域-->
    <div class="login-box">
      <!--头像区域-->
      <div class="avatar-box">
        <img src="~/assets/imgs/logo.png" alt="">
      </div>
      <!--表单区域-->
      <div class="login-form">
        <el-form ref="loginForm" :model="form" :rules="rules">
          <el-form-item prop="username">
            <el-input prefix-icon="iconfont icon-yonghu" v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" prefix-icon="iconfont icon-mima" v-model="form.password"></el-input>
          </el-form-item>
          <el-form-item class="login-btn">
            <el-button type="primary" @click="submit">提交</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Login",
    data() {
      return {
        form: {
          username: 'admin',
          password: '123456'
        },
        rules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ],
        }
      }
    },
    methods: {
      resetForm() {
        this.$refs.loginForm.resetFields();
      },
      submit() {
        this.$refs.loginForm.validate(valid => {
          if (!valid) {
            this.$message.error("效验失败")
            return false;
          } else {
            request({
              method: 'post',
              url: '/login',
              data: {
                username: this.form.username,
                password: this.form.password
              }
            }).then(res => {
              if (res.meta.status !== 200) {
                this.$message.error(res.meta.msg)
              } else {
                this.$message({
                  type: "success",
                  message: "登录成功"
                })
                //保存token
                console.log(res.data);
                window.sessionStorage.setItem("token", res.data.token)
                window.sessionStorage.setItem("user", res.data.username)
                //跳转home页面
                this.$router.push("/home")
              }
            });
          }
        })
      }
    }
  }
</script>

<style scoped>

  #login {
    height: 100vh;
    background-color: #517dab;
  }

  .login-box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    width: 480px;
    height: 280px;
    background-color: #cccccc;
  }

  .avatar-box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    background-color: #cccccc;
    border: solid 1px rgba(100, 100, 100, 0.1);
    border-radius: 50%;
    box-shadow: 3px 3px rgba(100, 100, 100, 0.1);
  }

  .avatar-box img {
    width: 120px;
    border-radius: 50%;
  }

  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
  }

  .login-btn {
    display: flex;
    justify-content: flex-end;
  }

</style>