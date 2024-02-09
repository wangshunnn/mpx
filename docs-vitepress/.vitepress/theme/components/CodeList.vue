<template>
  <div class="code-list">
    <div class="code-list__item" v-for="(item, index) in dataList" :key="index">
      <img width="150" height="170" :src="item.code" alt="code" loading="lazy" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      current: -1
    }
  },
  methods: {
    handleEnter (index) {
      this.current = index
    },
    handleLeave () {
      this.current = -1
    }
  }
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition all 0.3s
.fade-enter, .fade-leave-to
  opacity 0
.code-list
  margin-top 40px
  display flex
  .code-list__item
    margin-right 62px
    width 150px
    height 170px
    cursor pointer
  .code-list__inner
    position relative
  .code-list__big
    position absolute
    left 0
    top 0
    transform scale(1.5)
</style>