package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"gorm.io/gorm"
)

type DashboardStats struct {
	TotalProducts   int            `json:"totalProducts"`
	TotalOrders     int            `json:"totalOrders"`
	TotalPersonaggi int            `json:"totalPersonaggi"`
	TotalRevenue    float64        `json:"totalRevenue"`
	SalesData       []MonthlySales `json:"salesData"`
	RecentActivity  []Activity     `json:"recentActivity"`
}

type MonthlySales struct {
	Month string  `json:"month"`
	Sales float64 `json:"sales"`
}

type Activity struct {
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Time        time.Time `json:"time"`
}

func GetDashboardStats(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		stats := DashboardStats{
			SalesData:      []MonthlySales{},
			RecentActivity: []Activity{},
		}

		var productsCount, personaggiCount, ordersCount int64
		var totalRevenue float64

		db.Table("products").Where("deleted_at IS NULL").Count(&productsCount)
		db.Table("personaggi").Where("deleted_at IS NULL").Count(&personaggiCount)
		db.Table("orders").Where("deleted_at IS NULL").Count(&ordersCount)
		db.Table("orders").Where("deleted_at IS NULL").Select("COALESCE(SUM(total), 0)").Scan(&totalRevenue)

		stats.TotalProducts = int(productsCount)
		stats.TotalPersonaggi = int(personaggiCount)
		stats.TotalOrders = int(ordersCount)
		stats.TotalRevenue = totalRevenue

		now := time.Now()
		for i := 5; i >= 0; i-- {
			month := now.AddDate(0, -i, 0)
			var monthlySales float64
			db.Table("orders").
				Where("EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ?", 
					int(month.Month()), month.Year()).
				Select("COALESCE(SUM(total), 0)").
				Scan(&monthlySales)
			
			stats.SalesData = append(stats.SalesData, MonthlySales{
				Month: month.Format("January"),
				Sales: monthlySales,
			})
		}

		type Row struct {
			Name      string
			CreatedAt time.Time
		}
		
		var personaggi []Row
		db.Table("personaggi").
			Where("deleted_at IS NULL").
			Order("created_at DESC").
			Limit(3).
			Select("nome as name, created_at").
			Scan(&personaggi)
		
		for _, p := range personaggi {
			stats.RecentActivity = append(stats.RecentActivity, Activity{
				Type:        "personaggio",
				Description: "Personaggio created: " + p.Name,
				Time:        p.CreatedAt,
			})
		}

		var products []Row
		db.Table("products").
			Where("deleted_at IS NULL").
			Order("created_at DESC").
			Limit(3).
			Select("name, created_at").
			Scan(&products)
		
		for _, p := range products {
			stats.RecentActivity = append(stats.RecentActivity, Activity{
				Type:        "product",
				Description: "Product created: " + p.Name,
				Time:        p.CreatedAt,
			})
		}

		for i := 0; i < len(stats.RecentActivity); i++ {
			for j := i + 1; j < len(stats.RecentActivity); j++ {
				if stats.RecentActivity[i].Time.Before(stats.RecentActivity[j].Time) {
					stats.RecentActivity[i], stats.RecentActivity[j] = stats.RecentActivity[j], stats.RecentActivity[i]
				}
			}
		}

		if len(stats.RecentActivity) > 5 {
			stats.RecentActivity = stats.RecentActivity[:5]
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}
