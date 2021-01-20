<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--提示-->
      <el-alert
        title="添加商品信息"
        type="info"
        :closable="false"
        center
        show-icon
      ></el-alert>
      <!--步骤条-->
      <el-steps
        :space="200"
        :active="stepActive - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--添加商品的表单区域-->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        label-position="top"
        ref="addGoodsRef"
        label-width="100px"
      >
        <!--tab栏-->
        <el-tabs
          v-model="stepActive"
          :before-leave="leaveTab"
          tab-position="left"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input
                v-model="addGoodsForm.goods_name"
                style="width: 40%"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodsForm.goods_price"
                type="number"
                style="width: 40%"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsForm.goods_number"
                type="number"
                style="width: 40%"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsForm.goods_weight"
                type="number"
                style="width: 40%"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat_tmp">
              <!--级联选择器-->
              <el-cascader
                v-model="goods_cat_tmp"
                :options="goodsCateData"
                clearable
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                  children: 'children',
                }"
                @change="goodsCateChange"
                style="width: 40%"
              ></el-cascader>
              {{ goods_cat_tmp }}
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <p v-for="(item, index) in goodsParamsData" :key="item.attr_id">
              <span class="attr-name">{{ item.attr_name }}</span>
              <el-checkbox-group v-model="paramsCheckBox">
                <el-checkbox
                  v-for="(item2, index) in item.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                  checked
                ></el-checkbox>
              </el-checkbox-group>
            </p>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <p v-for="(item, index) in goodsAttrData" :key="item.attr_id">
              <span class="attr-name">{{ item.attr_name }}</span>
              <el-checkbox-group v-model="attrCheckBox">
                <el-checkbox
                  v-for="(item2, index) in item.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                  checked
                ></el-checkbox>
              </el-checkbox-group>
            </p>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="imageAction"
              :on-success="imageHandleSuccess"
              :on-preview="imageHandlePreview"
              :on-remove="imageHandleRemove"
              :headers="imageHeader"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑区域-->
            <quill-editor
              v-model="addGoodsForm.goods_introduce"
              :options="editorOption"
              ref="quillEditor"
            ></quill-editor>
            <el-button
              @click="submitClick"
              type="primary"
              size="mini"
              class="btn-submit"
              >提交</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--图片预览对话框-->
    <el-dialog title="图片预览" :visible.sync="imageDialogVisible" width="50%">
      <img :src="prePath" alt="" width="100%" />
    </el-dialog>
  </div>
</template>

<script>
import { request } from "plugins/network";

export default {
  name: "Add",
  data() {
    return {
      /*控制步骤条阶段*/
      stepActive: "0",
      /* 商品分类数组 */
      goods_cat_tmp: [],
      /*添加商品表单*/
      addGoodsForm: {
        goods_name: "",
        goods_cat: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        /*富文本编辑内容*/
        goods_introduce: "",
        /*上传图片的临时路径*/
        pics: [],
        /*动态参数、静态属性数组*/
        attrs: [],
      },
      /*添加商品表单的验证规则*/
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
      /*商品分类id*/
      cateId: 0,
      /*商品分类数据源*/
      goodsCateData: [],
      /*商品参数数据源*/
      goodsParamsData: [],
      /*商品参数复选框数组*/
      paramsCheckBox: [],
      /*商品属性数据源*/
      goodsAttrData: [],
      /*商品属性复选框数组*/
      attrCheckBox: [],
      /*图片上传地址*/
      imageAction: "http://timemeetyou.com:8889/api/private/v1/upload",
      /*图片请求路径的请求头*/
      imageHeader: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      /*控制图片预览对话框显示、隐藏*/
      imageDialogVisible: false,
      /*图片预览路径*/
      prePath: "",
      /*富文本编辑的属性设置*/
      editorOption: {
        placeholder: "编辑商品内容",
      },
    };
  },
  created() {
    this.getGoodsCateData();
  },
  methods: {
    /*获取商品分类数据源*/
    getGoodsCateData() {
      request({
        method: "get",
        url: "categories",
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.goodsCateData = res.data;
      });
    },
    /*商品分类发生改变*/
    goodsCateChange(value) {
      if (value.length === 3) {
        this.cateId = value[2];
      } else {
        //清空
        this.addGoodsForm.goods_cat = [];
        this.cateId = 0;
      }
    },
    /*离开当前标签页*/
    leaveTab(activeName, oldActiveName) {
      if (this.cateId === 0) {
        this.$message.error("请选择商品分类");
        //阻止切换
        return false;
      }
      //商品参数tab
      if (activeName === "1") {
        //获取商品参数数据源
        this.getParamsOrAttrData("many");
      }
      //商品属性tab
      if (activeName === "2") {
        //获取商品属性数据源
        this.getParamsOrAttrData("only");
      }
      //允许切换tab页
      return true;
    },
    /*获取商品参数或属性数据源*/
    getParamsOrAttrData(type) {
      request({
        method: "get",
        url: `categories/${this.cateId}/attributes`,
        params: {
          sel: type,
        },
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        //转换attr_vals为array类型
        res.data.isSelected = [];
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        if (type === "many") {
          this.goodsParamsData = res.data;
        } else {
          this.goodsAttrData = res.data;
        }
      });
    },
    /*图片上传成功处理事件*/
    imageHandleSuccess(response) {
      if (response.meta.status !== 200)
        return this.$message.error(response.meta.msg);
      //设置临时路径
      this.addGoodsForm.pics.push({ pic: response.data.tmp_path });
    },
    /*图片预览处理事件*/
    imageHandlePreview(file) {
      //设置图片预览路径
      this.prePath = file.response.data.url;
      //打开图片预览对话框
      this.imageDialogVisible = true;
    },
    /*图片移除处理事件*/
    imageHandleRemove(file) {
      const tmp = file.response.data.tmp_path;
      //通过tmp在pics图片路径数组中，查找tmp的索引值
      let tmp_index = null;
      this.addGoodsForm.pics.forEach((item, index) => {
        if (item.pic === tmp) return (tmp_index = index);
      });
      if (tmp_index > -1) {
        //找到了该图片的索引值
        this.addGoodsForm.pics.splice(tmp_index, 1);
      }
    },
    /*表单提交事件*/
    submitClick() {
      this.$refs.addGoodsRef.validate((valid) => {
        if (!valid) return this.$message.error("请将表单数据填写完整");
        //将goods_cat转换为string类型
        this.addGoodsForm.goods_cat = this.goods_cat_tmp.join(",");
        //获取商品动态参数
        this.goodsParamsData.forEach((param) => {
          const info = {
            attr_id: 0,
            attr_value: "",
          };
          const params = [];
          param.attr_vals.forEach((item) => {
            //验证该动态参数是否被选择
            if (this.paramsCheckBox.indexOf(item) > -1) {
              params.push(item);
            }
          });
          info.attr_value = params.join(" ");
          info.attr_id = param.attr_id;
          this.addGoodsForm.attrs.push(info);
        });
        //获取商品静态属性
        this.goodsAttrData.forEach((attr) => {
          const info = {
            attr_id: 0,
            attr_value: "",
          };
          const attrs = [];
          attr.attr_vals.forEach((item) => {
            //验证该动态参数是否被选择
            if (this.attrCheckBox.indexOf(item) > -1) {
              attrs.push(item);
            }
          });
          info.attr_value = attrs.join(" ");
          info.attr_id = attr.attr_id;
          this.addGoodsForm.attrs.push(info);
        });
        //发送添加商品网络请求
        request({
          method: "post",
          url: "goods",
          data: this.addGoodsForm,
        }).then((res) => {
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
          //添加商品成功提示
          this.$message.success(res.meta.msg);
          //跳转商品列表
          this.$router.push("/goods");
        });
      });
    },
  },
};
</script>

<style scoped>
.el-tabs {
  margin-top: 20px;
}

.el-checkbox {
  margin: 15px 0;
}

.attr-name {
  display: block;
  margin: 15px 0;
}

.quill-editor {
  height: 250px;
  width: 70%;
  margin-bottom: 40px;
}

.btn-submit {
  margin-top: 50px;
}
</style>