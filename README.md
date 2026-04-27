# learn-java

一个用于学习 Java 后端和 Vue 前端的全栈示例项目。

## 项目主题

项目是一个“学习任务管理器”。它足够简单，适合入门；同时又能覆盖真实项目里的关键链路：

- Java 后端：Spring Boot 3.5.14 + Java 17 + Maven + 简化 DDD 分层
- 数据库：MySQL 8.4.x，表结构由 Flyway 管理
- 数据访问：MyBatis Mapper 接口 + XML
- 前端：Vue 3 + Vite + TypeScript + Element Plus + Vue Router + Pinia
- 接口：REST API，后端通过 springdoc 暴露 OpenAPI，前端用 `@hey-api/openapi-ts` 生成 SDK

## 目录

```text
.
├── backend/              # Java 后端
├── frontend/             # Vue 前端
├── docker-compose.yml    # 本地 MySQL
└── .env.example          # 本地环境变量示例
```

## 启动顺序

1. 启动 MySQL

```bash
docker compose up -d mysql
```

2. 启动后端

项目已经包含 Maven Wrapper，不需要全局安装 `mvn`。项目要求 Java 17。

当前 shell 的 `JAVA_HOME` 仍可能指向旧 Java 8，所以本机建议显式指定 Java 17：

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw spring-boot:run
```

3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址是 `http://localhost:5173`，后端默认地址是 `http://localhost:8080`。

## 生成前端 SDK

先启动后端，再运行：

```bash
cd frontend
npm run generate:sdk
```

生成目录是 `frontend/src/api/generated/`。这个目录是机器生成代码；手写封装放在 `frontend/src/api/tasks.ts` 和 `frontend/src/api/runtime/`。

## 后端阅读路线

建议按这个顺序读：

1. `interfaces/rest/LearningTaskController.java`
2. `application/LearningTaskApplicationService.java`
3. `domain/model/LearningTask.java`
4. `domain/repository/LearningTaskRepository.java`
5. `infrastructure/persistence/MyBatisLearningTaskRepository.java`
6. `infrastructure/persistence/LearningTaskMapper.java`
7. `resources/mappers/LearningTaskMapper.xml`
8. `resources/db/migration/V1__init_learning_task.sql`

这样能先看到请求怎么进来，再看到业务用例怎么组织，最后看数据库适配。

## 已确定事项

- 后端使用 Spring Boot 3.5.14 + Java 17。
- 数据访问层使用 MyBatis。
- 数据库表结构使用 Flyway 管理。
- 前端使用 Vue Router 和 Pinia。
- 前端 SDK 从后端 OpenAPI 自动生成。
- 暂不做用户登录、测试扩展和 CI。

## 后续待设计

- 是否增加分页、搜索、状态筛选。
- 是否增加统一响应格式和错误码。
- 是否把后端 DTO、命令对象和 OpenAPI schema 做得更规范。
- 是否加入 MyBatis 动态 SQL 或更复杂的查询示例。

## 验证命令

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw test

cd ../frontend
npm run generate:sdk
npm run build
```
