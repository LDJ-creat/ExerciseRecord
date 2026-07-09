//go:build integration

package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

const e2eBase = "http://127.0.0.1:8080"

type apiResp struct {
	Code    int             `json:"code"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func e2eRequest(t *testing.T, method, path string, body any, token string) apiResp {
	t.Helper()
	var reader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		require.NoError(t, err)
		reader = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, e2eBase+path, reader)
	require.NoError(t, err)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	raw, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	var out apiResp
	require.NoError(t, json.Unmarshal(raw, &out))
	return out
}

func e2eHealth(t *testing.T) {
	t.Helper()
	resp, err := http.Get(e2eBase + "/health")
	require.NoError(t, err)
	defer resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestE2E_AcceptanceFlows(t *testing.T) {
	e2eHealth(t)

	suffix := fmt.Sprintf("%d", time.Now().UnixNano()%100000)
	userA := "e2e_a_" + suffix
	userB := "e2e_b_" + suffix
	pass := "Test123456"
	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	// Flow A
	reg := e2eRequest(t, http.MethodPost, "/api/auth/register", map[string]string{
		"username": userA, "password": pass, "nickname": "E2E A",
	}, "")
	require.Equal(t, 0, reg.Code)
	login := e2eRequest(t, http.MethodPost, "/api/auth/login", map[string]string{
		"username": userA, "password": pass,
	}, "")
	require.Equal(t, 0, login.Code)
	var loginData struct {
		Token string `json:"token"`
	}
	require.NoError(t, json.Unmarshal(login.Data, &loginData))
	tokenA := loginData.Token

	sports := e2eRequest(t, http.MethodGet, "/api/sport-types", nil, tokenA)
	require.Equal(t, 0, sports.Code)
	var sportList []struct {
		ID   int    `json:"id"`
		Code string `json:"code"`
	}
	require.NoError(t, json.Unmarshal(sports.Data, &sportList))
	var runningID, cyclingID int
	for _, s := range sportList {
		if s.Code == "running" {
			runningID = s.ID
		}
		if s.Code == "cycling" {
			cyclingID = s.ID
		}
	}
	require.NotZero(t, runningID)

	checkin := e2eRequest(t, http.MethodPost, "/api/checkin", map[string]any{
		"sport_type_id": runningID, "check_date": today, "duration": 45,
		"distance": 5.2, "calories": 300, "remark": "E2E A",
	}, tokenA)
	require.Equal(t, 0, checkin.Code)
	var checkinData struct {
		ID       int `json:"id"`
		Duration int `json:"duration"`
	}
	require.NoError(t, json.Unmarshal(checkin.Data, &checkinData))
	require.Equal(t, 45, checkinData.Duration)
	t.Log("Flow A: PASS")

	// Flow B
	makeup := e2eRequest(t, http.MethodPost, "/api/checkin", map[string]any{
		"sport_type_id": cyclingID, "check_date": yesterday, "duration": 30, "distance": 10,
	}, tokenA)
	require.Equal(t, 0, makeup.Code)
	var makeupData struct {
		IsMakeup int `json:"is_makeup"`
	}
	require.NoError(t, json.Unmarshal(makeup.Data, &makeupData))
	require.Equal(t, 1, makeupData.IsMakeup)
	t.Log("Flow B: PASS")

	// Flow C
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	monday := now.AddDate(0, 0, -(weekday - 1))
	sunday := monday.AddDate(0, 0, 6)
	goal := e2eRequest(t, http.MethodPost, "/api/goal", map[string]any{
		"period_type": 1, "period_start": monday.Format("2006-01-02"),
		"period_end": sunday.Format("2006-01-02"), "target_type": 2, "target_value": 300,
	}, tokenA)
	require.Equal(t, 0, goal.Code)
	progress := e2eRequest(t, http.MethodGet, "/api/goal/progress", nil, tokenA)
	require.Equal(t, 0, progress.Code)
	var progressData struct {
		Goals []struct {
			ActualValue     float64 `json:"actual_value"`
			ProgressPercent float64 `json:"progress_percent"`
			TargetType      int     `json:"target_type"`
		} `json:"goals"`
	}
	require.NoError(t, json.Unmarshal(progress.Data, &progressData))
	require.NotEmpty(t, progressData.Goals)
	var weekGoal *struct {
		ActualValue     float64 `json:"actual_value"`
		ProgressPercent float64 `json:"progress_percent"`
		TargetType      int     `json:"target_type"`
	}
	for i := range progressData.Goals {
		if progressData.Goals[i].TargetType == 2 {
			weekGoal = &progressData.Goals[i]
			break
		}
	}
	require.NotNil(t, weekGoal)
	require.GreaterOrEqual(t, weekGoal.ActualValue, float64(75))
	require.Greater(t, weekGoal.ProgressPercent, float64(0))
	t.Log("Flow C: PASS")

	// Flow D
	stats := e2eRequest(t, http.MethodGet, "/api/stats/personal?period=month", nil, tokenA)
	require.Equal(t, 0, stats.Code)
	var statsData struct {
		Summary struct {
			TotalDuration int `json:"total_duration"`
			TotalCount    int `json:"total_count"`
		} `json:"summary"`
	}
	require.NoError(t, json.Unmarshal(stats.Data, &statsData))
	require.Equal(t, 75, statsData.Summary.TotalDuration)
	require.Equal(t, 2, statsData.Summary.TotalCount)
	t.Log("Flow D: PASS")

	// Flow E
	rank := e2eRequest(t, http.MethodGet, "/api/stats/ranking?dimension=duration&period=month", nil, tokenA)
	require.Equal(t, 0, rank.Code)
	var rankData struct {
		Rankings []any `json:"rankings"`
		MyRank   struct {
			Rank int `json:"rank"`
		} `json:"my_rank"`
	}
	require.NoError(t, json.Unmarshal(rank.Data, &rankData))
	require.NotEmpty(t, rankData.Rankings)
	require.GreaterOrEqual(t, rankData.MyRank.Rank, 1)
	t.Log("Flow E: PASS")

	// Flow F
	year, month := now.Year(), int(now.Month())
	cal := e2eRequest(t, http.MethodGet, fmt.Sprintf("/api/calendar?year=%d&month=%d", year, month), nil, tokenA)
	require.Equal(t, 0, cal.Code)
	var calData struct {
		Streak int `json:"streak"`
		Days   []struct {
			Date      string `json:"date"`
			Checked   bool   `json:"checked"`
			HeatLevel int    `json:"heat_level"`
		} `json:"days"`
	}
	require.NoError(t, json.Unmarshal(cal.Data, &calData))
	require.GreaterOrEqual(t, calData.Streak, 1)
	t.Log("Flow F: PASS")

	// Flow G
	put := e2eRequest(t, http.MethodPut, "/api/reminder", map[string]any{
		"is_enabled": 1, "remind_time": "20:00",
	}, tokenA)
	require.Equal(t, 0, put.Code)
	get := e2eRequest(t, http.MethodGet, "/api/reminder", nil, tokenA)
	require.Equal(t, 0, get.Code)
	log1 := e2eRequest(t, http.MethodPost, "/api/reminder/logs", map[string]any{
		"status": 1, "remind_date": today,
	}, tokenA)
	require.Equal(t, 0, log1.Code)
	t.Log("Flow G: PASS")

	// Flow H
	e2eRequest(t, http.MethodPost, "/api/reminder/logs", map[string]any{"status": 2, "remind_date": yesterday}, tokenA)
	e2eRequest(t, http.MethodPost, "/api/reminder/logs", map[string]any{"status": 0, "remind_date": now.AddDate(0, 0, -2).Format("2006-01-02")}, tokenA)
	logs := e2eRequest(t, http.MethodGet, "/api/reminder/logs?page=1&page_size=20", nil, tokenA)
	require.Equal(t, 0, logs.Code)
	var logData struct {
		Items []struct {
			Status int `json:"status"`
		} `json:"items"`
	}
	require.NoError(t, json.Unmarshal(logs.Data, &logData))
	require.GreaterOrEqual(t, len(logData.Items), 3)
	t.Log("Flow H: PASS")

	// Flow I — security
	e2eRequest(t, http.MethodPost, "/api/auth/register", map[string]string{
		"username": userB, "password": pass, "nickname": "E2E B",
	}, "")
	loginB := e2eRequest(t, http.MethodPost, "/api/auth/login", map[string]string{
		"username": userB, "password": pass,
	}, "")
	var loginBData struct {
		Token string `json:"token"`
	}
	require.NoError(t, json.Unmarshal(loginB.Data, &loginBData))
	forbidden := e2eRequest(t, http.MethodGet, fmt.Sprintf("/api/checkin/%d", checkinData.ID), nil, loginBData.Token)
	require.Equal(t, 40301, forbidden.Code)
	t.Log("Flow I: PASS")
}
