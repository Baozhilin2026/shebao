# 五险一金计算器项目文档

## 项目概述
构建一个迷你"五险一金"计算器Web应用，根据员工工资数据和预设的城市（佛山）社保标准，计算公司应缴纳的社保公积金费用。

## 技术栈
- **前端框架**: Next.js (App Router)
- **UI/样式**: Tailwind CSS
- **后端/数据库**: Supabase

---

## 数据库设计 (Supabase)

### 表1: cities (城市社保标准表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| city_name | text | 城市名（如"佛山"） |
| year | text | 年份 |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 综合缴纳比例（如 0.15 表示 15%） |

### 表2: salaries (员工工资表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份（YYYYMM 格式） |
| salary_amount | int | 该月工资金额 |

### 表3: results (计算结果表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| employee_name | text | 员工姓名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

---

## 核心业务逻辑

### 计算函数执行步骤
1. 从 `salaries` 表读取所有数据
2. 按 `employee_name` 分组，计算每位员工的**年度月平均工资**
3. 从 `cities` 表获取佛山的数据：`year`, `base_min`, `base_max`, `rate`
4. 确定每位员工的**最终缴费基数**：
   - 如果 年度月平均工资 < base_min → 使用 base_min
   - 如果 年度月平均工资 > base_max → 使用 base_max
   - 否则 → 使用年度月平均工资本身
5. 计算**公司应缴纳金额** = 最终缴费基数 × rate
6. 清空 `results` 表，将所有计算结果存入
7. 如果任何步骤出错，返回错误提示

---

## 前端页面设计

### 页面1: / (主页)
**定位**: 应用入口和导航中枢

**布局**:
- 标题: "五险一金计算器"
- 两个功能卡片（垂直或并排排列）

**卡片1: 数据上传**
- 标题: "数据上传"
- 说明: 上传城市标准和员工工资数据
- 点击跳转到 `/upload`

**卡片2: 结果查询**
- 标题: "结果查询"
- 说明: 查看计算结果
- 点击跳转到 `/results`

---

### 页面2: /upload (数据上传与操作页)
**定位**: 后台操作控制面板

**功能**:

**按钮1: 上传城市标准数据**
- 点击后选择本地 Excel 文件
- 解析 Excel 并插入数据到 `cities` 表
- 上传成功/失败后显示提示信息

**按钮2: 上传员工工资数据**
- 点击后选择本地 Excel 文件
- 解析 Excel 并插入数据到 `salaries` 表
- 上传成功/失败后显示提示信息

**按钮3: 执行计算并存储结果**
- 触发核心计算逻辑
- 清空 `results` 表并存入新结果
- 计算成功/失败后显示提示信息

---

### 页面3: /results (结果查询与展示页)
**定位**: 计算结果展示页面

**功能**:
- 页面加载时自动从 `results` 表获取所有数据
- 使用 Tailwind CSS 渲染表格
- 表头: 员工姓名 | 年度月平均工资 | 最终缴费基数 | 公司缴纳金额
- 如果没有数据，显示"暂无数据"提示

---

## 开发任务清单 (TodoList)

### 阶段一: 环境搭建与项目初始化
- [ ] 创建 Next.js 项目 (使用 App Router)
- [ ] 安装 Tailwind CSS 并配置
- [ ] 安装 Supabase 客户端库 (`@supabase/supabase-js`)
- [ ] 安装 Excel 解析库 (`xlsx` 或 `papaparse`)
- [ ] 在 Supabase 创建项目并获取数据库 URL 和密钥
- [ ] 创建 `.env.local` 文件配置 Supabase 环境变量
- [ ] 在 Supabase Dashboard 创建三张数据表 (cities, salaries, results)

### 阶段二: 数据库配置与连接
- [ ] 创建 Supabase 客户端工具函数 (`lib/supabase.ts`)
- [ ] 测试数据库连接
- [ ] 在 Supabase 中为 cities 表插入佛山测试数据
- [ ] 验证数据表结构正确

### 阶段三: 核心计算逻辑实现
- [ ] 创建计算函数 `app/api/calculate/route.ts`
- [ ] 实现从 salaries 表读取所有数据
- [ ] 实现按员工分组计算平均工资
- [ ] 实现获取城市社保标准
- [ ] 实现缴费基数计算逻辑（基数上下限判断）
- [ ] 实现公司缴纳金额计算
- [ ] 实现清空并插入 results 表
- [ ] 添加错误处理和提示

### 阶段四: Excel 上传功能
- [ ] 创建 API 路由 `app/api/upload-cities/route.ts`
- [ ] 实现 Excel 文件解析
- [ ] 实现数据插入到 cities 表
- [ ] 添加错误处理

- [ ] 创建 API 路由 `app/api/upload-salaries/route.ts`
- [ ] 实现 Excel 文件解析
- [ ] 实现数据插入到 salaries 表
- [ ] 添加错误处理

### 阶段五: 前端页面开发

#### 主页 (/)
- [ ] 创建 `app/page.tsx`
- [ ] 实现页面标题和布局
- [ ] 创建"数据上传"卡片组件
- [ ] 创建"结果查询"卡片组件
- [ ] 添加 Tailwind 样式

#### 上传页 (/upload)
- [ ] 创建 `app/upload/page.tsx`
- [ ] 创建城市标准上传表单组件
- [ ] 创建员工工资上传表单组件
- [ ] 创建"执行计算"按钮
- [ ] 实现文件选择和上传逻辑
- [ ] 实现计算触发逻辑
- [ ] 添加成功/失败提示（Toast 或 Alert）
- [ ] 添加 Tailwind 样式

#### 结果页 (/results)
- [ ] 创建 `app/results/page.tsx`
- [ ] 创建 Supabase 数据获取逻辑
- [ ] 创建结果展示表格组件
- [ ] 实现数据渲染
- [ ] 添加"暂无数据"空状态
- [ ] 添加 Tailwind 样式

### 阶段六: 测试与优化
- [ ] 准备测试用的 Excel 文件（cities 和 salaries）
- [ ] 测试 Excel 上传功能
- [ ] 测试计算功能
- [ ] 测试结果展示功能
- [ ] 检查响应式布局
- [ ] 修复发现的 bug
- [ ] 代码优化和清理

### 阶段七: 部署准备（可选）
- [ ] 准备部署文档
- [ ] 配置生产环境变量
- [ ] 部署到 Vercel 或其他平台

---

## 项目文件结构预览
```
社保计算/
├── .env.local                  # 环境变量（Supabase 配置）
├── claude.md                   # 本文档
├── package.json
├── next.config.js
├── tailwind.config.js
├── app/
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 主页
│   ├── upload/
│   │   └── page.tsx           # 上传页
│   ├── results/
│   │   └── page.tsx           # 结果页
│   └── api/
│       ├── upload-cities/
│       │   └── route.ts       # 城市数据上传 API
│       ├── upload-salaries/
│       │   └── route.ts       # 工资数据上传 API
│       └── calculate/
│           └── route.ts       # 计算 API
├── lib/
│   └── supabase.ts            # Supabase 客户端
└── public/                     # 静态资源
```

---

## 重要注意事项
1. **城市固定**: 目前只支持佛山，代码中硬编码获取佛山数据
2. **计算模式**: 每次计算都会清空 results 表并重新插入
3. **数据校验**: Excel 解析失败时返回错误提示
4. **公开访问**: 无需用户认证
5. **Excel 格式**: 两个独立文件，列名需与数据库字段对应
