/* eslint-disable */
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let A = new Vue({
  render: h => h(App),
}).$mount('#app')
