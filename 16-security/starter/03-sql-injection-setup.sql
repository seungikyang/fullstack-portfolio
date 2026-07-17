-- SQL Injection 실습용 사용자 테이블과 샘플 데이터를 준비하는 스크립트
CREATE DATABASE IF NOT EXISTS app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'pass';
GRANT SELECT ON app.* TO 'user'@'%';

USE app;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_name (name)
);

INSERT INTO users (name)
VALUES ('alice'), ('bob'), ('홍길동')
ON DUPLICATE KEY UPDATE name = VALUES(name);
