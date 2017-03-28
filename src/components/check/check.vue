<template>
  <div class="check">
    <div class="container">
      <div class="point-wrapper" v-for="(item,itemIndex) in check">
        <div class="point" v-for="(point,pointIndex) in item.wrapper">
          <div class="center"
               ref="center"
               :value="point.value"
               :class="{active: point.isActive}"
               @touchstart="getFocus($event,itemIndex,pointIndex)"
               @touchmove="getMove($event,itemIndex,pointIndex)"
               @touchend="getBlur"
          >
            <div class="line"></div>
          </div>
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
        Em: '',
        line: '',
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
        this.$refs['center'].forEach((center) => {
          center.children[0].style.visibility = 'hidden';
        });
        this.check = this.clone(this.check_backup);
        this.activeCount = 0;
        this.value = [];
        this.tipsShow = this.tips.first;
      },
      path (height, rotate, pos) {
        rotate = pos === 1 ? rotate : 180 + rotate;
        this.line.style.height = height;
        this.line.style.transform = `rotate(${rotate}deg)`;
        this.line.style.visibility = 'visible';
      },
      // 获得焦点
      getFocus (event, itemIndex, pointIndex) {
        this.Em = this.check[itemIndex].wrapper[pointIndex];
        this.Em.isActive = true;
        // 获取该点下line元素
        this.line = event.target.childNodes[0];
        this.value = this.Em.value.toString();
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
        let newLine = newEm.children[0];
        // 如果鼠标位有效（进入圆圈选中区）
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
          if (diffX === diffY) {
            let startX, endX, startY, endY, posX, posY, pos;
            // 确定Y坐标起止
            if (pointIndex > oldPointIndex) {
              endY = pointIndex;
              startY = oldPointIndex;
              posY = 1;
            } else {
              endY = oldPointIndex;
              startY = pointIndex;
              posY = 0;
            }
            // 确定X坐标起止
            if (itemIndex > oldItemIndex) {
              endX = itemIndex;
              startX = oldItemIndex;
              posX = 1;
            } else {
              endX = oldItemIndex;
              startX = itemIndex;
              posX = 0;
            }
            if ((posX === 1 && posY === 1) || (posX === 0 && posY === 1)) {
              pos = 1;
            } else {
              pos = 0;
            }
            // ↘️与↖️方向
            if (itemIndex - oldItemIndex === pointIndex - oldPointIndex) {
              for (let i = startX, j = startY; i <= endX; i++, j++) {
                if (!this.check[i].wrapper[j].isActive) {
                  this.value = `${i},${j}`;
                  this.check[i].wrapper[j].isActive = true;
                  this.activeCount++;
                  this.password[this.inputCount].push(this.value);
                }
              }
              let height = (endX - startX) * 78 * Math.sqrt(2) + 'px';
              this.path(height, -45, pos);
              this.line = newLine;
            } else {
              // ↙️与↗️方向
              for (let i = startX, j = endY; i <= endX; i++, j--) {
                if (!this.check[i].wrapper[j].isActive) {
                  this.value = `${i},${j}`;
                  this.check[i].wrapper[j].isActive = true;
                  this.activeCount++;
                  this.password[this.inputCount].push(this.value);
                }
              }
              let height = (endX - startX) * 78 * Math.sqrt(2) + 'px';
              this.path(height, -135, pos);
              this.line = newLine;
            }
          } else if (diffX === 0) {
            // 同排
            let start, end, pos;
            if (pointIndex > oldPointIndex) {
              end = pointIndex;
              start = oldPointIndex;
              pos = 1;
            } else {
              end = oldPointIndex;
              start = pointIndex;
              pos = 0;
            }
            for (let i = start; i <= end; ++i) {
              if (!this.check[itemIndex].wrapper[i].isActive) {
                this.value = `${itemIndex},${i}`;
                this.check[itemIndex].wrapper[i].isActive = true;
                this.activeCount++;
                this.password[this.inputCount].push(this.value);
              }
            }
            let height = (end - start) * 78 + 'px';
            this.path(height, -90, pos);
            this.line = newLine;
          } else if (diffY === 0) {
            // 同列
            let start, end, pos;
            if (itemIndex > oldItemIndex) {
              end = itemIndex;
              start = oldItemIndex;
              pos = 1;
            } else {
              end = oldItemIndex;
              start = itemIndex;
              pos = 0;
            }
            for (let i = start; i <= end; i++) {
              if (!this.check[i].wrapper[pointIndex].isActive) {
                this.value = `${i},${pointIndex}`;
                this.check[i].wrapper[pointIndex].isActive = true;
                this.activeCount++;
                this.password[this.inputCount].push(this.value);
              }
            }
            let height = (end - start) * 78 + 'px';
            this.path(height, 0, pos);
            this.line = newLine;
          } else {
            let startX, endX, startY, endY, posX, posY, pos;
            // 确定Y坐标起止
            if (pointIndex > oldPointIndex) {
              endY = pointIndex;
              startY = oldPointIndex;
              posY = 1;
            } else {
              endY = oldPointIndex;
              startY = pointIndex;
              posY = 0;
            }
            // 确定X坐标起止
            if (itemIndex > oldItemIndex) {
              endX = itemIndex;
              startX = oldItemIndex;
              posX = 1;
            } else {
              endX = oldItemIndex;
              startX = itemIndex;
              posX = 0;
            }
            if ((posX === 1 && posY === 1) || (posX === 0 && posY === 1)) {
              pos = 1;
            } else {
              pos = 0;
            }
            this.value = `${itemIndex},${pointIndex}`;
            this.check[itemIndex].wrapper[pointIndex].isActive = true;
            this.activeCount++;
            this.password[this.inputCount].push(this.value);
            let k = (pointIndex - oldPointIndex) / (itemIndex - oldItemIndex);
            let height = Math.sqrt(5) * 78 + 'px';
            if (k === 0.5) {
              this.path(height, -180 / Math.PI * Math.acos(2 / Math.sqrt(5)), pos);
            } else if (k === -0.5) {
              this.path(height, -180 / Math.PI * Math.acos(1 / Math.sqrt(5)) - 90, pos);
            } else if (k === 2) {
              this.path(height, -180 / Math.PI * Math.acos(1 / Math.sqrt(5)), pos);
            } else if (k === -2) {
              this.path(height, -180 / Math.PI * Math.acos(2 / Math.sqrt(5)) - 90, pos);
            }
            this.line = newLine;
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
      width 234px
      height 234px
      display flex
      flex-direction column
      margin 0 auto
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
            &::before
              content ''
              position absolute
              top 50%
              left 50%
              margin-left -2px
              margin-top -2px
              width 4px
              height 4px
              border-radius 50%
              background #000
            .line
              display inline-block
              visibility hidden
              position absolute
              top 21px
              left 50%
              margin-left -1px
              margin-top -1px
              width 2px
              height 78px
              background red
              z-index 99
              transform-origin 1px 0
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
