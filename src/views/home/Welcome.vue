<template>
  <h2>
    欢迎{{username}}
  </h2>
</template>
<script>
  export default {
    name: "Welcome",
    computed: {
      username() {
        return window.sessionStorage.getItem("user")
      }
    }
  }
</script>

<style scoped>
  h2 {
    font-size: 30px;
    color: #333333;
  }
</style>