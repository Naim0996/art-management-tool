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

	// Seed personaggi
	personaggi := []models.Personaggio{
		{
			Name:            "Ribelle il Pigro",
			Description:     "Il protagonista della nostra galleria d'arte. Un personaggio unico che rappresenta la creatività e l'originalità dell'arte contemporanea.",
			Icon:            "/personaggi/ribelle/Ribelle_icon.png",
			Images:          toJSON([]string{"/personaggi/ribelle/Ribelle_pigro_ink.jpeg", "/personaggi/ribelle/Ribellepigro_nome.jpeg", "/personaggi/ribelle/Ribelle_pigro_pinsata.jpeg"}),
			BackgroundType:  "solid",
			BackgroundColor: "#E0E7FF",
			Order:           1,
		},
		{
			Name:            "Il Giullare",
			Description:     "Un personaggio divertente e colorato che porta allegria in ogni opera. Con il suo spirito giocoso e la sua natura esuberante, rappresenta la gioia dell'arte.",
			Icon:            "/personaggi/giullare/Giullare_icon.png",
			Images:          toJSON([]string{"/personaggi/giullare/Giullare_muddica.jpeg"}),
			BackgroundType:  "solid",
			BackgroundColor: "#FEFCE8",
			Order:           2,
		},
		{
			Name:            "Leon",
			Description:     "Un personaggio forte e determinato con uno stile unico. Leon rappresenta la forza interiore e la determinazione attraverso tratti artistici decisi e caratteristici.",
			Icon:            "/personaggi/leon/Leon_icon.png",
			Images:          toJSON([]string{"/personaggi/leon/Leon_lingua.jpeg"}),
			BackgroundType:  "solid",
			BackgroundColor: "#FEE2E2",
			Order:           3,
		},
		{
			Name:            "Il Polemico",
			Description:     "Un personaggio che esprime opinioni forti attraverso l'arte. Con il suo carattere provocatorio e riflessivo, sfida le convenzioni e stimola il dibattito artistico.",
			Icon:            "/personaggi/polemico/Polemico_icon.png",
			Images:          toJSON([]string{"/personaggi/polemico/Polemico_lupo.jpeg"}),
			BackgroundType:  "solid",
			BackgroundColor: "#E0F2FE",
			Order:           4,
		},
	}

	for _, p := range personaggi {
		// Controlla se il personaggio esiste già (per nome)
		var existing models.Personaggio
		result := database.DB.Where("name = ?", p.Name).First(&existing)

		if result.RowsAffected == 0 {
			// Non esiste, crealo
			if err := database.DB.Create(&p).Error; err != nil {
				log.Printf("Error creating personaggio %s: %v", p.Name, err)
			} else {
				log.Printf("✅ Created personaggio: %s", p.Name)
			}
		} else {
			log.Printf("⏭️  Personaggio already exists: %s", p.Name)
		}
	}

	log.Println("Seed completed successfully!")
}
