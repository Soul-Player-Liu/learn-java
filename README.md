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

## 前端测试体系

前端测试分四层：

- 静态检查：`npm run lint`、`npm run format:check`、`npm run typecheck`。
- 单元测试：`npm run test:unit`，使用 Vitest，当前覆盖 API wrapper 和 Pinia store。
- 端到端测试：`npm run test:e2e`，使用 Playwright，当前覆盖创建任务、修改状态、查询和删除的完整用户路径。
- SDK 一致性检查：`npm run sdk:check`，重新从后端 OpenAPI 生成 SDK，并检查 `src/api/generated` 是否有未提交变化。

常用命令：

```bash
cd frontend
npm run check
npm run test:e2e
```

`npm run test:e2e` 会通过 Playwright 自动启动后端和前端；仍然需要先确保本地 MySQL 正在运行。

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
- 暂不做用户登录和 CI。
- 后端测试分为快测和 MySQL 集成测试两层。

## 后续待设计

- 是否增加分页。
- 是否增加统一响应格式和错误码。
- 是否把后端 DTO、命令对象和 OpenAPI schema 做得更规范。
- 是否加入更复杂的 MyBatis 多表查询示例。

## 后端测试体系

测试分两类，并且按不同层级采用不同并行策略：

- `*Test`：默认单元测试，不依赖 Spring 和 MySQL。当前覆盖领域对象和应用服务，应用服务用内存版 Repository 隔离数据库。
- `*IT`：集成测试，需要本机 MySQL。测试会为每个 Failsafe fork JVM 创建一个共享随机 schema，启动 Spring/Flyway/MyBatis 后执行真实数据库测试，进程退出时删除 schema。
- `mvnw test` 由 Surefire 执行，只跑 `*Test`，并开启 JUnit 线程并行。默认并行度是 `4`，可以用 `-Dunit.test.parallelism=8` 覆盖。
- `mvnw verify -Pintegration-test` 由 Failsafe 执行 `*IT`，默认开 `2` 个 fork JVM。每个 fork JVM 共享一个随机 MySQL schema，schema 名里带 `worker_${surefire.forkNumber}`，避免并行 worker 之间互相清表。

普通开发优先跑快测：

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw test
```

调整单元测试并行度：

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw test -Dunit.test.parallelism=8
```

需要验证 Flyway、MyBatis XML、Controller 到数据库完整链路时，先启动 MySQL，再跑集成测试：

```bash
docker compose up -d mysql

cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw verify -Pintegration-test
```

调整集成测试 fork 数：

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw verify -Pintegration-test -Dintegration.test.fork.count=4
```

集成测试默认连接本地 Docker MySQL：

```text
host: localhost
port: 3306
admin user: root / root123456
app user: learn / learn123456
```

如果要连别的本机持久 MySQL，可以用环境变量覆盖：

```bash
TEST_MYSQL_HOST=localhost \
TEST_MYSQL_PORT=3306 \
TEST_MYSQL_ADMIN_USERNAME=root \
TEST_MYSQL_ADMIN_PASSWORD=root123456 \
TEST_MYSQL_APP_USERNAME=learn \
TEST_MYSQL_APP_PASSWORD=learn123456 \
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH \
./mvnw verify -Pintegration-test
```

## 验证命令

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw test
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH ./mvnw verify -Pintegration-test

cd ../frontend
npm run generate:sdk
npm run build
```
