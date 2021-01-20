import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
/*导入公共js库*/
import 'common/utils'
/*导入element-ui*/
import 'plugins/element'
/*导入table-tree*/
import ZkTable from 'vue-table-with-tree-grid'
Vue.component(ZkTable.name, ZkTable)
/*导入富文本编辑器*/
import VueQuillEditor from 'vue-quill-editor'
/*导入富文本编辑器样式*/
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
/*全局安装富文本编辑器*/
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
