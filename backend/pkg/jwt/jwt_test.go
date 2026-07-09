package jwt

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateParse_RoundTrip(t *testing.T) {
	secret := "test-secret-key"
	token, err := Generate(secret, 42, "alice")
	require.NoError(t, err)
	require.NotEmpty(t, token)

	claims, err := Parse(secret, token)
	require.NoError(t, err)
	assert.Equal(t, uint64(42), claims.UserID)
	assert.Equal(t, "alice", claims.Username)
}

func TestParse_InvalidToken(t *testing.T) {
	_, err := Parse("secret", "not-a-valid-token")
	assert.Error(t, err)
}

func TestParse_WrongSecret(t *testing.T) {
	token, err := Generate("secret-a", 1, "bob")
	require.NoError(t, err)

	_, err = Parse("secret-b", token)
	assert.Error(t, err)
}
