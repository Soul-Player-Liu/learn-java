# 后端外部依赖 Mock 标准

本文说明后端集成测试和 E2E 测试中如何替换外部系统依赖。它和 [frontend-mock.md](frontend-mock.md) 分工不同：`frontend-mock.md` 关注前端、移动端和离线预览；本文关注 Spring 后端在测试容器里如何避免真实调用 HTTP、MQ、SDK、三方服务和跨系统依赖。

后端 mock 的目标是让业务主链路在真实数据库、真实 Spring Web、真实 Controller/Service/Mapper 下运行，同时把不可控的外部系统替换成可预测的测试实现。

## 核心原则

- 业务代码依赖应用端口，不直接依赖具体外部 SDK、HTTP client、MQ producer。
- 默认基础设施实现可以很轻，例如只记录日志或封装真实调用。
- 集成测试用公共测试配置替换外部依赖，不在每个测试类重复声明所有 mock。
- 单个测试只配置当前场景关心的返回值或调用断言。
- mock 只替换外部边界，不替换本系统要验证的业务逻辑、数据库约束和 Mapper SQL。

## 分层模型

| 层级 | 目标 | 本仓库示例 |
| --- | --- | --- |
| 应用端口 | 定义业务需要的外部能力 | `TaskRiskClient`、`UserDirectoryClient`、`TaskNotificationClient`、`DomainEventPublisher`、`TaskCodeGenerator`、`TaskArchiveClient` |
| 默认实现 | 开发或生产环境中的基础设施实现 | `LocalTaskRiskClient`、`InMemoryUserDirectoryClient`、`LoggingTaskNotificationClient`、`LoggingDomainEventPublisher`、`LocalTaskCodeGenerator`、`LoggingTaskArchiveClient` |
| 公共测试配置 | 在 Spring 测试容器中替换外部依赖 | `E2eMockExternalConfig` |
| 场景断言 | 每个测试只声明当前场景行为 | `LearningTaskApplicationServiceTest` 和 `LearningTaskControllerIT` 中的 `when(...)`、`doThrow(...)`、`verify(...)`、`ArgumentCaptor` |

## 推荐目录

```text
backend/src/main/java/com/example/learning/
  application/port/
    TaskNotificationClient.java
    TaskRiskClient.java
    UserDirectoryClient.java
    DomainEventPublisher.java
    TaskCodeGenerator.java
    TaskArchiveClient.java
  infrastructure/external/
    LoggingTaskNotificationClient.java
    LocalTaskRiskClient.java
    InMemoryUserDirectoryClient.java
    LoggingDomainEventPublisher.java
    LocalTaskCodeGenerator.java
    LoggingTaskArchiveClient.java

backend/src/test/java/com/example/learning/
  support/
    E2eMockExternalConfig.java
  interfaces/rest/
    LearningTaskControllerIT.java
```

大型项目可以按业务域拆分：

```text
application/port/
  payment/PaymentClient.java
  message/MessagePublisher.java
  file/FileGateway.java
  user/UserDirectory.java

infrastructure/external/
  payment/FeignPaymentClient.java
  message/RocketMqMessagePublisher.java
  file/ObjectStorageFileGateway.java
  user/UserCenterClient.java
```

## Spring 测试替换方式

公共 mock 推荐放在 `@TestConfiguration` 中，并用 `@Primary` 覆盖默认 bean：

```java
@TestConfiguration
public class E2eMockExternalConfig {

    @Bean
    @Primary
    public TaskNotificationClient taskNotificationClient() {
        return Mockito.mock(TaskNotificationClient.class);
    }

    @Bean
    @Primary
    public TaskRiskClient taskRiskClient() {
        return Mockito.mock(TaskRiskClient.class);
    }
}
```

集成测试引入公共配置：

```java
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {LearningApplication.class, E2eMockExternalConfig.class}
)
class LearningTaskControllerIT {
}
```

测试里只写当前场景的断言：

```java
@Autowired
private TaskNotificationClient taskNotificationClient;

@Test
void createTaskNotifiesExternalSystem() {
    // 调 POST /api/tasks
    verify(taskNotificationClient).taskCreated(createdTask.id(), "Learn REST");
}
```

公共 mock bean 是 Spring 容器里的单例。如果同一个 `@SpringBootTest` 类里有多个测试方法，应在 `@BeforeEach` 中 `reset(...)` 并重新设置默认行为，避免调用记录或 stub 在测试之间串场：

```java
@BeforeEach
void setUp() {
    reset(taskNotificationClient, taskRiskClient);
    when(taskRiskClient.reviewTaskCreation(anyString(), any()))
            .thenReturn(TaskRiskDecision.approved());
}
```

## 常见 Mock 场景

本仓库用本地默认实现“假装有外部依赖”，因此可以独立运行；测试中再通过 Mockito 替换应用端口，覆盖真实大项目常见情况。

| 场景 | 端口示例 | Mockito 写法 | 关注点 |
| --- | --- | --- | --- |
| 只确认外部动作发生 | `TaskNotificationClient` | `verify(...)` | 创建任务后是否通知外部系统 |
| 外部返回值驱动业务分支 | `TaskRiskClient` | `when(...).thenReturn(...)` | 风控通过或拒绝时，业务是否保存或中断 |
| 外部查无数据 | `UserDirectoryClient` | `thenReturn(Optional.empty())` | 用户中心无用户时，业务是否返回明确错误 |
| 固定随机/流水号 | `TaskCodeGenerator` | `thenReturn("TASK-FIXED-0007")` | 测试不依赖当前时间、随机数或序列 |
| 外部归档或文件服务返回值 | `TaskArchiveClient` | `when(...).thenReturn(...)` | 返回的 `archiveId` 是否进入后续事件或消息 |
| `void` 外部调用失败 | `DomainEventPublisher` | `doThrow(...).when(...).publish(...)` | MQ 或事件发布失败时业务如何暴露或补偿 |
| 检查消息内容 | `DomainEventPublisher` | `ArgumentCaptor` | 领域事件 payload 是否包含正确业务字段 |
| 拒绝后不应继续外部调用 | 多个端口组合 | `verifyNoInteractions(...)` | 分支短路后不归档、不通知、不发布事件 |

单元测试通常直接 `mock(...)` 并手动 new application service；Spring 集成测试则通过 `E2eMockExternalConfig` 替换容器里的外部端口 bean。

## 什么时候用 Mock

适合 mock：

- 用户中心、权限中心、组织机构、短信、站内信。
- 银行、支付、文件存储、对象存储、OCR、三方 API。
- MQ producer、异步通知、回调分发。
- 运行时不稳定、费用高、不可重复或需要复杂环境的外部系统。

不应 mock：

- 本系统的领域规则。
- 本系统的数据库读写、约束、migration 和 Mapper SQL。
- 当前测试目标正要验证的服务编排。
- 需要真实并发语义验证的锁行为；这类应单独做专项集成测试。

## 公共 Mock 与场景 Mock

公共 mock 放默认成功或无副作用行为：

- 外部通知默认可调用。
- 发号器返回可预测 ID。
- 文件服务返回固定测试文件信息。
- 分布式锁默认获取成功。
- 用户目录默认返回存在的测试用户。
- 风控或规则中心默认放行。

场景 mock 放单个测试：

- 银行返回拒绝。
- 支付超时。
- 用户中心返回无权限。
- 文件服务返回不存在。
- MQ 发送失败后业务应如何处理。
- 事件 payload 是否包含正确业务字段。

这样可以避免每个测试都重复搭一整套外部环境，同时保留场景表达力。

## 和集成测试的关系

后端集成测试仍应运行真实 Spring 容器、真实 HTTP 入口和真实数据库。本仓库集成测试通过 `MysqlTestSchema` 为每次运行创建临时 MySQL schema；外部依赖 mock 只替换系统边界。

推荐组合：

- `@SpringBootTest(webEnvironment = RANDOM_PORT)`：验证 Controller 到数据库的主链路。
- `MysqlTestSchema`：隔离真实 MySQL schema。
- `E2eMockExternalConfig`：替换外部系统端口。
- Mockito `verify(...)`：确认业务链路触发了外部调用。

## 评审清单

提交前检查：

- 新外部依赖是否先定义为应用端口。
- 测试是否 mock 端口，而不是 mock 大量底层 SDK 细节。
- 公共 mock 是否集中在测试支持配置里。
- 单个测试是否只配置当前场景需要的行为。
- 集成测试是否仍使用真实数据库和真实业务代码。
- 文档是否同步更新 [testing.md](testing.md) 和本文。
