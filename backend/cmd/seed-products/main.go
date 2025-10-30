package main

import (
	"encoding/json"
	"log"

	"github.com/Naim0996/art-management-tool/backend/database"
	"github.com/Naim0996/art-management-tool/backend/models"
)

func main() {
	// Connetti al database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to database successfully")

	// Helper function to create JSON attributes for variants
	createAttributes := func(attrs map[string]string) string {
		b, _ := json.Marshal(attrs)
		return string(b)
	}

	// 1. Prima creiamo le categorie
	categories := []models.Category{
		{
			Name:        "Merchandise",
			Slug:        "merchandise",
			Description: "Articoli di merchandising con i personaggi della galleria",
		},
		{
			Name:        "Stampe d'Arte",
			Slug:        "stampe-arte",
			Description: "Stampe artistiche di alta qualità dei personaggi e fumetti",
		},
		{
			Name:        "Abbigliamento",
			Slug:        "abbigliamento",
			Description: "T-shirt, felpe e abbigliamento con design originali",
		},
		{
			Name:        "Accessori",
			Slug:        "accessori",
			Description: "Accessori vari ispirati ai personaggi",
		},
	}

	var categoryMap = make(map[string]uint)
	for _, cat := range categories {
		var existing models.Category
		result := database.DB.Where("slug = ?", cat.Slug).First(&existing)

		if result.RowsAffected == 0 {
			if err := database.DB.Create(&cat).Error; err != nil {
				log.Printf("Error creating category %s: %v", cat.Name, err)
			} else {
				log.Printf("✅ Created category: %s (ID: %d)", cat.Name, cat.ID)
				categoryMap[cat.Slug] = cat.ID
			}
		} else {
			log.Printf("⏭️  Category already exists: %s (ID: %d)", cat.Name, existing.ID)
			categoryMap[cat.Slug] = existing.ID
		}
	}

	// 2. Recuperiamo i personaggi esistenti per collegarli ai prodotti
	var personaggi []models.Personaggio
	if err := database.DB.Find(&personaggi).Error; err != nil {
		log.Printf("Warning: Could not fetch personaggi: %v", err)
	}

	personaggioMap := make(map[string]uint)
	for _, p := range personaggi {
		personaggioMap[p.Name] = p.ID
		log.Printf("📌 Found personaggio: %s (ID: %d)", p.Name, p.ID)
	}

	// 3. Creiamo i prodotti con immagini e varianti
	products := []models.EnhancedProduct{
		{
			Slug:             "maglietta-ribelle-classic",
			Title:            "Maglietta Ribelle Classic",
			ShortDescription: "Maglietta con il design originale di Ribelle il Pigro",
			LongDescription:  "Maglietta in cotone biologico al 100% con stampa di alta qualità. Il design presenta Ribelle il Pigro in uno dei suoi momenti iconici. Perfetta per gli amanti dell'arte e dei fumetti.",
			BasePrice:        29.99,
			Currency:         "EUR",
			SKU:              "TS-RIB-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Ribelle il Pigro"),
			Categories: []models.Category{
				{ID: categoryMap["abbigliamento"]},
				{ID: categoryMap["merchandise"]},
			},
			Images: []models.ProductImage{
				{URL: "/personaggi/giullare/Giullare_icon.png", AltText: "Maglietta Ribelle fronte", Position: 0},
				{URL: "/personaggi/giullare/Giullare_icon.png", AltText: "Maglietta Ribelle retro", Position: 1},
				{URL: "/personaggi/giullare/Giullare_icon.png", AltText: "Dettaglio stampa Ribelle", Position: 2},
			},
			Variants: []models.ProductVariant{
				{SKU: "TS-RIB-001-S", Name: "Taglia S", Attributes: createAttributes(map[string]string{"size": "S"}), Stock: 10},
				{SKU: "TS-RIB-001-M", Name: "Taglia M", Attributes: createAttributes(map[string]string{"size": "M"}), Stock: 15},
				{SKU: "TS-RIB-001-L", Name: "Taglia L", Attributes: createAttributes(map[string]string{"size": "L"}), Stock: 12},
				{SKU: "TS-RIB-001-XL", Name: "Taglia XL", Attributes: createAttributes(map[string]string{"size": "XL"}), Stock: 8},
			},
		},
		{
			Slug:             "felpa-giullare-color",
			Title:            "Felpa Giullare Color",
			ShortDescription: "Felpa con cappuccio del Giullare in edizione colorata",
			LongDescription:  "Felpa in pile morbido con cappuccio. Il design vivace del Giullare su sfondo colorato. Perfetta per mantenere lo spirito allegro anche nelle giornate più fredde.",
			BasePrice:        49.99,
			Currency:         "EUR",
			SKU:              "HS-GIU-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Il Giullare"),
			Categories: []models.Category{
				{ID: categoryMap["abbigliamento"]},
			},
			Images: []models.ProductImage{
				{URL: "/personaggi/giullare/Giullare_icon.png", AltText: "Felpa Giullare fronte", Position: 0},
				{URL: "/personaggi/giullare/Giullare_icon.png", AltText: "Dettaglio stampa Giullare", Position: 1},
			},
			Variants: []models.ProductVariant{
				{SKU: "HS-GIU-001-M", Name: "Taglia M", Attributes: createAttributes(map[string]string{"size": "M"}), Stock: 7},
				{SKU: "HS-GIU-001-L", Name: "Taglia L", Attributes: createAttributes(map[string]string{"size": "L"}), Stock: 10},
				{SKU: "HS-GIU-001-XL", Name: "Taglia XL", Attributes: createAttributes(map[string]string{"size": "XL"}), Stock: 5},
			},
		},
		{
			Slug:             "stampa-leon-banner",
			Title:            "Stampa Artistica Leon Banner",
			ShortDescription: "Stampa artistica in alta qualità di Leon in formato banner",
			LongDescription:  "Stampa professionale su carta fotografica lucida in formato A2. Il design epico di Leon cattura tutta la forza del personaggio. Perfetta per decorare la casa o lo studio.",
			BasePrice:        39.99,
			Currency:         "EUR",
			SKU:              "PRT-LEO-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Leon"),
			Categories: []models.Category{
				{ID: categoryMap["stampe-arte"]},
			},
			Images: []models.ProductImage{
				{URL: "/products/stampa-leon/main.jpg", AltText: "Stampa Leon", Position: 0},
				{URL: "/products/stampa-leon/frame-example.jpg", AltText: "Esempio con cornice", Position: 1},
			},
			Variants: []models.ProductVariant{
				{SKU: "PRT-LEO-001-A4", Name: "A4", Attributes: createAttributes(map[string]string{"size": "A4"}), PriceAdjustment: -15.00, Stock: 20},
				{SKU: "PRT-LEO-001-A3", Name: "A3", Attributes: createAttributes(map[string]string{"size": "A3"}), PriceAdjustment: -5.00, Stock: 15},
				{SKU: "PRT-LEO-001-A2", Name: "A2", Attributes: createAttributes(map[string]string{"size": "A2"}), Stock: 10},
				{SKU: "PRT-LEO-001-A1", Name: "A1", Attributes: createAttributes(map[string]string{"size": "A1"}), PriceAdjustment: 25.00, Stock: 5},
			},
		},
		{
			Slug:             "stampa-polemico-poster",
			Title:            "Poster Il Polemico",
			ShortDescription: "Poster provocatorio con Il Polemico",
			LongDescription:  "Poster in formato grande con il design di Il Polemico. Perfetto per chi ama l'arte provocatoria e i messaggi forti. Stampe su carta spessa e resistente.",
			BasePrice:        24.99,
			Currency:         "EUR",
			SKU:              "PRT-POL-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Il Polemico"),
			Categories: []models.Category{
				{ID: categoryMap["stampe-arte"]},
			},
			Images: []models.ProductImage{
				{URL: "/personaggi/polemico/Polemico_icon.png", AltText: "Poster Il Polemico", Position: 0},
			},
			Variants: []models.ProductVariant{
				{SKU: "PRT-POL-001-STD", Name: "Standard", Attributes: createAttributes(map[string]string{"format": "standard"}), Stock: 25},
			},
		},
		{
			Slug:             "tazza-team-quattro",
			Title:            "Tazza Team Quattro",
			ShortDescription: "Tazza con tutti e quattro i personaggi insieme",
			LongDescription:  "Tazza in ceramica con il design esclusivo che riunisce tutti e quattro i personaggi: Ribelle, Il Giullare, Leon e Il Polemico. Perfetta per la colazione o per il tè.",
			BasePrice:        19.99,
			Currency:         "EUR",
			SKU:              "MUG-TEAM-001",
			Status:           models.ProductStatusPublished,
			Categories: []models.Category{
				{ID: categoryMap["accessori"]},
				{ID: categoryMap["merchandise"]},
			},
			Images: []models.ProductImage{
				{URL: "/products/tazza-team/front.jpg", AltText: "Tazza Team fronte", Position: 0},
				{URL: "/products/tazza-team/side.jpg", AltText: "Tazza Team lato", Position: 1},
				{URL: "/products/tazza-team/top.jpg", AltText: "Tazza Team vista dall'alto", Position: 2},
			},
			Variants: []models.ProductVariant{
				{SKU: "MUG-TEAM-001-SM", Name: "Small (350ml)", Attributes: createAttributes(map[string]string{"size": "small"}), PriceAdjustment: -3.00, Stock: 20},
				{SKU: "MUG-TEAM-001-MD", Name: "Medium (500ml)", Attributes: createAttributes(map[string]string{"size": "medium"}), Stock: 18},
				{SKU: "MUG-TEAM-001-LG", Name: "Large (600ml)", Attributes: createAttributes(map[string]string{"size": "large"}), PriceAdjustment: 3.00, Stock: 15},
			},
		},
		{
			Slug:             "borraccia-ribelle-sport",
			Title:            "Borraccia Ribelle Sport",
			ShortDescription: "Borraccia sportiva con design Ribelle",
			LongDescription:  "Borraccia in acciaio inossidabile con design di Ribelle il Pigro. Isolamento termico, perfetta per portare acqua fresca in palestra o in ufficio.",
			BasePrice:        22.99,
			Currency:         "EUR",
			SKU:              "BTL-RIB-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Ribelle il Pigro"),
			Categories: []models.Category{
				{ID: categoryMap["accessori"]},
			},
			Images: []models.ProductImage{
				{URL: "/products/borraccia-ribelle/main.jpg", AltText: "Borraccia Ribelle", Position: 0},
				{URL: "/products/borraccia-ribelle/detail.jpg", AltText: "Dettaglio design", Position: 1},
			},
			Variants: []models.ProductVariant{
				{SKU: "BTL-RIB-001-BL", Name: "Blu", Attributes: createAttributes(map[string]string{"color": "blue"}), Stock: 30},
				{SKU: "BTL-RIB-001-GR", Name: "Grigio", Attributes: createAttributes(map[string]string{"color": "gray"}), Stock: 25},
			},
		},
		{
			Slug:             "zaino-leon-adventure",
			Title:            "Zaino Leon Adventure",
			ShortDescription: "Zaino sportivo con stampa Leon",
			LongDescription:  "Zaino robusto e capiente con il design epico di Leon. Perfetto per le avventure quotidiane o i viaggi. Con tasche laterali per la borraccia.",
			BasePrice:        59.99,
			Currency:         "EUR",
			SKU:              "BAG-LEO-001",
			Status:           models.ProductStatusPublished,
			CharacterID:      getPersonaggioID(personaggioMap, "Leon"),
			Categories: []models.Category{
				{ID: categoryMap["accessori"]},
				{ID: categoryMap["abbigliamento"]},
			},
			Images: []models.ProductImage{
				{URL: "/products/zaino-leon/front.jpg", AltText: "Zaino Leon fronte", Position: 0},
				{URL: "/products/zaino-leon/back.jpg", AltText: "Zaino Leon retro", Position: 1},
			},
			Variants: []models.ProductVariant{
				{SKU: "BAG-LEO-001-STD", Name: "Standard", Attributes: createAttributes(map[string]string{"size": "standard"}), Stock: 12},
			},
		},
		{
			Slug:             "set-stampe-collezione-completa",
			Title:            "Set Stampe Collezione Completa",
			ShortDescription: "Set di 4 stampe artistiche con tutti i personaggi",
			LongDescription:  "Collezione completa delle stampe artistiche di tutti e quattro i personaggi. Ideale per decorare un'intera parete. Include Ribelle, Il Giullare, Leon e Il Polemico.",
			BasePrice:        99.99,
			Currency:         "EUR",
			SKU:              "SET-STAMPE-001",
			Status:           models.ProductStatusPublished,
			Categories: []models.Category{
				{ID: categoryMap["stampe-arte"]},
			},
			Images: []models.ProductImage{
				{URL: "/products/set-stampe/main.jpg", AltText: "Set stampe collezione", Position: 0},
			},
			Variants: []models.ProductVariant{
				{SKU: "SET-STAMPE-001-A4", Name: "Set A4", Attributes: createAttributes(map[string]string{"size": "A4", "count": "4"}), Stock: 15},
				{SKU: "SET-STAMPE-001-A3", Name: "Set A3", Attributes: createAttributes(map[string]string{"size": "A3", "count": "4"}), PriceAdjustment: 40.00, Stock: 8},
			},
		},
	}

	// Creiamo i prodotti uno per uno
	for _, product := range products {
		var existing models.EnhancedProduct
		result := database.DB.Where("slug = ?", product.Slug).First(&existing)

		if result.RowsAffected == 0 {
			// Non esiste, crealo con tutte le relazioni
			if err := database.DB.Create(&product).Error; err != nil {
				log.Printf("❌ Error creating product %s: %v", product.Title, err)
			} else {
				log.Printf("✅ Created product: %s (ID: %d)", product.Title, product.ID)
			}
		} else {
			// Esiste già, aggiornalo
			if err := database.DB.Model(&existing).Updates(product).Error; err != nil {
				log.Printf("❌ Error updating product %s: %v", product.Title, err)
			} else {
				// Aggiorna le immagini
				database.DB.Where("product_id = ?", existing.ID).Delete(&models.ProductImage{})
				for _, img := range product.Images {
					img.ProductID = existing.ID
					database.DB.Create(&img)
				}
				log.Printf("🔄 Updated product: %s", product.Title)
			}
		}
	}

	log.Println("Seed prodotti completed successfully!")
}

func getPersonaggioID(personaggioMap map[string]uint, name string) *uint {
	if id, ok := personaggioMap[name]; ok {
		return &id
	}
	return nil
}
