package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/exercise-record/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestAuthMiddleware_MissingToken(t *testing.T) {
	r := gin.New()
	r.GET("/protected", AuthMiddleware("secret"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	secret := "middleware-test-secret"
	token, err := jwt.Generate(secret, 99, "carol")
	if err != nil {
		t.Fatal(err)
	}

	r := gin.New()
	r.GET("/protected", AuthMiddleware(secret), func(c *gin.Context) {
		userID, ok := GetUserID(c)
		assert.True(t, ok)
		assert.Equal(t, uint64(99), userID)
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	r := gin.New()
	r.GET("/protected", AuthMiddleware("secret"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.value")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
