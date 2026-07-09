package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRegister_PasswordTooShort(t *testing.T) {
	svc := NewAuthService(nil)
	_, err := svc.Register(context.Background(), RegisterInput{
		Username: "alice",
		Password: "12345",
		Nickname: "Alice",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "password")
}
