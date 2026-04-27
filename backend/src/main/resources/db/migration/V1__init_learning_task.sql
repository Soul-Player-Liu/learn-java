create table learning_task (
    id bigint not null auto_increment,
    title varchar(100) not null,
    description varchar(500) null,
    status varchar(30) not null,
    due_date date null,
    created_at datetime(6) not null,
    updated_at datetime(6) not null,
    primary key (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci;
