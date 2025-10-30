package main

import (
	"encoding/json"
	"log"

	"github.com/Naim0996/art-management-tool/backend/database"
	"github.com/Naim0996/art-management-tool/backend/models"
	"gorm.io/datatypes"
)

func main() {
	// Connetti al database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to database successfully")

	// Helper function to create JSON array
	toJSON := func(arr []string) datatypes.JSON {
		b, _ := json.Marshal(arr)
		return datatypes.JSON(b)
	}

	// Seed fumetti - Fumetti mockup per il database
	fumetti := []models.Fumetto{
		{
			Title:       "Ribelle e il Mondo Magico",
			Description: "Una fantastica avventura di Ribelle il Pigro attraverso un mondo colorato e magico. Scopri la forza interiore di Ribelle mentre affronta sfide incredibili.",
			CoverImage:  "/personaggi/giullare/Giullare_icon.png",
			Pages: toJSON([]string{
				"/fumetti/ribelle-mondo-magico/pagina1.jpg",
				"/fumetti/ribelle-mondo-magico/pagina2.jpg",
				"/fumetti/ribelle-mondo-magico/pagina3.jpg",
				"/fumetti/ribelle-mondo-magico/pagina4.jpg",
				"/fumetti/ribelle-mondo-magico/pagina5.jpg",
			}),
			Order: 1,
		},
		{
			Title:       "Il Giullare e le Risate Contagiose",
			Description: "Il Giullare porta allegria in ogni pagina di questa storia divertente. Una sequela di gag e momenti spensierati che ti faranno ridere dalla prima all'ultima tavola.",
			CoverImage:  "/personaggi/giullare/Giullare_icon.png",
			Pages: toJSON([]string{
				"/fumetti/giullare-risate/pagina1.jpg",
				"/fumetti/giullare-risate/pagina2.jpg",
				"/fumetti/giullare-risate/pagina3.jpg",
				"/fumetti/giullare-risate/pagina4.jpg",
			}),
			Order: 2,
		},
		{
			Title:       "Leon: La Leggenda",
			Description: "L'epica storia dell'eroe Leon. Forza, coraggio e determinazione si uniscono in questa avventura mozzafiato che racconta le origini del protagonista.",
			CoverImage:  "/personaggi/polemico/Polemico_icon.png",
			Pages: toJSON([]string{
				"/fumetti/leon-leggenda/pagina1.jpg",
				"/fumetti/leon-leggenda/pagina2.jpg",
				"/fumetti/leon-leggenda/pagina3.jpg",
				"/fumetti/leon-leggenda/pagina4.jpg",
				"/fumetti/leon-leggenda/pagina5.jpg",
				"/fumetti/leon-leggenda/pagina6.jpg",
			}),
			Order: 3,
		},
		{
			Title:       "Il Polemico e la Rivoluzione del Pensiero",
			Description: "Un'avventura intellettuale dove Il Polemico sfida le convenzioni e stimola riflessioni profonde. Un fumetto che fa pensare oltre le pagine.",
			CoverImage:  "/personaggi/polemico/Polemico_icon.png",
			Pages: toJSON([]string{
				"/fumetti/polemico-rivoluzione/pagina1.jpg",
				"/fumetti/polemico-rivoluzione/pagina2.jpg",
				"/fumetti/polemico-rivoluzione/pagina3.jpg",
				"/fumetti/polemico-rivoluzione/pagina4.jpg",
				"/fumetti/polemico-rivoluzione/pagina5.jpg",
			}),
			Order: 4,
		},
		{
			Title:       "Avventura a Quattro: Un Team Eccezionale",
			Description: "Tutti e quattro i personaggi insieme per la prima volta in una storia epica. Ribelle, Il Giullare, Leon e Il Polemico si uniscono per affrontare una sfida impossibile.",
			CoverImage:  "/personaggi/giullare/Giullare_icon.png",
			Pages: toJSON([]string{
				"/fumetti/team-eccezionale/pagina1.jpg",
				"/fumetti/team-eccezionale/pagina2.jpg",
				"/fumetti/team-eccezionale/pagina3.jpg",
				"/fumetti/team-eccezionale/pagina4.jpg",
				"/fumetti/team-eccezionale/pagina5.jpg",
				"/fumetti/team-eccezionale/pagina6.jpg",
				"/fumetti/team-eccezionale/pagina7.jpg",
				"/fumetti/team-eccezionale/pagina8.jpg",
			}),
			Order: 5,
		},
		{
			Title:       "Storie Brevi: Momenti Speciali",
			Description: "Una raccolta di piccole storie che esplorano momenti particolari nella vita dei nostri eroi. Risate, emozioni e introspezioni in ogni vignetta.",
			CoverImage:  "/personaggi/polemico/Polemico_icon.png",
			Pages: toJSON([]string{
				"/fumetti/storie-brevi/pagina1.jpg",
				"/fumetti/storie-brevi/pagina2.jpg",
				"/fumetti/storie-brevi/pagina3.jpg",
			}),
			Order: 6,
		},
	}

	for _, f := range fumetti {
		// Controlla se il fumetto esiste già (per titolo)
		var existing models.Fumetto
		result := database.DB.Where("title = ?", f.Title).First(&existing)

		if result.RowsAffected == 0 {
			// Non esiste, crealo
			if err := database.DB.Create(&f).Error; err != nil {
				log.Printf("Error creating fumetto %s: %v", f.Title, err)
			} else {
				log.Printf("✅ Created fumetto: %s", f.Title)
			}
		} else {
			// Esiste già, aggiornalo
			if err := database.DB.Model(&existing).Updates(f).Error; err != nil {
				log.Printf("Error updating fumetto %s: %v", f.Title, err)
			} else {
				log.Printf("🔄 Updated fumetto: %s", f.Title)
			}
		}
	}

	log.Println("Seed fumetti completed successfully!")
}
