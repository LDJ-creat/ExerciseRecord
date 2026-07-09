package optional

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFloat64_UnmarshalJSON(t *testing.T) {
	t.Run("absent field leaves zero value", func(t *testing.T) {
		var payload struct {
			Name string `json:"name"`
		}
		require.NoError(t, json.Unmarshal([]byte(`{"name":"test"}`), &payload))
	})

	t.Run("null clears value", func(t *testing.T) {
		var payload struct {
			Height Float64 `json:"height"`
		}
		require.NoError(t, json.Unmarshal([]byte(`{"height":null}`), &payload))
		assert.True(t, payload.Height.Defined)
		assert.Nil(t, payload.Height.Value)
	})

	t.Run("number sets value", func(t *testing.T) {
		var payload struct {
			Height Float64 `json:"height"`
		}
		require.NoError(t, json.Unmarshal([]byte(`{"height":175.5}`), &payload))
		assert.True(t, payload.Height.Defined)
		require.NotNil(t, payload.Height.Value)
		assert.Equal(t, 175.5, *payload.Height.Value)
	})
}
