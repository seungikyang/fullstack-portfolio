-- 트랜잭션 연습. 송금 시나리오로 COMMIT과 ROLLBACK을 직접 실험합니다.

-- 1) 두 UPDATE 모두 성공시키고 COMMIT 한 경우.
UPDATE employees SET salary = salary - 1000 WHERE emp_id = 1;
UPDATE employees SET salary = salary + 1000 WHERE emp_id = 2;
COMMIT;

-- 2) 첫 UPDATE만 한 뒤 ROLLBACK 한 경우. 두 직원의 급여는 원래대로 돌아갑니다.
UPDATE employees SET salary = salary - 1000 WHERE emp_id = 1;
ROLLBACK;

-- TODO: 다른 세션을 열어 emp_id = 1과 2의 salary가 COMMIT 전후로 어떻게 보이는지 확인하세요.
-- 관찰 메모.
