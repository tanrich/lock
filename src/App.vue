<template>
  <div id="app" @touchmove.prevent>
    <v-header></v-header>
    <check :user="user"></check>
  </div>
</template>

<script>
  import check from '@/components/check/check'
  import header from '@/components/header/header'
  import {urlParse} from '@/common/js/util'
  export default {
    name: 'app',
    data () {
      return {
        user: {
          id: (() => {
            let queryParam = urlParse();
            return queryParam.id;
          })()
        }
      }
    },
    components: {
      check,
      'v-header': header
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  #app
    font-family: 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
</style>
