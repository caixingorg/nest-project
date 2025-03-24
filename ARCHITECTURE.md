# 系统架构文档

## 1. 系统概览
### 1.1 业务定位

基于NestJS的企业级应用框架，实现以下核心功能：

- 用户认证与授权管理
- 用户信息维护
- RESTful API服务
- 数据持久化抽象
- 多语言支持
- 安全防护体系
- 可视化API文档

系统采用模块化设计，便于扩展和维护。

### 1.2 架构全景图

```mermaid
graph TD
    A[客户端] --> B[API Gateway]
    B --> C[认证模块]
    B --> D[用户服务]
    B --> E[Swagger文档]
    
    subgraph 核心组件
    C --> C1[JWT策略]
    C --> C2[权限守卫]
    C --> C3[加密服务]
    
    D --> D1[Prisma ORM]
    D --> D2[数据验证]
    end
    
    subgraph 基础设施
    F[配置中心] --> F1[环境变量]
    G[日志系统] --> G1[Winston]
    H[国际化] --> H1[i18n]
    end
```


## 2. 技术选型
### 2.1 技术栈清单

- **框架**: NestJS 11.x
- **ORM**: Prisma 6.5
- **数据库**: MySQL
- **容器化**: Docker
- **语言**: TypeScript (ES2023)
- **认证**: JWT
- **API文档**: Swagger
- **国际化**: i18n
### 2.2 版本矩阵

| 组件 | 版本 |
|------|------|
| Node.js | 18-alpine |
| NestJS | ^11.0.1 |
| Prisma | ^6.5.0 |
| TypeScript | ^5.7.3 |
| MySQL Driver | ^3.13.0 |
| bcrypt | ^5.1.1 |
| class-validator | ^0.14.1 |


## 3. 架构设计
### 3.1 分层架构

采用标准的三层架构设计：

```mermaid
graph TD
    A[HTTP请求] --> B[Controller层]
    B --> C[Service层]
    C --> D[Repository层]
    D --> E[Prisma ORM]
    E --> F[MySQL数据库]
```

- **Controller层**: 负责处理HTTP请求/响应
- **Service层**: 实现核心业务逻辑
- **Repository层**: 封装数据访问操作
- **ORM抽象**: Prisma提供类型安全的数据操作接口

### 3.2 数据流向

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Controller as 控制器
    participant Service as 服务层
    participant Repository as 数据仓库
    participant Prisma as ORM
    participant DB as 数据库
    
    Client->>Controller: 发起HTTP请求
    Controller->>Service: 调用业务方法
    Service->>Repository: 执行数据操作
    Repository->>Prisma: 构建查询
    Prisma->>DB: 执行SQL
    DB-->>Prisma: 返回结果
    Prisma-->>Repository: 类型安全数据
    Repository-->>Service: 处理后数据
    Service-->>Controller: 业务结果
    Controller-->>Client: HTTP响应
```

### 3.3 安全体系

实现多层次安全防护：

1. **请求防护**
   - Helmet设置安全HTTP头
   - 请求频率限制（15分钟窗口期）

2. **认证授权**
   - JWT无状态认证
   - 角色权限控制
   - 密码加密存储（bcrypt）

3. **数据安全**
   - 全局数据验证管道
   - 敏感信息脱敏处理
   - 异常统一处理机制

4. **运行时保护**
   - 环境变量隔离敏感配置
   - 容器化部署增强安全性
   - 日志系统记录关键操作


## 4. 模块详解
### 4.1 认证模块

实现完整的身份认证体系：

1. **核心组件**
   - JwtStrategy: JWT策略实现
   - JwtAuthGuard: 权限守卫
   - AuthService: 认证服务
   
2. **功能特性**
   - 用户注册：密码加密存储
   - 登录认证：生成JWT
   - 权限控制：基于角色访问
   - Token刷新：支持无感知续期

3. **数据流**
   ```mermaid
   sequenceDiagram
       participant Client as 客户端
       participant Auth as 认证模块
       participant User as 用户服务
       
       Client->>Auth: 登录请求
       Auth->>User: 验证用户信息
       User-->>Auth: 返回用户数据
       Auth->>Auth: 生成JWT
       Auth-->>Client: 返回认证Token
   ```

### 4.2 用户服务

提供完整的用户管理功能：

1. **基础功能**
   - 用户注册
   - 信息查询
   - 数据更新
   - 状态管理

2. **技术实现**
   - 使用Prisma ORM进行数据操作
   - class-validator实现数据验证
   - DTO定义输入输出格式
   - 全局异常处理

3. **数据模型**
```typescript
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  fullName  String
  email     String   @unique
  isActive  Boolean  @default(true)
  roles     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.3 ORM集成

采用Prisma作为ORM框架：

1. **主要特性**
   - 类型安全的数据操作
   - 自动生成TS类型定义
   - 可视化数据模型管理
   - 支持数据库迁移

2. **集成方式**
   - Prisma Client封装数据操作
   - Repository模式解耦业务逻辑
   - 自定义Repository扩展功能

3. **配置说明**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```


## 5. 部署方案
### 5.1 Docker配置

采用两阶段构建：

1. 构建阶段:
   - 基础镜像: node:18-alpine
   - 安装pnpm包管理器
   - 安装全部依赖
   - 执行项目构建

2. 生产阶段:
   - 仅安装生产依赖
   - 复制构建产物
   - 设置环境变量 NODE_ENV=production
   - 暴露端口 3000
   - 启动命令: `node dist/main`

### 5.2 环境变量

系统使用环境变量管理敏感配置：

| 变量名 | 描述 | 示例 |
|--------|------|------|
| DATABASE_URL | 数据库连接字符串 | mysql://user:password@localhost:3306/dbname |
| JWT_SECRET | 认证密钥 | 随机生成字符串 |
| PORT | 应用监听端口 | 3000 |
| LOG_LEVEL | 日志级别 | info/debug |

建议通过`.env`文件进行管理，并确保已添加到.gitignore中。


## 附录

### 参考资料
- [NestJS官方文档](https://docs.nestjs.com/)
- [Prisma官方文档](https://www.prisma.io/docs)
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Docker官方文档](https://docs.docker.com/)
