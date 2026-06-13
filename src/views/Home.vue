<template>
  <div class="calendar-page">
    <div class="calendar-glass-container">
      <!-- 左侧：日历主面板 -->
      <div class="main-panel">
        <header class="calendar-header">
          <div class="date-jump">
            <a-select v-model:value="viewYear" class="glass-select" @change="handleViewChange">
              <a-select-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</a-select-option>
            </a-select>
            <a-select v-model:value="viewMonth" class="glass-select" @change="handleViewChange">
              <a-select-option v-for="m in 12" :key="m" :value="m - 1">{{ m }}月</a-select-option>
            </a-select>
          </div>

          <div class="nav-controls">
            <a-button type="text" class="nav-btn" @click="changeMonth(-1)"><left-outlined /></a-button>
            <a-button type="primary" shape="round" class="today-btn" @click="backToToday">今天</a-button>
            <a-button type="text" class="nav-btn" @click="changeMonth(1)"><right-outlined /></a-button>
          </div>
        </header>

        <div class="week-bar">
          <div v-for="day in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="day" class="week-label">{{ day }}</div>
        </div>

        <!-- 使用 transition 包装网格，实现全场淡入淡出 -->
        <div class="grid-container">
          <transition name="calendar-fade" mode="out-in">
            <!-- 关键点：用 key 绑定年份月份，key 变了就会触发动画 -->
            <div class="calendar-grid" :key="viewYear + '' + viewMonth">
              <div
                v-for="item in calendarDays"
                :key="item.id"
                :class="[
                  'day-node',
                  {
                    'is-other-month': !item.isCurrentMonth,
                    'is-today': item.isToday,
                    'is-selected': item.fullDate === selectedDateStr,
                    'is-weekend': item.isWeekend
                  }
                ]"
                @click="handleDateClick(item)"
              >
                <div class="solar-num">{{ item.day }}</div>
                <div class="lunar-txt" :class="{ 'is-term': item.isTerm || item.isFestival }">
                  {{ item.lunarDesc }}
                </div>
                <div v-if="item.isTerm || item.isFestival" class="indicator"></div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 右侧：详情侧边栏 -->
      <aside class="detail-sidebar">
        <!-- 新增：实时时辰显示 -->
        <div class="realtime-clock">
          <div class="time-now">{{ currentTime }}</div>
          <div class="shichen-badge">
            <span class="shichen-name">{{ currentShiChen.name }}</span>
            <span class="shichen-period">{{ currentShiChen.period }}</span>
          </div>
          <div class="shichen-tips">{{ currentShiChen.tips }}</div>
        </div>

        <a-divider style="border-color: rgba(255, 255, 255, 0.15); margin: 20px 0" />

        <div class="side-info-body">
          <div class="side-date-header">
            <div class="side-year">{{ sideInfo.year }}年 · {{ sideInfo.animal }}年</div>
            <div class="side-month-day">{{ sideInfo.monthDay }}</div>
          </div>

          <div class="big-day-wrap">
            <transition name="zoom" mode="out-in">
              <span :key="sideInfo.day" class="big-day">{{ sideInfo.day }}</span>
            </transition>
          </div>

          <div class="lunar-detail-text">
            <div class="ganzhi-tag">{{ sideInfo.ganzhiYear }} {{ sideInfo.ganzhiMonth }} {{ sideInfo.ganzhiDay }}</div>
            <div class="lunar-main-text">农历 {{ sideInfo.lunarMonth }}{{ sideInfo.lunarDay }}</div>
          </div>

          <div class="yiji-section">
            <div class="yiji-item yi">
              <div class="circle">宜</div>
              <div class="text">{{ sideInfo.yi.join(' ') }}</div>
            </div>
            <div class="yiji-item ji">
              <div class="circle">忌</div>
              <div class="text">{{ sideInfo.ji.join(' ') }}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { Solar, Lunar } from 'lunar-javascript';

export default {
  name: 'SophisticatedCalendar',
  components: { LeftOutlined, RightOutlined },
  data() {
    return {
      viewYear: dayjs().year(),
      viewMonth: dayjs().month(),
      selectedDateStr: dayjs().format('YYYY-MM-DD'),
      yearOptions: Array.from({ length: 201 }, (_, i) => 1900 + i),
      currentTime: dayjs().format('HH:mm:ss'),
      timer: null
    };
  },
  mounted() {
    this.startClock();
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  computed: {
    // 十二时辰计算逻辑
    currentShiChen() {
      const hour = dayjs().hour();
      const shichenMap = [
        { name: '子时', period: '23:00-01:00', tips: '夜半惊梦，宜睡眠', index: 0 },
        { name: '丑时', period: '01:00-03:00', tips: '肝经造血，宜深睡', index: 1 },
        { name: '寅时', period: '03:00-05:00', tips: '肺经播散，忌熬夜', index: 2 },
        { name: '卯时', period: '05:00-07:00', tips: '旭日东升，宜排毒', index: 3 },
        { name: '辰时', period: '07:00-09:00', tips: '胃经当令，宜早餐', index: 4 },
        { name: '巳时', period: '09:00-11:00', tips: '脾经主事，宜工作', index: 5 },
        { name: '午时', period: '11:00-13:00', tips: '心经气行，宜小憩', index: 6 },
        { name: '未时', period: '13:00-15:00', tips: '日昳之时，宜饮水', index: 7 },
        { name: '申时', period: '15:00-17:00', tips: '夕食之始，宜运动', index: 8 },
        { name: '酉时', period: '17:00-19:00', tips: '日落西山，宜归家', index: 9 },
        { name: '戌时', period: '19:00-21:00', tips: '黄昏静谧，宜阅读', index: 10 },
        { name: '亥时', period: '21:00-23:00', tips: '人定之时，宜沐浴', index: 11 }
      ];
      // 算法：(hour + 1) / 2 取整
      let idx = Math.floor((hour + 1) / 2) % 12;
      return shichenMap[idx];
    },
    // 生成日历数据
    calendarDays() {
      const startOfMonth = dayjs().year(this.viewYear).month(this.viewMonth).startOf('month');
      let firstDayIndex = startOfMonth.day() || 7;
      const startDate = startOfMonth.subtract(firstDayIndex - 1, 'day');

      return Array.from({ length: 42 }, (_, i) => {
        const curr = startDate.add(i, 'day');
        const solar = Solar.fromYmd(curr.year(), curr.month() + 1, curr.date());
        const lunar = solar.getLunar();

        let desc = lunar.getDayInChinese();
        let isTerm = false;
        let isFestival = false;

        if (lunar.getFestivals().length > 0) {
          desc = lunar.getFestivals()[0];
          isFestival = true;
        } else if (lunar.getJieQi()) {
          desc = lunar.getJieQi();
          isTerm = true;
        }

        return {
          id: curr.format('YYYYMMDD'),
          fullDate: curr.format('YYYY-MM-DD'),
          day: curr.date(),
          isCurrentMonth: curr.month() === this.viewMonth,
          isToday: curr.isSame(dayjs(), 'day'),
          isWeekend: curr.day() === 0 || curr.day() === 6,
          lunarDesc: desc,
          isTerm,
          isFestival
        };
      });
    },
    // 侧边栏详情
    sideInfo() {
      const d = dayjs(this.selectedDateStr);
      const solar = Solar.fromYmd(d.year(), d.month() + 1, d.date());
      const lunar = solar.getLunar();
      return {
        year: d.year(),
        monthDay: d.format('MM月DD日'),
        day: d.date(),
        animal: lunar.getYearShengXiao(),
        ganzhiYear: lunar.getYearInGanZhi(),
        ganzhiMonth: lunar.getMonthInGanZhi(),
        ganzhiDay: lunar.getDayInGanZhi(),
        lunarMonth: lunar.getMonthInChinese(),
        lunarDay: lunar.getDayInChinese(),
        yi: lunar.getDayYi().slice(0, 5),
        ji: lunar.getDayJi().slice(0, 5)
      };
    }
  },
  methods: {
    startClock() {
      this.timer = setInterval(() => {
        this.currentTime = dayjs().format('HH:mm:ss');
      }, 1000);
    },
    handleViewChange() {
      // 逻辑已绑定
    },
    changeMonth(step) {
      const target = dayjs().year(this.viewYear).month(this.viewMonth).add(step, 'month');
      this.viewYear = target.year();
      this.viewMonth = target.month();
    },
    backToToday() {
      this.viewYear = dayjs().year();
      this.viewMonth = dayjs().month();
      this.selectedDateStr = dayjs().format('YYYY-MM-DD');
    },
    handleDateClick(item) {
      this.selectedDateStr = item.fullDate;
      if (!item.isCurrentMonth) {
        this.viewYear = dayjs(item.fullDate).year();
        this.viewMonth = dayjs(item.fullDate).month();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 核心配色：林野深呼吸 */
$forest-deep: #1e3d1a;
$forest-mid: #2d5a27;
$forest-light: #e8f3e9;
$text-main: #2c3e50;
$glass: rgba(255, 255, 255, 0.75);

.calendar-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #d4e4d4 0%, #91a391 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.calendar-glass-container {
  width: 1100px;
  height: 750px;
  background: $glass;
  backdrop-filter: blur(25px);
  border-radius: 40px;
  display: flex;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 左侧网格 */
.main-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;

    .glass-select :deep(.ant-select-selector) {
      background: rgba(255, 255, 255, 0.4) !important;
      border: none !important;
      border-radius: 12px !important;
    }

    .today-btn {
      background: $forest-mid;
      border: none;
      font-weight: 500;
      &:hover {
        background: $forest-deep;
        transform: scale(1.02);
      }
    }
  }

  .grid-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 12px;
    height: 100%;
  }

  .day-node {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: 1.5px solid transparent;

    &:hover {
      background: #fff;
      transform: translateY(-3px);
    }
    &.is-selected {
      background: #fff;
      border-color: $forest-mid;
    }
    &.is-today {
      background: $forest-mid !important;
      .solar-num,
      .lunar-txt {
        color: #fff !important;
      }
    }
    &.is-other-month {
      opacity: 0.25;
    }

    .solar-num {
      font-size: 22px;
      font-weight: 700;
      color: $text-main;
    }
    .lunar-txt {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 4px;
    }
    .is-term {
      color: $forest-mid;
      font-weight: 600;
    }
  }
}

/* 右侧侧边栏 */
.detail-sidebar {
  width: 340px;
  background: rgba($forest-deep, 0.9);
  color: #fff;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;

  .realtime-clock {
    text-align: center;
    .time-now {
      font-size: 32px;
      font-weight: 200;
      letter-spacing: 2px;
    }
    .shichen-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
      background: rgba(255, 255, 255, 0.1);
      padding: 5px 15px;
      border-radius: 20px;
      .shichen-name {
        font-weight: 600;
        color: #a8e6cf;
      }
      .shichen-period {
        font-size: 12px;
        opacity: 0.6;
      }
    }
    .shichen-tips {
      font-size: 12px;
      opacity: 0.5;
      font-style: italic;
    }
  }

  .side-date-header {
    text-align: center;
    .side-year {
      font-size: 14px;
      opacity: 0.6;
    }
    .side-month-day {
      font-size: 26px;
      font-weight: 600;
      margin-top: 5px;
    }
  }

  .big-day-wrap {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    .big-day {
      font-size: 110px;
      font-weight: 800;
      text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  }

  .lunar-detail-text {
    text-align: center;
    .ganzhi-tag {
      font-size: 12px;
      color: #a8e6cf;
      margin-bottom: 5px;
    }
    .lunar-main-text {
      font-size: 18px;
      letter-spacing: 2px;
    }
  }

  .yiji-section {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .yiji-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      .circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        flex-shrink: 0;
      }
      .text {
        font-size: 13px;
        line-height: 1.6;
        opacity: 0.8;
        padding-top: 4px;
      }
      &.yi .circle {
        background: #4a8c44;
      }
      &.ji .circle {
        background: #b04e4e;
      }
    }
  }
}

/* 动画：全场淡入淡出 (Calendar Fade) */
.calendar-fade-enter-active,
.calendar-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(10px);
}

.calendar-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-10px);
}

/* 动画：数字缩放 (Zoom) */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease-in-out;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.88);
}

.week-bar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 15px;
  .week-label {
    text-align: center;
    font-size: 13px;
    color: #95a5a6;
    font-weight: 600;
  }
}
</style>
