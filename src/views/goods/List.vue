<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索，添加商品行-->
      <el-row :gutter="20">
        <!--搜索列-->
        <el-col :span="8">
          <el-input v-model="goodsListParams.query" clearable placeholder="请输入内容" >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!--添加商品列-->
        <el-col :span="4">
          <el-button @click="toAddGoods" type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品表格区域-->
      <el-table :data="goodsList" stripe style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量(个)" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="120px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="170px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button @click="removeGoods(scope.row.goods_id)" type="danger" size="mini" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :current-page="goodsListParams.pagenum" :page-sizes="[5, 10, 30, 50]" :page-size="goodsListParams.pagesize"
              layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import {request} from "plugins/network";

  export default {
    name: "list",
    data() {
      return {
        /*商品列表参数*/
        goodsListParams: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        /*商品列表数据源*/
        goodsList: [],
        /*总记录数*/
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      /*获取商品列表数据源*/
      getGoodsList() {
        request({
          method: 'get',
          url: 'goods',
          params: this.goodsListParams
        }).then(res => {
          //状态码不正确，提示错误信息
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          //正确，给数据源赋值
          this.goodsList = res.data.goods
          this.total = res.data.total
        })
      },
      /*分页控件-每页显示数发生改变*/
      handleSizeChange(newValue) {
        this.goodsListParams.pagesize = newValue
        this.getGoodsList()
      },
      /*分页控件-当前页发生改变*/
      handleCurrentChange(newValue) {
        this.goodsListParams.pagenum = newValue
        this.getGoodsList()
      },
      /*跳转到add路由*/
      toAddGoods() {
        this.$router.push("/add")
      },
      /*监听删除按钮*/
      removeGoods(id) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //发送删除请求
          request({
            method: 'delete',
            url: `goods/${id}`
          }).then(res => {
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            //删除成功,提示
            this.$message.success(res.meta.msg)
            //刷新列表数据
            this.getGoodsList()
          })
        }).catch(() => {
          this.$message.error("取消了删除")
        });
      }
    }
  }
</script>

<style scoped>

</style>