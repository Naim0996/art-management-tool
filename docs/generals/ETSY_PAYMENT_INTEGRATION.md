# 💳 Etsy Payment Integration

Guide for implementing and using Etsy payment functionality in the Art Management Tool.

## 📋 Overview

The Etsy payment integration allows customers to complete purchases through the Etsy platform. This integration:

- ✅ Redirects customers to Etsy for payment processing
- ✅ Synchronizes completed transactions back to the local system
- ✅ Tracks payment and fulfillment status from Etsy
- ✅ Links Etsy receipts to local orders

## 🎯 How It Works

### Customer Flow

1. **Product Selection**: Customer adds items to cart on your site
2. **Checkout**: Customer proceeds to checkout and selects "Etsy Payment" as payment method
3. **Redirect**: Customer is redirected to Etsy shop to complete purchase
4. **Payment**: Customer completes payment on Etsy platform
5. **Confirmation**: Etsy processes payment and sends receipt to customer
6. **Sync**: Backend synchronizes the Etsy receipt to local database

### Technical Flow

```
Customer Site → Checkout → Etsy Payment → Redirect to Etsy Shop
                                            ↓
Local Database ← Receipt Sync ← Etsy API ← Payment Complete
```

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Etsy Shop Information
ETSY_SHOP_NAME=YourShopName
ETSY_SHOP_URL=https://www.etsy.com/shop/YourShopName

# Etsy API Credentials (from https://www.etsy.com/developers/)
ETSY_API_KEY=your_api_key
ETSY_API_SECRET=your_api_secret
ETSY_SHOP_ID=your_shop_id
ETSY_ACCESS_TOKEN=your_access_token

# Payment Callback
ETSY_PAYMENT_CALLBACK_URL=https://yourdomain.com/checkout/success

# Enable Etsy Integration
ETSY_SYNC_ENABLED=true
```

### Required Permissions

Your Etsy API app needs these OAuth scopes:
- `shops_r` - Read shop information
- `listings_r` - Read listing data
- `transactions_r` - Read transaction/receipt data

## 🔄 Receipt Synchronization

### Manual Sync

Trigger receipt synchronization via admin API:

```bash
curl -X POST http://localhost:8080/api/admin/etsy/sync/receipts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "your_shop_id",
    "min_created": 1704067200
  }'
```

### Automatic Sync

Set up a scheduled job to sync receipts periodically:

```go
// In your scheduler setup
scheduler.AddJob("etsy_receipt_sync", 30*time.Minute, func(ctx context.Context) error {
    return etsyService.SyncReceipts(shopID, 0)
})
```

### Viewing Receipts

List Etsy receipts via admin API:

```bash
curl -X GET "http://localhost:8080/api/admin/etsy/receipts?shop_id=your_shop_id&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database Schema

### Etsy Receipts Table

```sql
CREATE TABLE etsy_receipts (
    id BIGSERIAL PRIMARY KEY,
    etsy_receipt_id BIGINT NOT NULL UNIQUE,
    local_order_id BIGINT,
    shop_id VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255),
    buyer_name VARCHAR(255),
    status VARCHAR(50),
    is_paid BOOLEAN,
    is_shipped BOOLEAN,
    grand_total DECIMAL(10,2),
    currency VARCHAR(10),
    payment_method VARCHAR(100),
    etsy_created_at TIMESTAMP,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔗 Linking Receipts to Orders

### Link Receipt to Local Order

```bash
curl -X POST http://localhost:8080/api/admin/etsy/receipts/123456789/link \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"local_order_id": 42}'
```

### Unlink Receipt

```bash
curl -X DELETE http://localhost:8080/api/admin/etsy/receipts/123456789/link \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 Frontend Integration

### Checkout Page

The Etsy payment option is automatically available in the checkout page when configured:

```typescript
// Payment method selection
<RadioButton
  inputId="etsy"
  name="payment"
  value="etsy"
  checked={paymentMethod === 'etsy'}
/>
<label htmlFor="etsy">
  Etsy Payment - Complete payment on Etsy platform
</label>
```

### Handling Redirect

```typescript
// After checkout API call
if (paymentMethod === 'etsy' && response.client_secret) {
  // Redirect to Etsy shop
  window.location.href = response.client_secret;
}
```

## 🔐 Security Considerations

### API Credentials

- **Never commit** API keys to version control
- Use **environment variables** or secret management systems
- **Rotate credentials** regularly
- Use **separate credentials** for staging/production

### Payment Flow

- Etsy handles all payment processing securely
- No sensitive payment data passes through your system
- Customers enter payment information directly on Etsy
- Your system only receives receipt/transaction data after payment

## 📈 Monitoring

### Check Sync Status

```bash
curl -X GET http://localhost:8080/api/admin/etsy/sync/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### View Recent Receipts

```bash
curl -X GET "http://localhost:8080/api/admin/etsy/receipts?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Troubleshooting

### Receipt Not Syncing

1. **Check API credentials** - Ensure valid access token
2. **Verify permissions** - Confirm `transactions_r` scope is granted
3. **Check rate limits** - Etsy API has 10,000 requests/day limit
4. **Review logs** - Check backend logs for sync errors

### Payment Not Completing

1. **Verify shop URL** - Ensure `ETSY_SHOP_URL` is correct
2. **Check shop status** - Ensure Etsy shop is active and not on vacation
3. **Review Etsy orders** - Check Etsy seller dashboard for order status

### Duplicate Orders

- Receipt sync is **idempotent** - same receipt won't create duplicate entries
- Use `etsy_receipt_id` unique constraint to prevent duplicates
- Link Etsy receipts to local orders for reconciliation

## 🔄 Refunds

**Important**: Etsy refunds must be processed through the Etsy seller dashboard.

The local system cannot initiate refunds directly through the API. To refund an Etsy transaction:

1. Go to your Etsy seller dashboard
2. Find the order in "Sold Orders"
3. Select "Issue Refund"
4. Complete the refund process on Etsy
5. Sync receipts to update local status

## 📚 API Endpoints

### Receipt Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/etsy/sync/receipts` | Trigger receipt synchronization |
| `GET` | `/api/admin/etsy/receipts` | List Etsy receipts |
| `GET` | `/api/admin/etsy/receipts/{receipt_id}` | Get specific receipt |
| `POST` | `/api/admin/etsy/receipts/{receipt_id}/link` | Link receipt to order |
| `DELETE` | `/api/admin/etsy/receipts/{receipt_id}/link` | Unlink receipt from order |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/etsy/config` | Get integration configuration |
| `POST` | `/api/admin/etsy/validate` | Validate API credentials |

## 📖 Additional Resources

- [Etsy API Documentation](https://developers.etsy.com/documentation/)
- [Etsy OAuth 2.0 Guide](https://developers.etsy.com/documentation/essentials/authentication)
- [Shop Receipts API](https://developers.etsy.com/documentation/reference/#operation/getShopReceipts)
- [Rate Limiting](https://developers.etsy.com/documentation/essentials/rate-limiting)

## 🤝 Support

For issues specific to Etsy integration:
- Review [ETSY_INTEGRATION.md](./ETSY_INTEGRATION.md) for product sync
- Check [TROUBLESHOOTING.md](./troubleshooting/) for common issues
- Open an issue on GitHub

---

**Note**: Etsy payments are processed entirely on Etsy's platform. This integration provides order tracking and synchronization, not direct payment processing.
