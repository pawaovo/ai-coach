-- 验证数据库迁移结果

\echo '========================================='
\echo '  验证数据库迁移结果'
\echo '========================================='
\echo ''

\echo '1. 检查 users 表结构:'
\d users

\echo ''
\echo '2. 检查新增字段详情:'
SELECT
    column_name AS "字段名",
    data_type AS "数据类型",
    character_maximum_length AS "最大长度",
    column_default AS "默认值",
    is_nullable AS "可为空"
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('purchased_quota', 'phone')
ORDER BY column_name;

\echo ''
\echo '3. 检查字段注释:'
SELECT
    a.attname AS "字段名",
    pg_catalog.col_description(a.attrelid, a.attnum) AS "注释"
FROM pg_catalog.pg_attribute a
WHERE a.attrelid = 'users'::regclass
  AND a.attname IN ('purchased_quota', 'phone')
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attname;

\echo ''
\echo '4. 统计现有用户数据:'
SELECT
    COUNT(*) AS "总用户数",
    COUNT(phone) AS "有手机号的用户",
    SUM(purchased_quota) AS "总购买次数"
FROM users;

\echo ''
\echo '========================================='
\echo '  验证完成'
\echo '========================================='
