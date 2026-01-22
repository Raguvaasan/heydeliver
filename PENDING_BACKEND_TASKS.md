# Pending Backend Implementation Tasks

## Rate Markup Feature - Backend API Implementation

### Current Status
- ✅ Frontend implementation completed using **localStorage**
- ⏳ Backend API implementation **PENDING**

### Current Implementation Details
**Location:** `src/pages/Settings/RateMarkupPage.tsx`

**Storage:** localStorage
- Key: `rateMarkup` (value: number)
- Key: `rateMarkupType` (value: "percentage" | "fixed")

**Usage:**
- Rate Calculator reads from localStorage
- Auto-applies markup to Delhivery API rates
- Shows customer pricing with profit breakdown

### Required Backend API Endpoints

#### 1. Save/Update Markup Settings
```
POST/PUT /api/settings/rate-markup
Headers: Authorization: Bearer <token>
Body: {
  "markupValue": 10,
  "markupType": "percentage", // or "fixed"
  "active": true
}

Response: {
  "success": true,
  "message": "Markup settings saved successfully",
  "data": {
    "id": "...",
    "markupValue": 10,
    "markupType": "percentage",
    "active": true,
    "updatedAt": "2026-01-22T..."
  }
}
```

#### 2. Get Markup Settings
```
GET /api/settings/rate-markup
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "id": "...",
    "markupValue": 10,
    "markupType": "percentage",
    "active": true,
    "createdAt": "2026-01-22T...",
    "updatedAt": "2026-01-22T..."
  }
}
```

### Database Schema Suggestion

**Table:** `rate_markup_settings`

```sql
CREATE TABLE rate_markup_settings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  markup_value DECIMAL(10, 2) NOT NULL,
  markup_type ENUM('percentage', 'fixed') NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Frontend Changes Required After Backend Implementation

#### 1. Update `RateMarkupPage.tsx`
- Replace localStorage calls with API calls
- Add loading states
- Add error handling
- Fetch settings on component mount

```typescript
// Replace this:
localStorage.setItem("rateMarkup", globalMarkup.toString())
localStorage.setItem("rateMarkupType", markupType)

// With API call:
await axios.post('/api/settings/rate-markup', {
  markupValue: globalMarkup,
  markupType: markupType
})
```

#### 2. Update `RateCalculatorPage.tsx`
- Fetch markup from API instead of localStorage
- Add caching mechanism (optional)

```typescript
// Replace this:
const markupValue = parseFloat(localStorage.getItem("rateMarkup") || "0")
const markupType = localStorage.getItem("rateMarkupType") || "percentage"

// With API call or zustand store:
const { markupValue, markupType } = useMarkupStore()
```

#### 3. Create Zustand Store (Optional but Recommended)
**File:** `src/store/markupStore.ts`

```typescript
import { create } from "zustand"
import axios from "axios"

interface MarkupSettings {
  markupValue: number
  markupType: "percentage" | "fixed"
  active: boolean
}

interface MarkupStore extends MarkupSettings {
  loading: boolean
  error: string | null
  fetchMarkup: () => Promise<void>
  updateMarkup: (settings: MarkupSettings) => Promise<void>
}

export const useMarkupStore = create<MarkupStore>((set) => ({
  markupValue: 0,
  markupType: "percentage",
  active: true,
  loading: false,
  error: null,

  fetchMarkup: async () => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get('/api/settings/rate-markup')
      set({
        markupValue: response.data.data.markupValue,
        markupType: response.data.data.markupType,
        active: response.data.data.active,
        loading: false
      })
    } catch (error) {
      set({ loading: false, error: error.message })
    }
  },

  updateMarkup: async (settings) => {
    set({ loading: true, error: null })
    try {
      await axios.post('/api/settings/rate-markup', settings)
      set({ ...settings, loading: false })
    } catch (error) {
      set({ loading: false, error: error.message })
    }
  }
}))
```

### Implementation Checklist

- [ ] Create backend API endpoints
- [ ] Create database table/schema
- [ ] Test API endpoints with Postman/cURL
- [ ] Create `markupStore.ts` zustand store
- [ ] Update `RateMarkupPage.tsx` to use API
- [ ] Update `RateCalculatorPage.tsx` to use API/store
- [ ] Remove localStorage fallback code
- [ ] Test multi-device sync
- [ ] Test user-specific settings

### Notes
- Current localStorage implementation works fine for single-user, single-device testing
- Backend API will enable multi-device sync and user-specific settings
- Consider adding role-based permissions (only admin can set markup)
- Consider adding markup history/audit log

### Priority
**Medium** - Current localStorage implementation is functional, but backend API needed for production

---
**Last Updated:** January 22, 2026
**Created By:** AI Assistant
**Status:** Pending Backend Implementation
