# 英语单词复习系统

一个现代化的英语单词学习和练习平台，支持多种练习模式。

## 功能特点

### 📚 三种练习模式

1. **单元练习** - 选择特定单元，专注练习该单元的所有单词
2. **混合练习** - 自由选择多个单元进行综合复习
3. **模拟测试** - 标准化测试：15道题 + 5个干扰词，模拟真实考试

### ✨ 核心功能

- 选词填空式练习
- 自动判分与正确率统计
- 错题详解与解析
- 响应式设计，支持多种设备
- 现代化渐变UI设计
- 流畅的交互动画

## 快速开始

### 安装依赖

```bash
cd english-vocabulary-practice
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 生产构建

```bash
npm run build
```

### 解析Word文档（可选）

如果你想从原始Word文档解析数据：

```bash
npm run parse-data
```

> 注意：需要将Word文档放置在正确的目录中。

## 项目结构

```
english-vocabulary-practice/
├── src/
│   ├── components/       # React组件
│   ├── hooks/           # 自定义Hooks
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript类型定义
│   ├── data/            # 词汇数据
│   ├── App.tsx          # 主应用组件
│   ├── App.css          # 样式文件
│   └── main.tsx         # 入口文件
├── scripts/             # 数据解析脚本
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 数据说明

当前包含7个单元，共70个核心词汇，每个单词配有：
- 词性
- 中文释义
- 英文例句

## 技术栈

- React 18
- TypeScript
- Vite
- CSS3 (渐变色、动画)

## 使用说明

1. 在主页选择练习模式
2. 根据模式选择相应的单元
3. 点击选项填入空格
4. 完成后提交查看成绩
5. 查看错题解析，巩固学习

## 许可证

MIT
