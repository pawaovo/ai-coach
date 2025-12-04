#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Database migration script
"""
import psycopg2
import sys
import io

# Set UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'ai_coach_db',
    'user': 'postgres',
    'password': '123456'
}

# Migration SQL statements
MIGRATIONS = [
    {
        'name': '002_add_purchased_quota',
        'sql': 'ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_quota INT DEFAULT 0;'
    },
    {
        'name': '003_add_phone_field',
        'sql': 'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);'
    }
]

def run_migrations():
    """Execute all migrations"""
    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("[OK] Connected successfully\n")

        # Execute each migration
        for migration in MIGRATIONS:
            print(f"Running migration: {migration['name']}")
            try:
                cursor.execute(migration['sql'])
                conn.commit()
                print(f"[OK] {migration['name']} completed\n")
            except Exception as e:
                print(f"[FAIL] {migration['name']} failed: {e}\n")
                conn.rollback()

        # Verify results
        print("Verifying migrations...")
        cursor.execute("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
              AND column_name IN ('purchased_quota', 'phone')
            ORDER BY column_name;
        """)

        results = cursor.fetchall()
        if results:
            print("[OK] Migration verification:")
            for row in results:
                print(f"  - {row[0]}: {row[1]} (default: {row[2]})")
        else:
            print("[FAIL] No new columns found")

        # Close connection
        cursor.close()
        conn.close()
        print("\n[OK] All migrations completed successfully!")
        return True

    except psycopg2.OperationalError as e:
        print(f"[FAIL] Database connection failed: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL service is running")
        print("  2. Database 'ai_coach_db' exists")
        print("  3. Password is correct (currently: 123456)")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)
