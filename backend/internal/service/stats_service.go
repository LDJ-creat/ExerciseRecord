package service

import (
	"context"
	"errors"
	"math"
	"sort"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var ErrInvalidPeriod = errors.New("invalid period")
var ErrInvalidDimension = errors.New("invalid dimension")

type StatsService struct {
	db *gorm.DB
}

func NewStatsService(db *gorm.DB) *StatsService {
	return &StatsService{db: db}
}

type PersonalStatsSummary struct {
	TotalCount    int64   `json:"total_count"`
	TotalDuration uint64  `json:"total_duration"`
	TotalDistance float64 `json:"total_distance"`
	TotalCalories uint64  `json:"total_calories"`
}

type PeriodStat struct {
	Label    string  `json:"label"`
	Count    int64   `json:"count"`
	Duration uint64  `json:"duration"`
	Distance float64 `json:"distance"`
	Calories uint64  `json:"calories"`
}

type SportTypeStat struct {
	SportTypeID uint64  `json:"sport_type_id"`
	Name        string  `json:"name"`
	Count       int64   `json:"count"`
	Percent     float64 `json:"percent"`
}

type TrendPoint struct {
	Date         string  `json:"date"`
	Duration     uint64  `json:"duration"`
	Distance     float64 `json:"distance"`
	Calories     uint64  `json:"calories"`
	Count        int64   `json:"count"`
	PrimarySport string  `json:"primary_sport,omitempty"`
}

type PersonalStatsResult struct {
	Summary     PersonalStatsSummary `json:"summary"`
	ByPeriod    []PeriodStat         `json:"by_period"`
	BySportType []SportTypeStat      `json:"by_sport_type"`
	Trend       []TrendPoint         `json:"trend"`
}

type RankingEntry struct {
	Rank     int     `json:"rank"`
	UserID   uint64  `json:"user_id"`
	Nickname string  `json:"nickname"`
	Value    float64 `json:"value"`
}

type MyRank struct {
	Rank  int     `json:"rank"`
	Value float64 `json:"value"`
}

type RankingResult struct {
	Rankings []RankingEntry `json:"rankings"`
	MyRank   MyRank         `json:"my_rank"`
}

type rankingCheckInRow struct {
	UserID   uint64
	Duration uint
	Distance *float64
}

type userRankingAgg struct {
	UserID uint64
	Value  float64
}

type checkInRow struct {
	CheckDate   time.Time
	SportTypeID uint64
	Duration    uint
	Distance    *float64
	Calories    *uint
}

func (s *StatsService) GetPersonalStats(ctx context.Context, userID uint64, period string) (*PersonalStatsResult, error) {
	start, end, err := periodDateRange(period)
	if err != nil {
		return nil, err
	}

	rows, err := s.fetchCheckInRows(ctx, userID, start, end)
	if err != nil {
		return nil, err
	}

	summary := aggregateSummary(rows)
	byPeriod := aggregateByPeriod(rows, period)
	bySportType, err := s.aggregateBySportType(ctx, rows)
	if err != nil {
		return nil, err
	}
	trend, err := s.buildTrend(ctx, rows)
	if err != nil {
		return nil, err
	}

	return &PersonalStatsResult{
		Summary:     summary,
		ByPeriod:    byPeriod,
		BySportType: bySportType,
		Trend:       trend,
	}, nil
}

func (s *StatsService) GetRanking(ctx context.Context, userID uint64, dimension, period string) (*RankingResult, error) {
	start, end, err := rankingPeriodDateRange(period)
	if err != nil {
		return nil, err
	}
	if err := validateDimension(dimension); err != nil {
		return nil, err
	}

	rows, err := s.fetchRankingRows(ctx, start, end)
	if err != nil {
		return nil, err
	}

	aggs := aggregateRanking(rows, dimension)
	if len(aggs) == 0 {
		return &RankingResult{
			Rankings: []RankingEntry{},
			MyRank:   MyRank{Rank: 0, Value: 0},
		}, nil
	}

	sortRankingAggs(aggs)

	nicknames, err := s.fetchUserNicknames(ctx, topRankingUserIDs(aggs))
	if err != nil {
		return nil, err
	}

	rankings := make([]RankingEntry, 0, min(len(aggs), 50))
	for i, agg := range aggs {
		rank := i + 1
		if rank > 50 {
			break
		}
		rankings = append(rankings, RankingEntry{
			Rank:     rank,
			UserID:   agg.UserID,
			Nickname: nicknames[agg.UserID],
			Value:    agg.Value,
		})
	}

	myRank := MyRank{Rank: 0, Value: 0}
	for i, agg := range aggs {
		if agg.UserID == userID {
			myRank = MyRank{Rank: i + 1, Value: agg.Value}
			break
		}
	}

	return &RankingResult{
		Rankings: rankings,
		MyRank:   myRank,
	}, nil
}

func (s *StatsService) fetchRankingRows(ctx context.Context, start, end *time.Time) ([]rankingCheckInRow, error) {
	query := s.db.WithContext(ctx).Model(&model.CheckIn{}).
		Select("user_id", "duration", "distance")

	if start != nil {
		query = query.Where("check_date >= ?", *start)
	}
	if end != nil {
		query = query.Where("check_date <= ?", *end)
	}

	var rows []rankingCheckInRow
	if err := query.Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func aggregateRanking(rows []rankingCheckInRow, dimension string) []userRankingAgg {
	buckets := make(map[uint64]float64)
	for _, row := range rows {
		switch dimension {
		case "count":
			buckets[row.UserID]++
		case "duration":
			buckets[row.UserID] += float64(row.Duration)
		case "distance":
			if row.Distance != nil {
				buckets[row.UserID] += *row.Distance
			}
		}
	}

	result := make([]userRankingAgg, 0, len(buckets))
	for userID, value := range buckets {
		if dimension == "distance" {
			value = roundPercent(value)
		}
		result = append(result, userRankingAgg{UserID: userID, Value: value})
	}
	return result
}

func sortRankingAggs(aggs []userRankingAgg) {
	sort.Slice(aggs, func(i, j int) bool {
		if aggs[i].Value != aggs[j].Value {
			return aggs[i].Value > aggs[j].Value
		}
		return aggs[i].UserID < aggs[j].UserID
	})
}

func topRankingUserIDs(aggs []userRankingAgg) []uint64 {
	limit := min(len(aggs), 50)
	ids := make([]uint64, limit)
	for i := 0; i < limit; i++ {
		ids[i] = aggs[i].UserID
	}
	return ids
}

func (s *StatsService) fetchUserNicknames(ctx context.Context, userIDs []uint64) (map[uint64]string, error) {
	if len(userIDs) == 0 {
		return map[uint64]string{}, nil
	}

	var users []model.User
	if err := s.db.WithContext(ctx).
		Select("id", "nickname").
		Where("id IN ?", userIDs).
		Find(&users).Error; err != nil {
		return nil, err
	}

	nicknames := make(map[uint64]string, len(users))
	for _, u := range users {
		nicknames[u.ID] = u.Nickname
	}
	return nicknames, nil
}

func rankingPeriodDateRange(period string) (*time.Time, *time.Time, error) {
	switch period {
	case "week", "month":
		return periodDateRange(period)
	case "all":
		return nil, nil, nil
	default:
		return nil, nil, ErrInvalidPeriod
	}
}

func validateDimension(dimension string) error {
	switch dimension {
	case "count", "duration", "distance":
		return nil
	default:
		return ErrInvalidDimension
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (s *StatsService) fetchCheckInRows(ctx context.Context, userID uint64, start, end *time.Time) ([]checkInRow, error) {
	query := s.db.WithContext(ctx).Model(&model.CheckIn{}).
		Select("check_date", "sport_type_id", "duration", "distance", "calories").
		Where("user_id = ?", userID)

	if start != nil {
		query = query.Where("check_date >= ?", *start)
	}
	if end != nil {
		query = query.Where("check_date <= ?", *end)
	}

	var rows []checkInRow
	if err := query.Order("check_date ASC").Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func aggregateSummary(rows []checkInRow) PersonalStatsSummary {
	var summary PersonalStatsSummary
	for _, row := range rows {
		summary.TotalCount++
		summary.TotalDuration += uint64(row.Duration)
		if row.Distance != nil {
			summary.TotalDistance += *row.Distance
		}
		if row.Calories != nil {
			summary.TotalCalories += uint64(*row.Calories)
		}
	}
	return summary
}

func aggregateByPeriod(rows []checkInRow, period string) []PeriodStat {
	buckets := make(map[string]*PeriodStat)
	var labels []string

	for _, row := range rows {
		label := periodLabel(period, row.CheckDate)
		stat, ok := buckets[label]
		if !ok {
			stat = &PeriodStat{Label: label}
			buckets[label] = stat
			labels = append(labels, label)
		}
		stat.Count++
		stat.Duration += uint64(row.Duration)
		if row.Distance != nil {
			stat.Distance += *row.Distance
		}
		if row.Calories != nil {
			stat.Calories += uint64(*row.Calories)
		}
	}

	sort.Strings(labels)
	result := make([]PeriodStat, 0, len(labels))
	for _, label := range labels {
		result = append(result, *buckets[label])
	}
	return result
}

func (s *StatsService) aggregateBySportType(ctx context.Context, rows []checkInRow) ([]SportTypeStat, error) {
	if len(rows) == 0 {
		return []SportTypeStat{}, nil
	}

	counts := make(map[uint64]int64)
	for _, row := range rows {
		counts[row.SportTypeID]++
	}

	ids := make([]uint64, 0, len(counts))
	for id := range counts {
		ids = append(ids, id)
	}

	var sportTypes []model.SportType
	if err := s.db.WithContext(ctx).
		Select("id", "name").
		Where("id IN ?", ids).
		Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	nameByID := make(map[uint64]string, len(sportTypes))
	for _, st := range sportTypes {
		nameByID[st.ID] = st.Name
	}

	total := int64(len(rows))
	result := make([]SportTypeStat, 0, len(counts))
	for id, count := range counts {
		percent := roundPercent(float64(count) / float64(total) * 100)
		result = append(result, SportTypeStat{
			SportTypeID: id,
			Name:        nameByID[id],
			Count:       count,
			Percent:     percent,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].Count != result[j].Count {
			return result[i].Count > result[j].Count
		}
		return result[i].SportTypeID < result[j].SportTypeID
	})
	return result, nil
}

type trendDayAgg struct {
	duration       uint64
	distance       float64
	calories       uint64
	count          int64
	sportDurations map[uint64]uint64
}

func formatCheckDate(t time.Time) string {
	return t.In(time.Local).Format("2006-01-02")
}

func aggregateTrendRows(rows []checkInRow) (map[string]*trendDayAgg, []string) {
	buckets := make(map[string]*trendDayAgg)
	var dates []string

	for _, row := range rows {
		date := formatCheckDate(row.CheckDate)
		day, ok := buckets[date]
		if !ok {
			day = &trendDayAgg{sportDurations: make(map[uint64]uint64)}
			buckets[date] = day
			dates = append(dates, date)
		}
		day.count++
		day.duration += uint64(row.Duration)
		if row.Distance != nil {
			day.distance += *row.Distance
		}
		if row.Calories != nil {
			day.calories += uint64(*row.Calories)
		}
		day.sportDurations[row.SportTypeID] += uint64(row.Duration)
	}

	sort.Strings(dates)
	return buckets, dates
}

func primarySportTypeID(day *trendDayAgg) uint64 {
	var sportID uint64
	var maxDur uint64
	for id, dur := range day.sportDurations {
		if dur > maxDur {
			maxDur = dur
			sportID = id
		}
	}
	return sportID
}

func (s *StatsService) buildTrend(ctx context.Context, rows []checkInRow) ([]TrendPoint, error) {
	if len(rows) == 0 {
		return []TrendPoint{}, nil
	}

	buckets, dates := aggregateTrendRows(rows)

	sportIDs := make(map[uint64]struct{})
	for _, date := range dates {
		if id := primarySportTypeID(buckets[date]); id != 0 {
			sportIDs[id] = struct{}{}
		}
	}

	ids := make([]uint64, 0, len(sportIDs))
	for id := range sportIDs {
		ids = append(ids, id)
	}

	nameByID := make(map[uint64]string, len(ids))
	if len(ids) > 0 {
		var sportTypes []model.SportType
		if err := s.db.WithContext(ctx).
			Select("id", "name").
			Where("id IN ?", ids).
			Find(&sportTypes).Error; err != nil {
			return nil, err
		}
		for _, st := range sportTypes {
			nameByID[st.ID] = st.Name
		}
	}

	result := make([]TrendPoint, 0, len(dates))
	for _, date := range dates {
		day := buckets[date]
		primaryID := primarySportTypeID(day)
		result = append(result, TrendPoint{
			Date:         date,
			Duration:     day.duration,
			Distance:     day.distance,
			Calories:     day.calories,
			Count:        day.count,
			PrimarySport: nameByID[primaryID],
		})
	}
	return result, nil
}

func periodDateRange(period string) (*time.Time, *time.Time, error) {
	today := todayDate()
	switch period {
	case "day":
		return &today, &today, nil
	case "week":
		start := beginningOfWeek(today)
		return &start, &today, nil
	case "month":
		start := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, today.Location())
		return &start, &today, nil
	case "all":
		return nil, nil, nil
	default:
		return nil, nil, ErrInvalidPeriod
	}
}

func beginningOfWeek(d time.Time) time.Time {
	weekday := int(d.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	return d.AddDate(0, 0, -(weekday - 1))
}

// periodLabel: day/week/month use daily buckets; all uses monthly buckets (YYYY-MM).
func periodLabel(period string, date time.Time) string {
	if period == "all" {
		return date.Format("2006-01")
	}
	return date.Format("2006-01-02")
}

func roundPercent(value float64) float64 {
	return math.Round(value*10) / 10
}
