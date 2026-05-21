-- DEPARTMENTS, EMPLOYEES 두 테이블을 생성하고 샘플 데이터를 입력하는 스크립트

-- TODO: dept_id를 PK로, dept_name을 NOT NULL로 만드세요.
CREATE TABLE departments (
  dept_id   ____,
  dept_name ____ NOT NULL
);

-- TODO: emp_id를 PK로 만들고, dept_id에 departments(dept_id) 외래 키를 거세요.
CREATE TABLE employees (
  emp_id    ____,
  emp_name  VARCHAR2(50) NOT NULL,
  dept_id   NUMBER,
  salary    NUMBER(10, 2),
  hire_date DATE DEFAULT SYSDATE,
  CONSTRAINT fk_emp_dept FOREIGN KEY (____) REFERENCES ____(____)
);

-- TODO: 부서 3개를 INSERT 하세요.
INSERT INTO departments VALUES (10, '개발팀');
-- ...

-- TODO: 직원 6명을 INSERT 하세요. 1명은 dept_id를 NULL로 두세요.
INSERT INTO employees VALUES (1, '김개발', 10, 5000, DATE '2024-03-01');
-- ...

COMMIT;
