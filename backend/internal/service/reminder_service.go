package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var (
	ErrSettingNotFound       = errors.New("reminder setting not found")
	ErrInvalidRemindTime     = errors.New("invalid remind time format")
	ErrInvalidIsEnabled      = errors.New("invalid is_enabled value")
	ErrInvalidReminderStatus = errors.New("invalid reminder status")
)

type ReminderService struct {
	db *gorm.DB
}

func NewReminderService(db *gorm.DB) *ReminderService {
	return &ReminderService{db: db}
}

type ReminderSettingResult struct {
	IsEnabled  uint8  `json:"is_enabled"`
	RemindTime string `json:"remind_time"`
}

type UpdateReminderInput struct {
	IsEnabled  uint8
	RemindTime string
}

type CreateReminderLogInput struct {
	RemindDate string
	Status     *uint8
}

type ReminderLogResult struct {
	ID         uint64  `json:"id"`
	RemindDate string  `json:"remind_date"`
	SentAt     *string `json:"sent_at"`
	Status     uint8   `json:"status"`
}

type ListReminderLogsResult struct {
	Items    []ReminderLogResult `json:"items"`
	Total    int64               `json:"total"`
	Page     int                 `json:"page"`
	PageSize int                 `json:"page_size"`
}

func (s *ReminderService) GetSettings(ctx context.Context, userID uint64) (*ReminderSettingResult, error) {
	setting, err := s.findSetting(ctx, userID)
	if err != nil {
		return nil, err
	}
	return toReminderSettingResult(setting), nil
}

func (s *ReminderService) UpdateSettings(ctx context.Context, userID uint64, input UpdateReminderInput) (*ReminderSettingResult, error) {
	if input.IsEnabled > 1 {
		return nil, ErrInvalidIsEnabled
	}
	if _, err := parseRemindTime(input.RemindTime); err != nil {
		return nil, ErrInvalidRemindTime
	}

	setting, err := s.findSetting(ctx, userID)
	if err != nil {
		return nil, err
	}

	setting.IsEnabled = input.IsEnabled
	setting.RemindTime = normalizeRemindTime(input.RemindTime)
	if err := s.db.WithContext(ctx).Save(setting).Error; err != nil {
		return nil, fmt.Errorf("update reminder setting: %w", err)
	}

	return toReminderSettingResult(setting), nil
}

func (s *ReminderService) ListLogs(ctx context.Context, userID uint64, page, pageSize int) (*ListReminderLogsResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	query := s.db.WithContext(ctx).Model(&model.ReminderLog{}).Where("user_id = ?", userID)

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("count reminder logs: %w", err)
	}

	var records []model.ReminderLog
	offset := (page - 1) * pageSize
	if err := query.Order("remind_date DESC, id DESC").Offset(offset).Limit(pageSize).Find(&records).Error; err != nil {
		return nil, fmt.Errorf("list reminder logs: %w", err)
	}

	items := make([]ReminderLogResult, len(records))
	for i := range records {
		items[i] = *toReminderLogResult(&records[i])
	}

	return &ListReminderLogsResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *ReminderService) CreateLog(ctx context.Context, userID uint64, input CreateReminderLogInput) (*ReminderLogResult, error) {
	if input.Status == nil {
		return nil, ErrInvalidReminderStatus
	}
	status := *input.Status
	if status > 2 {
		return nil, ErrInvalidReminderStatus
	}

	remindDateStr := input.RemindDate
	if remindDateStr == "" {
		remindDateStr = todayDate().Format("2006-01-02")
	}

	remindDate, err := parseDate(remindDateStr)
	if err != nil {
		return nil, ErrInvalidDate
	}

	var existing model.ReminderLog
	findErr := s.db.WithContext(ctx).
		Where("user_id = ? AND remind_date = ?", userID, remindDate).
		First(&existing).Error

	if findErr == nil {
		existing.Status = status
		if status == 1 {
			now := time.Now()
			existing.SentAt = &now
		} else {
			existing.SentAt = nil
		}
		if err := s.db.WithContext(ctx).Save(&existing).Error; err != nil {
			return nil, fmt.Errorf("update reminder log: %w", err)
		}
		return toReminderLogResult(&existing), nil
	}
	if !errors.Is(findErr, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("find reminder log: %w", findErr)
	}

	record := model.ReminderLog{
		UserID:     userID,
		RemindDate: remindDate,
		Status:     status,
	}
	if status == 1 {
		now := time.Now()
		record.SentAt = &now
	}

	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		return nil, fmt.Errorf("create reminder log: %w", err)
	}

	return toReminderLogResult(&record), nil
}

func (s *ReminderService) findSetting(ctx context.Context, userID uint64) (*model.ReminderSetting, error) {
	var setting model.ReminderSetting
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).First(&setting).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSettingNotFound
		}
		return nil, fmt.Errorf("find reminder setting: %w", err)
	}
	return &setting, nil
}

func toReminderSettingResult(setting *model.ReminderSetting) *ReminderSettingResult {
	return &ReminderSettingResult{
		IsEnabled:  setting.IsEnabled,
		RemindTime: formatRemindTime(setting.RemindTime),
	}
}

func toReminderLogResult(record *model.ReminderLog) *ReminderLogResult {
	result := &ReminderLogResult{
		ID:         record.ID,
		RemindDate: record.RemindDate.Format("2006-01-02"),
		Status:     record.Status,
	}
	if record.SentAt != nil {
		formatted := record.SentAt.Format(time.RFC3339)
		result.SentAt = &formatted
	}
	return result
}

func formatRemindTime(value string) string {
	if len(value) >= 5 {
		return value[:5]
	}
	return value
}

func normalizeRemindTime(value string) string {
	parsed, err := parseRemindTime(value)
	if err != nil {
		return value
	}
	return parsed.Format("15:04:05")
}

func parseRemindTime(value string) (time.Time, error) {
	layouts := []string{"15:04", "15:04:05"}
	for _, layout := range layouts {
		parsed, err := time.Parse(layout, value)
		if err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, ErrInvalidRemindTime
}
