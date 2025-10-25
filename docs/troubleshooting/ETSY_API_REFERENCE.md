# Etsy API v3 Reference

Official Documentation: https://developers.etsy.com/documentation/reference/

## App Credentials

```
App Name: art-management-tool
API Key (Keystring): kftb0shwfjdguunnjuaeugfb
Shared Secret: p3dxkfk2yg
Shop ID: mrAnarchyStudioArt
Shop URL: https://www.etsy.com/shop/mrAnarchyStudioArt
```

## Base URL

```
https://openapi.etsy.com/v3
```

## Authentication

### OAuth 2.0 Flow

1. **Authorization URL**
   ```
   https://www.etsy.com/oauth/connect?response_type=code&redirect_uri={REDIRECT_URI}&scope={SCOPES}&client_id={API_KEY}&state={STATE}
   ```

2. **Token Exchange**
   ```http
   POST https://api.etsy.com/v3/public/oauth/token
   Content-Type: application/x-www-form-urlencoded
   Authorization: Basic {base64(API_KEY:API_SECRET)}

   grant_type=authorization_code&code={CODE}&redirect_uri={REDIRECT_URI}
   ```

3. **Token Refresh**
   ```http
   POST https://api.etsy.com/v3/public/oauth/token
   Content-Type: application/x-www-form-urlencoded
   Authorization: Basic {base64(API_KEY:API_SECRET)}

   grant_type=refresh_token&refresh_token={REFRESH_TOKEN}
   ```

### Required Scopes

- `listings_r` - Read shop listings
- `listings_w` - Write/update listings
- `shops_r` - Read shop information
- `transactions_r` - Read transactions/orders
- `feedback_r` - Read feedback

## Key Endpoints

### Shop Management

#### Get Shop Details
```http
GET /v3/application/shops/{shop_id}
Authorization: Bearer {access_token}
```

Response:
```json
{
  "shop_id": 12345678,
  "shop_name": "mrAnarchyStudioArt",
  "title": "Shop Title",
  "announcement": "Shop announcement",
  "currency_code": "USD",
  "is_vacation": false,
  "vacation_message": null,
  "listing_active_count": 42,
  "digital_listing_count": 0,
  "login_name": "username",
  "url": "https://www.etsy.com/shop/mrAnarchyStudioArt"
}
```

### Listings (Products)

#### Get Shop Listings
```http
GET /v3/application/shops/{shop_id}/listings/active
Authorization: Bearer {access_token}

Query Parameters:
- limit: 25 (default), max 100
- offset: 0 (default)
- sort_on: created | price | score
- sort_order: asc | desc
```

Response:
```json
{
  "count": 42,
  "results": [
    {
      "listing_id": 123456789,
      "user_id": 12345678,
      "shop_id": 12345678,
      "title": "Product Title",
      "description": "Product description",
      "state": "active",
      "creation_timestamp": 1634567890,
      "ending_timestamp": 1735654321,
      "original_creation_timestamp": 1634567890,
      "last_modified_timestamp": 1634567890,
      "state_timestamp": 1634567890,
      "quantity": 10,
      "shop_section_id": null,
      "featured_rank": -1,
      "url": "https://www.etsy.com/listing/123456789/product-title",
      "num_favorers": 5,
      "non_taxable": false,
      "is_taxable": true,
      "is_customizable": false,
      "is_personalizable": false,
      "personalization_is_required": false,
      "personalization_char_count_max": null,
      "personalization_instructions": null,
      "listing_type": "physical",
      "tags": ["tag1", "tag2"],
      "materials": ["material1"],
      "shipping_profile_id": 123456789,
      "return_policy_id": null,
      "processing_min": 1,
      "processing_max": 3,
      "who_made": "i_did",
      "when_made": "made_to_order",
      "is_supply": false,
      "item_weight": 100,
      "item_weight_unit": "g",
      "item_length": 10,
      "item_width": 10,
      "item_height": 5,
      "item_dimensions_unit": "cm",
      "is_private": false,
      "style": ["style1"],
      "file_data": "",
      "has_variations": true,
      "should_auto_renew": false,
      "language": "en-US",
      "price": {
        "amount": 2500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "taxonomy_id": 123
    }
  ]
}
```

#### Get Single Listing
```http
GET /v3/application/listings/{listing_id}
Authorization: Bearer {access_token}

Optional Query Parameters:
- includes: Images,Inventory,Shipping,User,Shop,Videos
```

#### Update Listing
```http
PUT /v3/application/shops/{shop_id}/listings/{listing_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "quantity": 15,
  "price": 29.99,
  "tags": ["tag1", "tag2", "tag3"]
}
```

### Listing Images

#### Get Listing Images
```http
GET /v3/application/shops/{shop_id}/listings/{listing_id}/images
Authorization: Bearer {access_token}
```

Response:
```json
{
  "count": 3,
  "results": [
    {
      "listing_id": 123456789,
      "listing_image_id": 987654321,
      "hex_code": null,
      "red": null,
      "green": null,
      "blue": null,
      "hue": null,
      "saturation": null,
      "brightness": null,
      "is_black_and_white": false,
      "creation_tsz": 1634567890,
      "created_timestamp": 1634567890,
      "rank": 1,
      "url_75x75": "https://i.etsystatic.com/...",
      "url_170x135": "https://i.etsystatic.com/...",
      "url_570xN": "https://i.etsystatic.com/...",
      "url_fullxfull": "https://i.etsystatic.com/...",
      "full_height": 2048,
      "full_width": 1536,
      "alt_text": "Image description"
    }
  ]
}
```

#### Upload Listing Image
```http
POST /v3/application/shops/{shop_id}/listings/{listing_id}/images
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

image: <binary file data>
rank: 1
alt_text: "Image description"
```

### Inventory Management

#### Get Listing Inventory
```http
GET /v3/application/listings/{listing_id}/inventory
Authorization: Bearer {access_token}
```

Response:
```json
{
  "products": [
    {
      "product_id": 123456789,
      "sku": "SKU-001",
      "is_deleted": false,
      "offerings": [
        {
          "offering_id": 987654321,
          "quantity": 10,
          "is_enabled": true,
          "is_deleted": false,
          "price": {
            "amount": 2500,
            "divisor": 100,
            "currency_code": "USD"
          }
        }
      ],
      "property_values": [
        {
          "property_id": 200,
          "property_name": "Color",
          "value_ids": [1],
          "values": ["Red"]
        }
      ]
    }
  ],
  "price_on_property": [200],
  "quantity_on_property": [200],
  "sku_on_property": []
}
```

#### Update Listing Inventory
```http
PUT /v3/application/listings/{listing_id}/inventory
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "products": [
    {
      "sku": "SKU-001",
      "offerings": [
        {
          "price": 29.99,
          "quantity": 15,
          "is_enabled": true
        }
      ]
    }
  ]
}
```

### Transactions (Orders)

#### Get Shop Receipts
```http
GET /v3/application/shops/{shop_id}/receipts
Authorization: Bearer {access_token}

Query Parameters:
- limit: 25 (default), max 100
- offset: 0
- sort_on: created | updated | paid
- sort_order: asc | desc
- was_paid: true | false
- was_shipped: true | false
- min_created: unix timestamp
- max_created: unix timestamp
```

Response:
```json
{
  "count": 10,
  "results": [
    {
      "receipt_id": 123456789,
      "receipt_type": 0,
      "seller_user_id": 12345678,
      "seller_email": "seller@example.com",
      "buyer_user_id": 87654321,
      "buyer_email": "buyer@example.com",
      "name": "John Doe",
      "first_line": "123 Main St",
      "second_line": "Apt 4",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "status": "Completed",
      "formatted_address": "123 Main St, Apt 4, New York, NY 10001",
      "country_iso": "US",
      "payment_method": "paypal",
      "payment_email": "payment@example.com",
      "message_from_seller": null,
      "message_from_buyer": "Thank you!",
      "message_from_payment": null,
      "is_paid": true,
      "is_shipped": true,
      "create_timestamp": 1634567890,
      "created_timestamp": 1634567890,
      "update_timestamp": 1634567890,
      "updated_timestamp": 1634567890,
      "is_gift": false,
      "gift_message": null,
      "grandtotal": {
        "amount": 3500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "subtotal": {
        "amount": 2500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "total_price": {
        "amount": 3500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "total_shipping_cost": {
        "amount": 500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "total_tax_cost": {
        "amount": 500,
        "divisor": 100,
        "currency_code": "USD"
      },
      "total_vat_cost": {
        "amount": 0,
        "divisor": 100,
        "currency_code": "USD"
      },
      "discount_amt": {
        "amount": 0,
        "divisor": 100,
        "currency_code": "USD"
      },
      "gift_wrap_price": {
        "amount": 0,
        "divisor": 100,
        "currency_code": "USD"
      },
      "shipments": [],
      "transactions": [
        {
          "transaction_id": 123456789,
          "title": "Product Title",
          "description": "Product description",
          "seller_user_id": 12345678,
          "buyer_user_id": 87654321,
          "create_timestamp": 1634567890,
          "paid_timestamp": 1634567890,
          "shipped_timestamp": 1634567890,
          "quantity": 1,
          "listing_image_id": 987654321,
          "receipt_id": 123456789,
          "is_digital": false,
          "file_data": "",
          "listing_id": 123456789,
          "sku": "SKU-001",
          "product_id": 123456789,
          "transaction_type": "listing",
          "price": {
            "amount": 2500,
            "divisor": 100,
            "currency_code": "USD"
          },
          "shipping_cost": {
            "amount": 500,
            "divisor": 100,
            "currency_code": "USD"
          },
          "variations": [],
          "product_data": [],
          "shipping_profile_id": 123456789,
          "min_processing_days": 1,
          "max_processing_days": 3,
          "shipping_method": "Standard",
          "shipping_upgrade": null,
          "expected_ship_date": 1634654321,
          "buyer_coupon": null,
          "shop_coupon": null
        }
      ]
    }
  ]
}
```

#### Get Single Receipt
```http
GET /v3/application/shops/{shop_id}/receipts/{receipt_id}
Authorization: Bearer {access_token}
```

### Shop Sections (Categories)

#### Get Shop Sections
```http
GET /v3/application/shops/{shop_id}/sections
Authorization: Bearer {access_token}
```

Response:
```json
{
  "count": 3,
  "results": [
    {
      "shop_section_id": 123456789,
      "title": "Paintings",
      "rank": 1,
      "user_id": 12345678,
      "active_listing_count": 15
    }
  ]
}
```

## Rate Limits

- **10,000 requests per 24 hours** per OAuth app
- Rate limit resets at midnight UTC
- Headers returned with each response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Error Responses

```json
{
  "error": "unauthorized_client",
  "error_description": "The client is not authorized to request an access token using this method."
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid or missing access token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Etsy server error
- `503 Service Unavailable` - Etsy service temporarily unavailable

## Implementation Status

### ✅ Implemented
- OAuth 2.0 authentication flow
- Token storage and management
- Automatic token refresh (5-minute buffer)
- Database schema for OAuth tokens

### 🔄 To Be Implemented
- Shop details retrieval
- Listings (products) sync
- Inventory management
- Image sync
- Order/receipt sync
- Webhook handlers for real-time updates

## Next Steps

1. Complete frontend OAuth UI
2. Implement product listing sync
3. Add inventory synchronization
4. Set up webhook handlers
5. Create admin dashboard for Etsy integration status

## Additional Resources

- [Etsy API Documentation](https://developers.etsy.com/documentation/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Etsy Developer Forum](https://community.etsy.com/t5/Etsy-API/bd-p/developer-api)
- [API Status Page](https://status.etsy.com/)
