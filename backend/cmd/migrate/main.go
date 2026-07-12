package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/exercise-record/backend/internal/config"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var tables = []string{
	"users",
	"sport_types",
	"check_ins",
	"goals",
	"reminder_settings",
	"reminder_logs",
}

func main() {
	_ = config.Load()

	srcCfg := config.MigrationSourceConfig()
	dstCfg := config.MigrationTargetConfig()

	srcDSN := srcCfg.MySQLDSN()
	dstAdminDSN := dstCfg.OpenGaussAdminDSN()
	dstDSN := dstCfg.OpenGaussDSN()

	log.Println("connecting to MySQL source...")
	src, err := sql.Open("mysql", srcDSN)
	if err != nil {
		log.Fatalf("open mysql: %v", err)
	}
	defer src.Close()
	if err := src.Ping(); err != nil {
		log.Fatalf("ping mysql: %v", err)
	}

	log.Println("connecting to OpenGauss admin...")
	admin, err := sql.Open("pgx", dstAdminDSN)
	if err != nil {
		log.Fatalf("open opengauss admin: %v", err)
	}
	defer admin.Close()
	if err := admin.Ping(); err != nil {
		log.Fatalf("ping opengauss admin: %v", err)
	}

	if err := ensureDatabase(admin, dstCfg.DBName); err != nil {
		log.Fatalf("ensure database: %v", err)
	}

	log.Println("connecting to OpenGauss target database...")
	dst, err := sql.Open("pgx", dstDSN)
	if err != nil {
		log.Fatalf("open opengauss: %v", err)
	}
	defer dst.Close()
	if err := dst.Ping(); err != nil {
		log.Fatalf("ping opengauss: %v", err)
	}

	if err := applySchema(dst); err != nil {
		log.Fatalf("apply schema: %v", err)
	}

	if err := clearTargetTables(dst); err != nil {
		log.Fatalf("clear target tables: %v", err)
	}

	for _, table := range tables {
		count, err := copyTable(src, dst, table)
		if err != nil {
			log.Fatalf("copy %s: %v", table, err)
		}
		log.Printf("copied %s: %d rows", table, count)
	}

	for _, table := range tables {
		if err := resetSequence(dst, table); err != nil {
			log.Fatalf("reset sequence for %s: %v", table, err)
		}
	}

	log.Println("verifying row counts...")
	for _, table := range tables {
		srcCount, err := countRows(src, table)
		if err != nil {
			log.Fatalf("count mysql %s: %v", table, err)
		}
		dstCount, err := countRows(dst, table)
		if err != nil {
			log.Fatalf("count opengauss %s: %v", table, err)
		}
		if srcCount != dstCount {
			log.Fatalf("row count mismatch for %s: mysql=%d opengauss=%d", table, srcCount, dstCount)
		}
		log.Printf("verified %s: %d rows", table, dstCount)
	}

	log.Println("migration completed successfully")
}

func ensureDatabase(admin *sql.DB, dbName string) error {
	var exists bool
	err := admin.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)",
		dbName,
	).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		log.Printf("database %q already exists", dbName)
		return nil
	}

	quoted := quoteIdent(dbName)
	if _, err := admin.Exec(fmt.Sprintf("CREATE DATABASE %s ENCODING 'UTF8'", quoted)); err != nil {
		return err
	}
	log.Printf("created database %q", dbName)
	return nil
}

func applySchema(dst *sql.DB) error {
	body, err := os.ReadFile(findRepoFile("database", "schema_opengauss.sql"))
	if err != nil {
		return err
	}
	if _, err := dst.Exec(string(body)); err != nil {
		return err
	}
	log.Println("applied database/schema_opengauss.sql")
	return nil
}

func clearTargetTables(dst *sql.DB) error {
	stmt := "TRUNCATE TABLE " + strings.Join(tables, ", ") + " RESTART IDENTITY CASCADE"
	if _, err := dst.Exec(stmt); err != nil {
		return err
	}
	log.Println("truncated target tables")
	return nil
}

func copyTable(src, dst *sql.DB, table string) (int, error) {
	rows, err := src.Query("SELECT * FROM " + table)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return 0, err
	}

	placeholders := make([]string, len(cols))
	for i := range placeholders {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
	}
	insertSQL := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s)",
		table,
		strings.Join(cols, ", "),
		strings.Join(placeholders, ", "),
	)

	count := 0
	for rows.Next() {
		values := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range values {
			ptrs[i] = &values[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return count, err
		}
		for i, v := range values {
			if b, ok := v.([]byte); ok {
				values[i] = string(b)
			}
		}
		if _, err := dst.Exec(insertSQL, values...); err != nil {
			return count, fmt.Errorf("insert row %d: %w", count+1, err)
		}
		count++
	}
	return count, rows.Err()
}

func resetSequence(dst *sql.DB, table string) error {
	_, err := dst.Exec(fmt.Sprintf(
		"SELECT setval(pg_get_serial_sequence('%s', 'id'), COALESCE((SELECT MAX(id) FROM %s), 1), true)",
		table, table,
	))
	return err
}

func countRows(db *sql.DB, table string) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count)
	return count, err
}

func findRepoFile(parts ...string) string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	for {
		candidate := filepath.Join(append([]string{dir}, parts...)...)
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			log.Fatalf("could not find %s", filepath.Join(parts...))
		}
		dir = parent
	}
}

func quoteIdent(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}
