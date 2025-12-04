@echo off
chcp 65001 >nul
echo ========================================
echo   AI Coach 数据库迁移工具
echo ========================================
echo.

REM 设置 PostgreSQL 路径（根据实际安装路径调整）
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB_NAME=ai_coach_db
set DB_USER=postgres

REM 检查 psql 是否存在
if not exist %PSQL_PATH% (
    echo [错误] 未找到 psql.exe
    echo 请修改脚本中的 PSQL_PATH 变量为你的 PostgreSQL 安装路径
    echo 通常是: C:\Program Files\PostgreSQL\18\bin\psql.exe
    pause
    exit /b 1
)

echo [信息] 准备执行数据库迁移...
echo [信息] 数据库: %DB_NAME%
echo [信息] 用户: %DB_USER%
echo.

REM 执行迁移脚本
echo [1/2] 执行迁移: 添加购买次数字段...
%PSQL_PATH% -U %DB_USER% -d %DB_NAME% -f 002_add_purchased_quota.sql
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 迁移 002 执行失败
    pause
    exit /b 1
)
echo [成功] 迁移 002 执行完成
echo.

echo [2/2] 执行迁移: 添加手机号字段...
%PSQL_PATH% -U %DB_USER% -d %DB_NAME% -f 003_add_phone_field.sql
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 迁移 003 执行失败
    pause
    exit /b 1
)
echo [成功] 迁移 003 执行完成
echo.

echo ========================================
echo   所有迁移执行完成！
echo ========================================
echo.
echo 请验证迁移结果：
echo   1. 打开 pgAdmin 或使用 psql 连接数据库
echo   2. 执行: \d users
echo   3. 确认 purchased_quota 和 phone 字段已添加
echo.
pause
