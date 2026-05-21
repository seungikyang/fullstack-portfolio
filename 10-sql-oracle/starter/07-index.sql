-- 인덱스가 검색 성능에 미치는 영향을 직접 확인합니다.

-- 10만 건 INSERT (Oracle 11g 이상에서 동작)
BEGIN
  FOR i IN 1..100000 LOOP
    INSERT INTO employees (emp_id, emp_name, salary)
    VALUES (1000 + i, 'name_' || i, 3000);
  END LOOP;
  COMMIT;
END;
/

-- TODO: 인덱스 없이 검색해 실행 계획을 확인하세요.
EXPLAIN PLAN FOR
SELECT * FROM employees WHERE emp_name = 'name_99999';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- TODO: emp_name에 인덱스를 만들고 다시 실행 계획을 확인하세요.
CREATE INDEX ____ ON employees(____);

EXPLAIN PLAN FOR
SELECT * FROM employees WHERE emp_name = 'name_99999';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- 관찰 메모. TABLE FULL SCAN과 INDEX RANGE SCAN이 어떻게 바뀌었나요?
