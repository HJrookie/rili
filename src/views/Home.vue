<template>
  <a-config-provider :theme="antdConfigTheme">
    <div
      :class="['calendar-page', `theme-${currentThemeId}`, { 'is-dark': currentTheme.isDark }]"
      :style="themeCssVars"
    >
      <div class="calendar-glass-container">
        <!-- 左侧：日历主面板 -->
        <div class="main-panel">
          <header class="calendar-header">
            <!-- 年月跳转 -->
            <div class="date-jump">
              <a-select v-model:value="viewYear" class="glass-select" @change="handleViewChange">
                <a-select-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</a-select-option>
              </a-select>
              <a-select v-model:value="viewMonth" class="glass-select" @change="handleViewChange">
                <a-select-option v-for="m in 12" :key="m" :value="m - 1">{{ m }}月</a-select-option>
              </a-select>
            </div>

            <!-- 中间：风格切换气泡卡片 -->
            <div class="theme-switcher-wrapper">
              <a-popover
                v-model:open="themePopoverOpen"
                trigger="click"
                :placement="popoverPlacement"
                :overlay-class-name="'theme-popover-box ' + (currentTheme.isDark ? 'is-dark' : 'is-light')"
                :arrow="false"
              >
                <template #content>
                  <div class="theme-panel">
                    <div class="theme-panel-header">
                      <div class="panel-title-row">
                        <span class="panel-title">
                          <span class="sparkle">🎨</span> 风格随心换
                        </span>
                        <span class="theme-count-tag">8 款艺术配色</span>
                      </div>
                      <div class="panel-subtitle">点击一键切换 · 自动保存偏好</div>
                    </div>

                    <div class="theme-grid">
                      <div
                        v-for="theme in themes"
                        :key="theme.id"
                        :class="['theme-card', { 'is-active': currentThemeId === theme.id }]"
                        @click="handleSelectTheme(theme)"
                      >
                        <div class="theme-preview" :style="{ background: theme.previewGradient }">
                          <div v-if="currentThemeId === theme.id" class="active-check">
                            <check-outlined />
                          </div>
                        </div>
                        <div class="theme-card-info">
                          <div class="theme-name">
                            <span class="theme-icon">{{ theme.icon }}</span>
                            <span class="name-text">{{ theme.name }}</span>
                          </div>
                          <div class="theme-desc">{{ theme.subtitle }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="theme-panel-footer">
                      <span class="footer-tip">💡 提示：您选中的风格已自动保存在本地，下次进入时依然保持</span>
                    </div>
                  </div>
                </template>

                <button class="theme-trigger-btn" :title="'当前风格：' + currentTheme.name">
                  <span class="theme-palette-icon"><bg-colors-outlined /></span>
                  <span class="theme-btn-name">{{ currentTheme.name }}</span>
                  <span class="theme-dot" :style="{ background: currentTheme.colors.primary }"></span>
                </button>
              </a-popover>
            </div>

            <!-- 导航控制 -->
            <div class="nav-controls">
              <a-button type="text" class="nav-btn" @click="changeMonth(-1)"><left-outlined /></a-button>
              <a-button type="primary" shape="round" class="today-btn" @click="backToToday">今天</a-button>
              <a-button type="text" class="nav-btn" @click="changeMonth(1)"><right-outlined /></a-button>
            </div>
          </header>

          <div class="week-bar">
            <div v-for="day in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="day" class="week-label">{{ day }}</div>
          </div>

          <!-- 使用 transition 包装网格，实现全场淡入淡出，并支持移动端左右轻扫手势切换月份 -->
          <div
            class="grid-container"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
          >
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
          <!-- 实时时辰显示 -->
          <div class="realtime-clock">
            <div class="time-now">{{ currentTime }}</div>
            <div class="shichen-badge">
              <span class="shichen-name">{{ currentShiChen.name }}</span>
              <span class="shichen-period">{{ currentShiChen.period }}</span>
            </div>
            <div class="shichen-tips">{{ currentShiChen.tips }}</div>
          </div>

          <a-divider class="sidebar-divider" />

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
              <div class="ganzhi-tag">{{ sideInfo.ganzhiYear }}年 {{ sideInfo.ganzhiMonth }}月 {{ sideInfo.ganzhiDay }}日 {{ sideInfo.ganzhiTime }}时</div>
              <div class="lunar-main-text">农历 {{ sideInfo.lunarMonth }} - {{ sideInfo.lunarDay }}</div>
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
  </a-config-provider>
</template>

<script>
import { LeftOutlined, RightOutlined, BgColorsOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { message, theme as antdThemeEngine } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Solar, Lunar } from 'lunar-javascript';
import { THEMES, THEME_STORAGE_KEY, DEFAULT_THEME_ID, getThemeCssVariables } from '../constants/themes';

export default {
  name: 'SophisticatedCalendar',
  components: {
    LeftOutlined,
    RightOutlined,
    BgColorsOutlined,
    CheckOutlined
  },
  data() {
    // 从 localStorage 读取已保存的主题风格，若不存在则使用默认的绿色风格
    let savedThemeId = DEFAULT_THEME_ID;
    try {
      const local = localStorage.getItem(THEME_STORAGE_KEY);
      if (local && THEMES.some(t => t.id === local)) {
        savedThemeId = local;
      }
    } catch (e) {
      console.warn('读取本地主题缓存异常:', e);
    }

    return {
      themes: THEMES,
      currentThemeId: savedThemeId,
      themePopoverOpen: false,
      viewYear: dayjs().year(),
      viewMonth: dayjs().month(),
      selectedDateStr: dayjs().format('YYYY-MM-DD'),
      yearOptions: Array.from({ length: 201 }, (_, i) => 1900 + i),
      currentTime: dayjs().format('HH:mm:ss'),
      timer: null,
      storageHandler: null,
      resizeHandler: null,
      isMobile: false,
      touchStartX: null,
      touchStartY: null
    };
  },
  mounted() {
    this.startClock();
    this.checkMobile();
    this.resizeHandler = () => this.checkMobile();
    window.addEventListener('resize', this.resizeHandler);
    // 监听其他标签页的主题同步
    this.storageHandler = (e) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue && THEMES.some(t => t.id === e.newValue)) {
        this.currentThemeId = e.newValue;
      }
    };
    window.addEventListener('storage', this.storageHandler);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
    if (this.storageHandler) {
      window.removeEventListener('storage', this.storageHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  },
  computed: {
    popoverPlacement() {
      return this.isMobile ? 'bottomRight' : 'bottom';
    },
    currentTheme() {
      return this.themes.find(t => t.id === this.currentThemeId) || this.themes[0];
    },
    themeCssVars() {
      return getThemeCssVariables(this.currentTheme);
    },
    antdConfigTheme() {
      return {
        algorithm: this.currentTheme.isDark ? antdThemeEngine.darkAlgorithm : antdThemeEngine.defaultAlgorithm,
        token: {
          colorPrimary: this.currentTheme.colors.primary,
          borderRadius: 12,
          fontFamily: `'Inter', 'PingFang SC', sans-serif`
        }
      };
    },
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
      // 引用 this.currentTime 建立响应式依赖，当时辰更迭时自动同步更新
      const _clock = this.currentTime;
      const now = dayjs();
      const solar = Solar.fromYmdHms(
        d.year(),
        d.month() + 1,
        d.date(),
        now.hour(),
        now.minute(),
        now.second()
      );
      const lunar = solar.getLunar();
      return {
        year: d.year(),
        monthDay: d.format('MM月DD日'),
        day: d.date(),
        animal: lunar.getYearShengXiao(),
        ganzhiYear: lunar.getYearInGanZhi(),
        ganzhiMonth: lunar.getMonthInGanZhi(),
        ganzhiDay: lunar.getDayInGanZhi(),
        ganzhiTime: lunar.getTimeInGanZhi(),
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
    },
    handleSelectTheme(theme) {
      if (this.currentThemeId === theme.id) return;
      this.currentThemeId = theme.id;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme.id);
      } catch (e) {
        console.warn('持久化主题风格失败:', e);
      }
      message.success({
        content: `已切换至「${theme.name}」风格`,
        duration: 1.5
      });
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    handleTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    },
    handleTouchEnd(e) {
      if (this.touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      this.touchStartX = null;
      this.touchStartY = null;

      // 判定水平手势滑动：X 轴位移大于 40px 且明显大于 Y 轴位移（避免干扰正常上下滚动）
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        if (deltaX < 0) {
          this.changeMonth(1); // 左滑 -> 下一月
        } else {
          this.changeMonth(-1); // 右滑 -> 上一月
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: var(--page-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 20px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 16px 12px;
    align-items: flex-start;
  }

  @media (max-width: 640px) {
    padding: 12px 8px calc(24px + env(safe-area-inset-bottom, 0px));
  }
}

.calendar-glass-container {
  width: 1100px;
  max-width: 100%;
  height: 750px;
  background: var(--container-bg);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 40px;
  display: flex;
  box-shadow: var(--container-shadow);
  overflow: hidden;
  border: 1px solid var(--container-border);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    width: 100%;
    max-width: 580px;
    height: auto;
    min-height: auto;
    flex-direction: column;
    border-radius: 28px;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    border-radius: 24px;
  }
}

/* 左侧网格 */
.main-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    padding: 24px 20px;
  }

  @media (max-width: 640px) {
    padding: 16px 12px 14px;
  }

  @media (max-width: 380px) {
    padding: 14px 8px 12px;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 16px;

    @media (max-width: 768px) {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: 12px 8px;
      margin-bottom: 16px;
      align-items: center;

      .date-jump {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
      }

      .theme-switcher-wrapper {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        justify-self: end;
      }

      .nav-controls {
        grid-column: 1 / 3;
        grid-row: 2 / 3;
        display: flex;
        justify-content: center;
        gap: 24px;
        padding-top: 4px;
      }
    }

    .date-jump {
      display: flex;
      gap: 10px;

      @media (max-width: 640px) {
        gap: 6px;
      }
    }

    .glass-select {
      min-width: 86px;

      @media (max-width: 640px) {
        min-width: 76px;
      }

      @media (max-width: 380px) {
        min-width: 68px;
      }
    }

    .glass-select :deep(.ant-select-selector) {
      background: var(--select-bg) !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      border-radius: 12px !important;
      color: var(--color-text-main) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;

      @media (max-width: 640px) {
        padding: 0 8px !important;
        height: 34px !important;
      }
    }

    .glass-select :deep(.ant-select-selection-item) {
      color: var(--color-text-main) !important;
      font-weight: 500;

      @media (max-width: 640px) {
        font-size: 13px !important;
        line-height: 32px !important;
      }
    }

    .glass-select :deep(.ant-select-arrow) {
      color: var(--color-text-sub) !important;
    }

    /* 风格切换触发按钮 */
    .theme-switcher-wrapper {
      display: flex;
      align-items: center;
    }

    .theme-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 16px;
      background: var(--select-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 20px;
      cursor: pointer;
      color: var(--color-text-main);
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

      @media (max-width: 640px) {
        height: 34px;
        padding: 0 10px;
        font-size: 12px;
        gap: 6px;

        .theme-btn-name {
          max-width: 68px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &:hover {
        background: var(--day-node-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      &:active {
        transform: scale(0.96);
      }

      .theme-palette-icon {
        font-size: 16px;
        display: flex;
        align-items: center;
        color: var(--color-primary);

        @media (max-width: 640px) {
          font-size: 14px;
        }
      }

      .theme-btn-name {
        letter-spacing: 0.5px;
      }

      .theme-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
        transition: background-color 0.4s ease;
      }
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-btn {
      color: var(--color-text-main);
      background: var(--nav-btn-bg);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      @media (max-width: 640px) {
        width: 34px;
        height: 34px;
      }

      &:hover {
        background: var(--nav-btn-hover);
        color: var(--color-primary);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.92);
      }
    }

    .today-btn {
      background: var(--color-primary);
      border: none;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transition: all 0.3s ease;

      @media (max-width: 640px) {
        height: 32px;
        padding: 0 16px;
        font-size: 13px;
      }

      &:hover {
        background: var(--color-primary-deep);
        transform: scale(1.02);
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }

  .grid-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    touch-action: pan-y;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 12px;
    height: 100%;

    @media (max-width: 1024px) {
      gap: 8px;
      height: auto;
    }

    @media (max-width: 640px) {
      gap: 5px;
    }

    @media (max-width: 380px) {
      gap: 3px;
    }
  }

  .day-node {
    background: var(--day-node-bg);
    border-radius: 20px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1.5px solid transparent;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    @media (max-width: 1024px) {
      border-radius: 14px;
      padding: 8px 4px;
      min-height: 52px;
    }

    @media (max-width: 640px) {
      border-radius: 12px;
      padding: 6px 2px;
      min-height: 48px;
    }

    @media (max-width: 380px) {
      border-radius: 10px;
      padding: 4px 1px;
      min-height: 44px;
    }

    &:hover {
      background: var(--day-node-hover);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }

    &:active {
      transform: scale(0.96);
    }

    &.is-selected {
      background: var(--day-node-selected-bg);
      border-color: var(--color-primary);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    &.is-today {
      background: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);

      .solar-num,
      .lunar-txt {
        color: #fff !important;
      }

      .indicator {
        background-color: #fff !important;
      }
    }

    &.is-other-month {
      opacity: 0.25;
    }

    .solar-num {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-main);
      transition: color 0.3s ease;
      line-height: 1.15;

      @media (max-width: 1024px) {
        font-size: 18px;
      }

      @media (max-width: 640px) {
        font-size: 16px;
      }

      @media (max-width: 380px) {
        font-size: 14px;
      }
    }

    .lunar-txt {
      font-size: 12px;
      color: var(--color-text-sub);
      margin-top: 4px;
      transition: color 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      line-height: 1.2;

      @media (max-width: 1024px) {
        font-size: 11px;
        margin-top: 2px;
      }

      @media (max-width: 640px) {
        font-size: 10px;
        transform: scale(0.92);
        transform-origin: center top;
      }

      @media (max-width: 380px) {
        font-size: 9px;
        transform: scale(0.85);
      }
    }

    .is-term {
      color: var(--color-primary);
      font-weight: 600;
    }

    .indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: var(--color-primary);
      margin-top: 4px;
      transition: background-color 0.3s ease;

      @media (max-width: 640px) {
        width: 4px;
        height: 4px;
        margin-top: 2px;
      }
    }
  }
}

/* 右侧侧边栏 */
.detail-sidebar {
  width: 340px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    width: 100%;
    padding: 24px 20px 28px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 640px) {
    padding: 20px 16px 24px;
  }

  .realtime-clock {
    text-align: center;

    .time-now {
      font-size: 32px;
      font-weight: 200;
      letter-spacing: 2px;

      @media (max-width: 640px) {
        font-size: 26px;
        letter-spacing: 1px;
      }
    }

    .shichen-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
      background: rgba(255, 255, 255, 0.1);
      padding: 5px 15px;
      border-radius: 20px;

      @media (max-width: 640px) {
        gap: 6px;
        margin: 6px 0;
        padding: 4px 12px;
        font-size: 12px;
      }

      .shichen-name {
        font-weight: 600;
        color: var(--sidebar-accent);
        transition: color 0.4s ease;
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

      @media (max-width: 640px) {
        font-size: 11px;
      }
    }
  }

  .sidebar-divider {
    border-color: rgba(255, 255, 255, 0.15) !important;
    margin: 20px 0 !important;

    @media (max-width: 640px) {
      margin: 14px 0 !important;
    }
  }

  .side-date-header {
    text-align: center;

    .side-year {
      font-size: 14px;
      opacity: 0.6;

      @media (max-width: 640px) {
        font-size: 13px;
      }
    }

    .side-month-day {
      font-size: 26px;
      font-weight: 600;
      margin-top: 5px;

      @media (max-width: 640px) {
        font-size: 22px;
        margin-top: 2px;
      }
    }
  }

  .big-day-wrap {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 640px) {
      height: 85px;
    }

    .big-day {
      font-size: 110px;
      font-weight: 800;
      text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

      @media (max-width: 640px) {
        font-size: 68px;
      }
    }
  }

  .lunar-detail-text {
    text-align: center;

    .ganzhi-tag {
      font-size: 12px;
      color: var(--sidebar-accent);
      margin-bottom: 5px;
      transition: color 0.4s ease;

      @media (max-width: 640px) {
        font-size: 11px;
      }
    }

    .lunar-main-text {
      font-size: 18px;
      letter-spacing: 2px;

      @media (max-width: 640px) {
        font-size: 15px;
        letter-spacing: 1px;
      }
    }
  }

  .yiji-section {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    @media (max-width: 640px) {
      margin-top: 16px;
      gap: 10px;
    }

    .yiji-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      @media (max-width: 640px) {
        gap: 10px;
      }

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
        transition: background-color 0.4s ease;

        @media (max-width: 640px) {
          width: 26px;
          height: 26px;
          font-size: 12px;
        }
      }

      .text {
        font-size: 13px;
        line-height: 1.6;
        opacity: 0.8;
        padding-top: 4px;

        @media (max-width: 640px) {
          font-size: 12px;
          line-height: 1.5;
          padding-top: 2px;
        }
      }

      &.yi .circle {
        background: var(--color-yi);
      }

      &.ji .circle {
        background: var(--color-ji);
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

  @media (max-width: 640px) {
    margin-bottom: 8px;
  }

  .week-label {
    text-align: center;
    font-size: 13px;
    color: var(--color-text-sub);
    font-weight: 600;
    transition: color 0.3s ease;

    @media (max-width: 640px) {
      font-size: 11px;
    }
  }
}
</style>

<!-- 全局覆盖风格选择气泡卡片样式（因为 Popover 默认挂载于 body 下） -->
<style lang="scss">
.theme-popover-box {
  .ant-popover-inner {
    padding: 0 !important;
    border-radius: 24px !important;
    overflow: hidden !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
    background: rgba(255, 255, 255, 0.92) !important;
    backdrop-filter: blur(30px) !important;
  }

  &.is-dark .ant-popover-inner {
    background: rgba(26, 30, 42, 0.96) !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12) !important;
    color: #e6edf3 !important;
  }
}

.theme-panel {
  width: 580px;
  padding: 22px 24px;
  user-select: none;

  .theme-panel-header {
    margin-bottom: 18px;

    .panel-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 700;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 6px;

      .sparkle {
        font-size: 18px;
      }
    }

    .theme-count-tag {
      font-size: 12px;
      color: #7f8c8d;
      background: rgba(0, 0, 0, 0.05);
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 500;
    }

    .panel-subtitle {
      font-size: 12px;
      color: #8c9ba5;
      margin-top: 4px;
    }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .theme-card {
    background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.15);
    }

    &.is-active {
      border-color: #2d5a27;
      background: #ffffff;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);

      &::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 18px;
        border: 2px solid currentColor;
        pointer-events: none;
        opacity: 0.8;
      }
    }

    .theme-preview {
      height: 44px;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);

      .active-check {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.95);
        color: #2c3e50;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }
    }

    .theme-card-info {
      .theme-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #2c3e50;

        .theme-icon {
          font-size: 14px;
        }

        .name-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .theme-desc {
        font-size: 11px;
        color: #8c9ba5;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .theme-panel-footer {
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px dashed rgba(0, 0, 0, 0.08);
    text-align: center;

    .footer-tip {
      font-size: 12px;
      color: #95a5a6;
    }
  }
}

/* 暗色模式适配 */
.theme-popover-box.is-dark .theme-panel {
  .theme-panel-header {
    .panel-title {
      color: #e6edf3;
    }
    .theme-count-tag {
      color: #8b949e;
      background: rgba(255, 255, 255, 0.08);
    }
    .panel-subtitle {
      color: #8b949e;
    }
  }

  .theme-card {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.is-active {
      background: rgba(255, 255, 255, 0.15);
      border-color: #548edb;
    }

    .theme-card-info {
      .theme-name {
        color: #e6edf3;
      }
      .theme-desc {
        color: #8b949e;
      }
    }
  }

  .theme-panel-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
    .footer-tip {
      color: #8b949e;
    }
  }
}

@media (max-width: 640px) {
  .theme-popover-box {
    max-width: calc(100vw - 20px) !important;

    .ant-popover-inner {
      border-radius: 20px !important;
    }
  }

  .theme-panel {
    width: calc(100vw - 32px) !important;
    max-width: 360px !important;
    padding: 16px 14px !important;

    .theme-panel-header {
      margin-bottom: 12px !important;

      .panel-title {
        font-size: 15px !important;
      }
      .theme-count-tag {
        font-size: 11px !important;
        padding: 2px 8px !important;
      }
      .panel-subtitle {
        font-size: 11px !important;
      }
    }

    .theme-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
      max-height: 52vh !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
      padding-right: 2px;
    }

    .theme-card {
      padding: 8px !important;
      border-radius: 12px !important;

      .theme-preview {
        height: 36px !important;
      }

      .theme-card-info {
        .theme-name {
          font-size: 12px !important;
        }
        .theme-desc {
          font-size: 10px !important;
        }
      }
    }

    .theme-panel-footer {
      margin-top: 12px !important;
      padding-top: 8px !important;

      .footer-tip {
        font-size: 11px !important;
      }
    }
  }
}
</style>
