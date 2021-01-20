<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片内容区域-->
    <el-card>
      <el-table :data="powerList" stripe style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名" ></el-table-column>
        <el-table-column prop="path" label="权限路径" ></el-table-column>
        <el-table-column prop="level" label="权限等级" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">等级一</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">等级二</el-tag>
            <el-tag type="warning" v-else>等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "Rights",
    data() {
      return {
        /*权限列表数据*/
        powerList: []
      }
    },
    created() {
      this.findPowerList()
    },
    methods: {
      /*查询权限列表*/
      findPowerList() {
        request({
          method: 'get',
          url: 'rights/list'
        }).then(res => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          } else {
            this.powerList = res.data
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>