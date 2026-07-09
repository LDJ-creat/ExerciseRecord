package optional

import (
	"bytes"
	"encoding/json"
)

// Float64 distinguishes JSON field absent vs explicit null vs value.
// - absent: Defined=false
// - null:   Defined=true, Value=nil
// - number: Defined=true, Value=&n
type Float64 struct {
	Defined bool
	Value   *float64
}

func (f *Float64) UnmarshalJSON(data []byte) error {
	f.Defined = true
	if bytes.Equal(data, []byte("null")) {
		f.Value = nil
		return nil
	}
	var v float64
	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}
	f.Value = &v
	return nil
}
