package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSportService_CreateCustomAndList(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "sport_custom_user")
	svc := NewSportService(db)
	ctx := context.Background()

	created, err := svc.CreateCustom(ctx, userID, CreateCustomSportTypeInput{
		Name:         "瑜伽",
		NeedCalories: true,
	})
	require.NoError(t, err)
	assert.Equal(t, "瑜伽", created.Name)
	assert.Equal(t, uint8(1), created.IsCustom)
	assert.Equal(t, uint8(1), created.NeedCalories)
	assert.Equal(t, uint8(0), created.NeedDistance)

	items, err := svc.ListForUser(ctx, userID)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(items), 7)

	var found bool
	for _, item := range items {
		if item.ID == created.ID {
			found = true
			assert.Equal(t, "瑜伽", item.Name)
		}
	}
	assert.True(t, found)
}

func TestSportService_DuplicateNameRejected(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "sport_dup_user")
	svc := NewSportService(db)
	ctx := context.Background()

	_, err := svc.CreateCustom(ctx, userID, CreateCustomSportTypeInput{Name: "普拉提"})
	require.NoError(t, err)

	_, err = svc.CreateCustom(ctx, userID, CreateCustomSportTypeInput{Name: "普拉提"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrDuplicateSportName)
}

func TestSportService_IsAllowedForUser(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userA := createTestUser(t, db, "sport_user_a")
	userB := createTestUser(t, db, "sport_user_b")
	svc := NewSportService(db)
	ctx := context.Background()

	custom, err := svc.CreateCustom(ctx, userA, CreateCustomSportTypeInput{Name: "拳击"})
	require.NoError(t, err)

	ok, err := svc.IsAllowedForUser(ctx, userA, custom.ID)
	require.NoError(t, err)
	assert.True(t, ok)

	ok, err = svc.IsAllowedForUser(ctx, userB, custom.ID)
	require.NoError(t, err)
	assert.False(t, ok)

	ok, err = svc.IsAllowedForUser(ctx, userB, 1)
	require.NoError(t, err)
	assert.True(t, ok)
}
