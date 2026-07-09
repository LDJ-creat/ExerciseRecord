package handler

import (
	"github.com/exercise-record/backend/internal/model"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SportHandler struct {
	db *gorm.DB
}

func NewSportHandler(db *gorm.DB) *SportHandler {
	return &SportHandler{db: db}
}

type sportTypeItem struct {
	ID           uint64 `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	NeedDistance uint8  `json:"need_distance"`
	NeedCalories uint8  `json:"need_calories"`
}

func (h *SportHandler) List(c *gin.Context) {
	var types []model.SportType
	if err := h.db.Where("is_active = ?", 1).Order("sort_order ASC").Find(&types).Error; err != nil {
		response.ServerError(c, "failed to load sport types")
		return
	}

	items := make([]sportTypeItem, len(types))
	for i, st := range types {
		items[i] = sportTypeItem{
			ID:           st.ID,
			Code:         st.Code,
			Name:         st.Name,
			NeedDistance: st.NeedDistance,
			NeedCalories: st.NeedCalories,
		}
	}

	response.OK(c, items)
}
