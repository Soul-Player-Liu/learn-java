create table learning_project (
    id bigint not null auto_increment,
    name varchar(100) not null,
    description varchar(500) null,
    created_at datetime(6) not null,
    updated_at datetime(6) not null,
    primary key (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;

alter table learning_task
    add column project_id bigint null after id,
    add constraint fk_learning_task_project
        foreign key (project_id) references learning_project (id)
        on delete set null;

create table learning_tag (
    id bigint not null auto_increment,
    name varchar(30) not null,
    color varchar(20) null,
    created_at datetime(6) not null,
    primary key (id),
    unique key uk_learning_tag_name (name)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;

create table learning_task_tag (
    task_id bigint not null,
    tag_id bigint not null,
    primary key (task_id, tag_id),
    constraint fk_learning_task_tag_task
        foreign key (task_id) references learning_task (id)
        on delete cascade,
    constraint fk_learning_task_tag_tag
        foreign key (tag_id) references learning_tag (id)
        on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;

create table task_comment (
    id bigint not null auto_increment,
    task_id bigint not null,
    content varchar(1000) not null,
    author varchar(50) not null,
    created_at datetime(6) not null,
    primary key (id),
    constraint fk_task_comment_task
        foreign key (task_id) references learning_task (id)
        on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;

create table task_activity (
    id bigint not null auto_increment,
    task_id bigint not null,
    type varchar(50) not null,
    message varchar(500) not null,
    created_at datetime(6) not null,
    primary key (id),
    constraint fk_task_activity_task
        foreign key (task_id) references learning_task (id)
        on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;
