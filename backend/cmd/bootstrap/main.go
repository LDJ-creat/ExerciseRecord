package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/exercise-record/backend/internal/config"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	cfg := config.Load()

	rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&multiStatements=true",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort)

	db, err := sql.Open("mysql", rootDSN)
	if err != nil {
		log.Fatalf("open mysql: %v", err)
	}
	defer db.Close()

	if _, err := db.Exec(fmt.Sprintf(
		"CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
		cfg.DBName,
	)); err != nil {
		log.Fatalf("create database: %v", err)
	}
	log.Printf("database %q ready", cfg.DBName)

	db.Close()

	dbDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&multiStatements=true",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
	db, err = sql.Open("mysql", dbDSN)
	if err != nil {
		log.Fatalf("open mysql db: %v", err)
	}
	defer db.Close()

	root := findRepoRoot()
	for _, name := range []string{"database/schema.sql", "database/seed.sql"} {
		path := filepath.Join(root, name)
		body, err := os.ReadFile(path)
		if err != nil {
			log.Fatalf("read %s: %v", path, err)
		}
		if _, err := db.Exec(string(body)); err != nil {
			log.Fatalf("exec %s: %v", name, err)
		}
		log.Printf("applied %s", name)
	}

	var tableCount int
	if err := db.QueryRow(
		"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ?",
		cfg.DBName,
	).Scan(&tableCount); err != nil {
		log.Fatalf("count tables: %v", err)
	}

	var sportCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM sport_types").Scan(&sportCount); err != nil {
		log.Fatalf("count sport_types: %v", err)
	}

	log.Printf("bootstrap ok: tables=%d sport_types=%d", tableCount, sportCount)
}

func findRepoRoot() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "database", "schema.sql")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			log.Fatal("could not find repo root (database/schema.sql)")
		}
		dir = parent
	}
}
