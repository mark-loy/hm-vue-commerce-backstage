import { Date } from 'core-js';
import Vue from 'vue'

/*注册日期过滤器*/
Vue.filter("dateFormat", function (dateStr) {
  const dateValue = new Date(dateStr)
  const y = dateValue.getFullYear()
  const M = (dateValue.getMonth() + 1 + '').padStart(2, '0')
  const d = (dateValue.getDate() + '').padStart(2, '0')
  const hh  = (dateValue.getHours() + '').padStart(2, '0')
  const mm = (dateValue.getMinutes() + '').padStart(2, '0')
  const ss = (dateValue.getSeconds() + '').padStart(2, '0')
  return `${y}-${M}-${d} ${hh}:${mm}:${ss}`
})