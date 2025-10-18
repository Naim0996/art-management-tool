# Cart Issues Analysis & Solutions

## Problemi Identificati 🔍

### 1. **Backend Connectivity Issues**
- **Sintomo**: API calls del carrello falliscono frequentemente
- **Possibili cause**:
  - Backend non in esecuzione (porta 8080)
  - Proxy configuration issues in Next.js
  - Database connection problems
- **Test**: Usa `/cart-debug` per testare health check

### 2. **Session Token Management**
- **Sintomo**: Sessioni del carrello non persistenti
- **Possibili cause**:
  - Cookie SameSite/secure settings
  - Session token generation/validation
  - LocalStorage fallback non funzionante
- **Test**: Verifica console logs per session token

### 3. **Database Schema Issues**
- **Sintomo**: Foreign key constraint errors
- **Possibili cause**:
  - Modelli Product/EnhancedProduct mismatch
  - Migrazioni non eseguite correttamente
  - ID type inconsistency (string vs uint)
- **Test**: Controlla DB tables e constraints

### 4. **Error Handling Insufficiente**
- **Sintomo**: Errori vaghi o non informativi
- **Possibili cause**:
  - Try-catch blocks troppo generici
  - Logging insufficiente
  - Fallback states mancanti
- **Test**: Controlla browser console e network tab

## Soluzioni Implementate ✅

### 1. **Enhanced Error Logging**
```typescript
// ShopAPIService.ts - Logging dettagliato per tutte le requests
console.log(`🌐 Frontend: Making ${method} request to ${url}`);
console.log(`🌐 Frontend: Response status: ${status}`);
console.error(`🌐 Frontend: Error response:`, errorDetails);
```

### 2. **Improved Input Validation**
```typescript
// cart/page.tsx - Validation per quantity updates
const validQuantity = quantity && quantity > 0 ? quantity : 1;
if (currentItem && currentItem.quantity === validQuantity) return;
```

### 3. **Better State Management**
```typescript
// cart/page.tsx - Proper loading states e error recovery
const [updating, setUpdating] = useState<number | null>(null);
const [clearingCart, setClearingCart] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);
```

### 4. **Defensive Programming**
```typescript
// cart/page.tsx - Safety checks per null products
if (!product) {
  console.warn('Cart item missing product data:', item);
  return null;
}
```

### 5. **Debug Tools**
- Creata pagina `/cart-debug` per testing sistematico
- Health check endpoint per verifica backend
- Logging completo di requests/responses

## Passi di Troubleshooting 🛠️

### Step 1: Verifica Backend
```bash
# Assicurati che il backend sia in esecuzione
cd backend
go run main.go

# Dovrebbe mostrare: "Server starting on :8080"
```

### Step 2: Test API Endpoints
1. Vai a `http://localhost:3000/it/cart-debug`
2. Clicca "Health Check" - deve restituire status: "OK"
3. Se fallisce → problema backend/connectivity

### Step 3: Test Session Management
1. Apri Browser DevTools → Application → Cookies
2. Controlla se esiste `cart_session` cookie
3. Testa "Get Cart" - deve generare/usare session

### Step 4: Test Database
```sql
-- Verifica tabelle esistenti
\dt
-- Dovrebbe mostrare: carts, cart_items, products, etc.

-- Verifica constraints
\d cart_items
-- Dovrebbe mostrare foreign keys corretti
```

### Step 5: Test Complete Workflow
1. "Add to Cart" → deve creare item
2. "Update Cart" → deve cambiare quantity  
3. "Remove Item" → deve eliminare item
4. "Clear Cart" → deve svuotare tutto

## Correzioni Aggiuntive Necessarie 🔧

### 1. **Backend: Consistent Product Models**
```go
// Unified product model in cart relationships
type CartItem struct {
    Product *EnhancedProduct `gorm:"foreignKey:ProductID"`
    // Ensure all APIs return EnhancedProduct format
}
```

### 2. **Frontend: Request Retry Logic**
```typescript
// Add retry logic for failed requests
private async requestWithRetry<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. **Database: Migration Verification**
```sql
-- Add constraints verification
ALTER TABLE cart_items 
ADD CONSTRAINT fk_cart_items_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
```

### 4. **Frontend: Optimistic Updates**
```typescript
// Update UI immediately, rollback on error
const updateQuantityOptimistic = async (itemId: number, quantity: number) => {
  const oldState = cartData;
  // Update UI immediately
  setCartData(updateItemQuantity(cartData, itemId, quantity));
  
  try {
    const newData = await shopAPI.updateCartItem(itemId, quantity);
    setCartData(newData);
  } catch (error) {
    // Rollback on error
    setCartData(oldState);
    showError(error);
  }
};
```

## Test Checklist ✅

- [ ] Backend health check passes
- [ ] Session token correctly generated/stored
- [ ] Database tables exist with correct schema
- [ ] GET /api/shop/cart returns valid response
- [ ] POST /api/shop/cart/items creates item
- [ ] PATCH /api/shop/cart/items/{id} updates quantity
- [ ] DELETE /api/shop/cart/items/{id} removes item
- [ ] DELETE /api/shop/cart clears all items
- [ ] Frontend handles all error scenarios gracefully
- [ ] UI updates correctly after each operation
- [ ] Session persists across page reloads

## Debugging Commands 🔍

```bash
# Backend logs
cd backend && go run main.go 2>&1 | tee backend.log

# Frontend logs  
# Browser DevTools → Console → filter by "🛒" or "🌐"

# Database check
docker exec -it postgres_container psql -U username -d dbname
\l
\dt
SELECT * FROM carts LIMIT 5;
SELECT * FROM cart_items LIMIT 5;

# Network debugging
# Browser DevTools → Network → filter by "/api/shop/cart"
```