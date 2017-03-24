<template>
  <div class="check">
    <div class="container">
      <div class="point-wrapper" v-for="(item,itemIndex) in check">
        <div class="point" v-for="(point,pointIndex) in item.wrapper">
          <div class="center"
               :value="point.value"
               :class="{active: point.isActive}"
               @touchstart="getFocus($event,itemIndex,pointIndex)"
               @touchmove="getMove($event,itemIndex,pointIndex)"
               @touchend="getBlur"
          ></div>
        </div>
      </div>
    </div>
    <div class="tips">{{tipsShow}}</div>
    <div class="tool">
      <div class="set-paw">
        <input type="radio" name="paw" id="set_paw" :checked="setPaw" @click="selectModel($event)">
        <label for="set_paw">设置密码</label>
      </div>
      <div class="check-paw">
        <input type="radio" name="paw" id="check_paw" :checked="!setPaw" @click="selectModel($event)">
        <label for="check_paw">验证密码</label>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import {saveLocalStorage, getLocalStorage} from '@/common/js/store'
  export default {
    name: '',
    data () {
      return {
        check: [],
        check_backup: [
          {
            wrapper: [
              {
                value: [0, 0],
                isActive: false
              },
              {
                value: [0, 1],
                isActive: false
              },
              {
                value: [0, 2],
                isActive: false
              }
            ]
          },
          {
            wrapper: [
              {
                value: [1, 0],
                isActive: false
              },
              {
                value: [1, 1],
                isActive: false
              },
              {
                value: [1, 2],
                isActive: false
              }
            ]
          },
          {
            wrapper: [
              {
                value: [2, 0],
                isActive: false
              },
              {
                value: [2, 1],
                isActive: false
              },
              {
                value: [2, 2],
                isActive: false
              }
            ]
          }
        ],
        activeCount: 0,
        value: [],
        tips: {
          first: '请输入手势密码',
          short: '密码太短，至少需要5个点',
          again: '请再次输入手势密码',
          forbidden: '密码不正确',
          success: '密码正确!',
          err: '两次密码不一致',
          save: '密码保存成功'
        },
        tipsShow: '请输入手势密码',
        setPaw: true,
        password: [[], []],
        inputCount: 0
      }
    },
    props: ['user'],
    mounted () {
      this.check = this.clone(this.check_backup);
    },
    methods: {
      // 选取工作模式
      selectModel (event) {
        this.reset();
        event.target.id === 'set_paw' ? this.setPaw = true : this.setPaw = false;
      },
      // 深度复制对象
      clone (obj) {
        let tmp;
        if (obj instanceof Array) {
          tmp = [];
          let len = obj.length;
          for (let i = 0; i < len; i++) {
            tmp[i] = this.clone(obj[i]);
          }
          return tmp;
        } else if (obj instanceof Object) {
          tmp = {};
          for (let k in obj) {
            tmp[k] = this.clone(obj[k]);
          }
          return tmp;
        } else {
          return obj;
        }
      },
      // 清除所有数据
      reset () {
        this.password = [[], []];
        this.inputCount = 0;
        this.confirm();
      },
      // 再次输入清空部分数据
      confirm () {
        this.check = this.clone(this.check_backup);
        this.activeCount = 0;
        this.value = [];
        this.tipsShow = this.tips.first;
      },
      // 获得焦点
      getFocus (event, itemIndex, pointIndex) {
        let em = this.check[itemIndex].wrapper[pointIndex];
        em.isActive = true;
        this.value = em.value.toString();
        this.activeCount++;
        this.password[this.inputCount].push(this.value);
      },
      // 开始移动
      getMove (event, itemIndex, pointIndex) {
        // 获取真实元素
        let newEm = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);
        if (newEm.className !== 'center') {
          return;
        }
        // 获取元素value
        let newValue = newEm.getAttribute('value');
        if (newValue !== null) {
          // 上一个点的value坐标
          let oldItemIndex = this.value.substr(0, 1);
          let oldPointIndex = this.value.substr(2);
          // 当前点的value坐标
          let itemIndex = newValue.substr(0, 1);
          let pointIndex = newValue.substr(2);
          // 获取x,y差值
          let diffX = Math.abs(itemIndex - oldItemIndex);
          let diffY = Math.abs(pointIndex - oldPointIndex);
          // 此情况只存在对顶角
          if (diffX === 2 && diffY === 2) {
            let start, end;
            if (pointIndex > oldPointIndex) {
              end = pointIndex;
              start = oldPointIndex;
            } else {
              end = oldPointIndex;
              start = pointIndex;
            }
            for (let i = start; i <= end; i++) {
              if (this.check[i].wrapper[i].isActive) {
                this.value = `${i},${i}`;
                this.check[i].wrapper[i].isActive = true;
                this.activeCount++;
                this.password[this.inputCount].push(this.value);
              }
            }
          } else if (diffX === 0) {
            // 同排
            let start, end;
            if (pointIndex > oldPointIndex) {
              end = pointIndex;
              start = oldPointIndex;
            } else {
              end = oldPointIndex;
              start = pointIndex;
            }
            for (let i = start; i <= end; ++i) {
              if (!this.check[itemIndex].wrapper[i].isActive) {
                this.value = `${itemIndex},${i}`;
                this.check[itemIndex].wrapper[i].isActive = true;
                this.activeCount++;
                this.password[this.inputCount].push(this.value);
              }
            }
          } else if (diffY === 0) {
            // 同列
            let start, end;
            if (itemIndex > oldItemIndex) {
              end = itemIndex;
              start = oldItemIndex;
            } else {
              end = oldItemIndex;
              start = itemIndex;
            }
            for (let i = start; i <= end; i++) {
              if (!this.check[i].wrapper[pointIndex].isActive) {
                this.value = `${i},${pointIndex}`;
                this.check[i].wrapper[pointIndex].isActive = true;
                this.activeCount++;
                this.password[this.inputCount].push(this.value);
              }
            }
          } else {
            this.value = `${itemIndex},${pointIndex}`;
            this.check[itemIndex].wrapper[pointIndex].isActive = true;
            this.activeCount++;
            this.password[this.inputCount].push(this.value)
          }
        }
      },
      // 比较两次密码是否一致
      comparePassword () {
        if (this.password[0].toString() === this.password[1].toString()) {
          saveLocalStorage(this.user.id, 'password', this.password[0]);
          this.reset();
          this.tipsDelay(this.tips.save);
        } else {
          this.reset();
          this.tipsDelay(this.tips.err);
        }
      },
      // 设置密码模式
      setPassword () {
        // 如果密码少于5位 false
        if (this.activeCount < 5) {
          this.reset();
          this.tipsDelay(this.tips.short);
        } else {
          this.inputCount++;
          // 再输入一次
          if (this.inputCount !== 2) {
            this.confirm();
            this.tipsShow = this.tips.again;
          } else {
            // 比较两次密码是否一致
            this.comparePassword()
          }
        }
      },
      // 验证密码模式
      checkPassword () {
        if (this.activeCount < 5) {
          this.tipsShow = this.tips.forbidden;
          return;
        }
        let password = getLocalStorage(this.user.id, 'password', 'none');
        if (password.toString() === this.password[0].toString()) {
          this.reset();
          this.tipsDelay(this.tips.success);
        } else {
          this.reset();
          this.tipsDelay(this.tips.forbidden);
        }
      },
      // 手指离开屏幕触发事件
      getBlur () {
        if (this.setPaw) {
          this.setPassword();
        } else {
          this.checkPassword();
        }
      },
      // tips延迟显示
      tipsDelay (value) {
        this.tipsShow = value;
        setTimeout(() => {
          this.tipsShow = this.tips.first;
        }, 800)
      }
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  .check
    position absolute
    top 41px
    left 0
    bottom 0
    width 100%
    padding 70px
    box-sizing border-box
    background rgba(240, 240, 242, 1)
    .container
      width 235px
      height 235px
      display flex
      flex-direction column
      .point-wrapper
        display flex
        flex 1
        .point
          flex 1
          text-align center
          align-items center
          .center
            display inline-block
            width 40px
            height 40px
            position relative
            top 50%
            margin-top -20px
            border 1px solid #c3c3c4
            border-radius 50%
            background #fff
            &.active
              background #ffa726
              border 1px solid #fd8d00
    .tips
      margin-top 40px
      text-align center
      font-size 16px
      line-height 16px
    .tool
      margin-top 50px
      .set-paw, .check-paw
        padding 15px 0
        input[type=radio]
          vertical-align top
        label
          display inline-block
          vertical-align top
          font-size 14px
          line-height 16px
          margin-left 20px
</style>
