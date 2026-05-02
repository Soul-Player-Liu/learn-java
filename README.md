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

如果当前 shell 默认不是 Java 17，先把 `JAVA_HOME` 或 `DEV_JAVA_HOME` 指向本机 Java 17 JDK。仓库脚本会检查 Java 主版本，不再写死某台机器的 JDK 路径。

```bash
cd backend
../scripts/with-java-17.sh ./mvnw spring-boot:run
```

3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址是 `http://localhost:5173`，后端默认地址是 `http://localhost:8080`。

也可以在仓库根目录用脚本幂等启动或关闭前后端。脚本不管理 MySQL，默认数据库已经启动：

```bash
./start-dev.sh
./stop-dev.sh
```

启动日志和 pid 文件放在 `.dev/`，该目录不会提交到 Git。

## 前端离线预览

如果只想看前端页面，不启动 Java 后端，可以使用 MSW mock mode：

```bash
cd frontend
npm run dev:mock
```

这会启动完整 Vue 应用，页面仍然走 Router、Pinia 和生成的 SDK，但 `/api/tasks`、`/api/projects`、`/api/tags` 等请求会被 `src/mocks/handlers.ts` 拦截并返回模拟数据。适合产品或业务人员离线点完整流程。

如果要看单个页面的不同状态，可以使用 Storybook：

```bash
cd frontend
npm run storybook
```

当前 stories 覆盖了 `DashboardView`、`ProjectListView`、`TaskBoard`、`TaskDetailView`，并复用同一套 MSW handlers 展示正常、空数据、逾期、多数据和找不到详情等状态。

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
- 覆盖率检查：`npm run test:coverage`，使用 Vitest V8 coverage。当前采用“全局基础门槛 + 核心 API/store 文件更高门槛”的策略。
- 端到端测试：`npm run test:e2e`，使用 Playwright，当前覆盖创建项目、创建带项目和标签的任务、评论、活动日志、状态流转、标签筛选和删除的完整用户路径。脚本会用 MySQL admin 账号直连数据库，为每次运行创建随机 MySQL database，测试结束后删除，避免污染 `learn_java`。
- SDK 一致性检查：`npm run sdk:check`，重新从后端 OpenAPI 生成 SDK，并检查 `src/api/generated` 是否有未提交变化。
- 离线页面构建：`npm run build:mock` 和 `npm run build:storybook`，用于确认 MSW mock mode 和 Storybook 不是只能在开发机临时启动。

常用命令：

```bash
cd frontend
npm run check
npm run test:e2e
```

`npm run test:e2e` 会先创建临时 database，再通过 Playwright 自动启动后端和前端；仍然需要先确保 MySQL 可连接。默认连接本地 MySQL，也可以通过 `TEST_MYSQL_HOST`、`TEST_MYSQL_PORT`、`TEST_MYSQL_ADMIN_USERNAME`、`TEST_MYSQL_ADMIN_PASSWORD`、`TEST_MYSQL_APP_USERNAME`、`TEST_MYSQL_APP_PASSWORD` 指向其他测试数据库。

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
- 暂不做用户登录。
- 仓库根目录的 `ci.sh` 会串起后端 MySQL 集成测试、后端覆盖率门槛、前端 check、前端覆盖率门槛、mock build、Storybook build、SDK 一致性检查和 Playwright E2E。
- GitLab CI 配置在 `.gitlab-ci.yml`，按后端、前端、E2E 拆分 job，并上传 JUnit、JaCoCo、Cobertura、Playwright report 和 Storybook 静态产物。
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
../scripts/with-java-17.sh ./mvnw test
```

调整单元测试并行度：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test -Dunit.test.parallelism=8
```

需要验证 Flyway、MyBatis XML、Controller 到数据库完整链路时，先启动 MySQL，再跑集成测试：

```bash
docker compose up -d mysql

cd backend
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test
```

调整集成测试 fork 数：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test -Dintegration.test.fork.count=4
```

如果要同时执行覆盖率门槛：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
```

后端覆盖率用 JaCoCo，策略是分层门槛：

- 全局排除 DTO、请求对象、MyBatis record、启动类等低价值结构代码后，要求基础行/指令/分支覆盖率。
- `domain/model` 是核心业务规则包，门槛最高。
- `application` 是用例编排层，门槛次之。
- `infrastructure/persistence` 和 `interfaces/rest` 主要靠集成测试兜底，门槛低于纯业务包。

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
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test
```

## GitLab CI

`.gitlab-ci.yml` 当前分为五类 job：

- `backend_unit`：跑 `mvnw test`，上传 Surefire JUnit XML。
- `backend_integration`：用 GitLab MySQL service 跑 `mvnw verify -Pintegration-test,coverage`，上传 Surefire/Failsafe JUnit XML 和 JaCoCo XML/HTML。
- `frontend_check`：跑 `npm run check`、mock build、Storybook build、Vitest coverage，上传 Vitest JUnit XML、Cobertura coverage、Storybook 静态产物。
- `sdk_check`：启动真实后端，重新生成 SDK 并检查 `src/api/generated` 是否漂移。
- `e2e`：用 Playwright 镜像跑真实前后端 E2E，上传 Playwright JUnit XML、HTML report 和 trace/test-results。

CI 使用 Java 17 镜像或在 job 里安装 Java 17；本地脚本只校验版本，不绑定固定 JDK 路径。MySQL 仍沿用当前临时 database/schema 模型，暂不切换 Testcontainers。

## 覆盖率策略

覆盖率不是“一刀切 80%”。当前策略是：

- 后端：JaCoCo 在 `coverage` profile 中执行门槛检查，并按包区分全局、领域层、应用层、接口/基础设施层。
- 前端：Vitest coverage 设置全局基础门槛，同时对 `src/api/tasks.ts` 和 `src/stores/taskStore.ts` 设置更高门槛。
- CI 上传机器可读报告，方便 GitLab 展示覆盖率变化；HTML 报告作为 artifact 留给人工排查。

后续真实项目可以把门槛逐步上调，或者只对新增代码、核心业务包、关键 store/API wrapper 提更高要求。

## 验证命令

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage

cd ../frontend
npm run generate:sdk
npm run check
npm run test:coverage
npm run build:mock
npm run build:storybook
npm run test:e2e
```
