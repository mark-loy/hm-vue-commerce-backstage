<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索按钮行 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="orderListParams.query">
            <el-button @click="queryOrderList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderListData" stripe style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column label="是否付款"> 
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.update_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-location"
          ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页控件区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderListParams.pagenum"
        :page-sizes="[5, 10, 30, 50]"
        :page-size="orderListParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { request } from "plugins/network";

export default {
  name: "order",
  data() {
    return {
      /* 订单列表数据源 */
      orderListData: [],
      /* 查询订单列表参数 */
      orderListParams: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      /* 订单列表总记录数 */
      total: 0
    };
  },
  created() {
    this.getOrderListData();
  },
  methods: {
    /* 获取订单列表数据源 */
    getOrderListData() {
      request({
        method: "get",
        url: "orders",
        params: this.orderListParams
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.orderListData = res.data.goods;
        this.total = res.data.total
      });
      
    },
    /* 当页显示数改变 */
    handleSizeChange(value) {
      this.orderListParams.pagesize = value
      this.getOrderListData();
    },
    /* 当前页改变 */
    handleCurrentChange(value) {
      this.orderListParams.pagenum = value
      this.getOrderListData();
    },
    /* 按条件查询订单列表 */
    queryOrderList() {
      this.getOrderListData();
    }
  },
};
</script>

<style scoped>
</style>