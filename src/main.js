import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import router from "./router";

// 1. 仅导出当前项目实际用到的组件
import {
  ConfigProvider,
  Select,
  Popover,
  Button,
  Divider,
  // 如果路由下的其他页面还用到了你注释里的组件，按需取消注释即可
} from "ant-design-vue";

const app = createApp(App);

app.use(router);

// 2. 链式按需注册（Select 会自动注册 ASelect 和 ASelectOption）
app
  .use(ConfigProvider)
  .use(Select)
  .use(Popover)
  .use(Button)
  .use(Divider);

app.mount("#app");