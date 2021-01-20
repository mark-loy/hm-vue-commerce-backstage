<template>
  <el-container>
    <!--头部区域-->
    <el-header>
      <!--图标-->
      <div>
        <span>电商后台管理系统</span>
      </div>
      <!--退出按钮-->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--内容区域-->
    <el-container>
      <!--侧边栏区域-->
      <el-aside :width="collapse ? '64px' : '200px'">
        <!--折叠菜单按钮-->
        <div class="fold" @click="foldClick">|||</div>
        <!--菜单-->
        <el-menu :default-active="activePath" :collapse="collapse" :collapse-transition="false"
                 unique-opened router background-color="#545c64" text-color="#fff" active-text-color="#409eff">
          <el-submenu v-for="items in asidesList" :key="items.id" :index="items.id + ''">
            <template slot="title">
              <i :class="asidesMenu[items.id]" style="margin-right: 10px"></i>
              <span>{{items.authName}}</span>
            </template>
            <el-menu-item v-for="item in items.children" :key="item.id" :index="'/' + item.path" @click="activePathClick('/' + item.path)">
              <i class="el-icon-menu"></i>
              <span>{{item.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--主体区域-->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Home",
    data() {
      return {
        asidesList: [],
        asidesMenu: {
          '125': 'iconfont icon-user-group',
          '103': 'iconfont icon-quanxianguanli',
          '101': 'iconfont icon-shangpinguanli',
          '102': 'iconfont icon-header-06',
          '145': 'iconfont icon-shujutongji',
        },
        collapse: false,
        activePath: ''
      }
    },
    methods: {
      logout() {
        //退出登录，清空sessionStorage
        window.sessionStorage.clear()
        this.$router.push("/login")
      },
      menuList() {
        request({
          url: 'menus'
        }).then(res => {
          if (res.meta.status === 200) {
            this.asidesList = res.data
          }
        })
      },
      foldClick() {
        this.collapse = !this.collapse
      },
      activePathClick(activePath) {
        window.sessionStorage.setItem("activePath", activePath)
        this.activePath = activePath
      }
    },
    created() {
      //获取侧边栏数据
      this.menuList()
      this.activePath = window.sessionStorage.getItem("activePath")
    }
  }
</script>

<style scoped>
  .el-container {
    height: 100vh;
    color: #cccccc;
  }

  .fold {
    width: 100%;
    background-color: #4a5064;
    text-align: center;
    line-height: 24px;
    letter-spacing: .2em;
    cursor: pointer;
  }

  .el-menu {
    border-right: none;
  }

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #363d40;
    font-size: 16px;
  }

  .el-header div {
    font-size: 16px;
  }

  .el-aside {
    background-color: #313743;
  }

  .el-main {
    background-color: #e9edf1;
  }
</style>