# 10-Day Patient Upload Window - Implementation Summary

## ✅ Backend Implementation Complete

### What We Built

A **time-limited self-upload feature** where patients can upload their own medical records for the first **10 days** after registration. After the period expires, only doctors and lab assistants can add records.

---

## 🔧 Backend Changes Made

### 1. User Model (`src/models/User.js`)

**Added Fields:**
```javascript
registrationDate: Date        // Immutable, set on account creation
canSelfUpload: Boolean        // true for patients, false for doctors/admins  
selfUploadExpiresAt: Date     // registrationDate + 10 days
```

**Added Virtual Property:**
```javascript
isSelfUploadActive: Boolean   // Computed: checks if within 10-day window
```

**Logic:**
- Only patients have `canSelfUpload = true`
- `selfUploadExpiresAt` is automatically set to 10 days from registration
- `isSelfUploadActive` checks: role === 'patient' && canSelfUpload && now < expiresAt

---

### 2. Controller (`src/controllers/recordController.js`)

**Added Function: `checkUploadEligibility`**

**Endpoint:** `GET /api/records/upload-eligibility`

**Response:**
```json
{
  "success": true,
  "canUpload": true,
  "expiresAt": "2026-02-03T18:29:16.000Z",
  "daysRemaining": 7,
  "registrationDate": "2026-01-24T18:29:16.000Z",
  "message": "You can upload your old medical records! 7 day(s) remaining."
}
```

**When Expired:**
```json
{
  "success": true,
  "canUpload": false,
  "expiresAt": "2026-02-03T18:29:16.000Z",
  "daysRemaining": 0,
  "registrationDate": "2026-01-24T18:29:16.000Z",
  "message": "Self-upload period has expired. Contact your doctor to add new records."
}
```

---

### 3. Route (`src/routes/recordRoutes.js`)

**Added Route:**
```javascript
router.get(
  '/upload-eligibility',
  authorizeRoles('patient'),  // Only patients can access
  checkUploadEligibility
);
```

**Full URL:** `https://ehr-backend-uedr.onrender.com/api/records/upload-eligibility`

---

## 📱 Frontend Implementation Guide

### Step 1: Create Eligibility Check Service (Android)

**Add to `ApiService.java`:**

```java
@GET("records/upload-eligibility")
Call<UploadEligibilityResponse> checkUploadEligibility();
```

**Create Response Model `UploadEligibilityResponse.java`:**

```java
public class UploadEligibilityResponse {
    private boolean success;
    private boolean canUpload;
    private String expiresAt;
    private int daysRemaining;
    private String registrationDate;
    private String message;
    
    // Getters and setters
    public boolean isCanUpload() { return canUpload; }
    public int getDaysRemaining() { return daysRemaining; }
    public String getMessage() { return message; }
    // ... other getters
}
```

---

### Step 2: Add Popup Notification (Patient Dashboard)

**Update `PatientDashboardActivity.java`:**

```java
public class PatientDashboardActivity extends AppCompatActivity {
    
    private ApiService apiService;
    private Dialog uploadDialog;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_patient_dashboard);
        
        apiService = ApiClient.getClient().create(ApiService.class);
        
        // Check upload eligibility on dashboard load
        checkUploadEligibility();
    }
    
    /**
     * Check if patient can upload and show popup if applicable
     */
    private void checkUploadEligibility() {
        Call<UploadEligibilityResponse> call = apiService.checkUploadEligibility();
        
        call.enqueue(new Callback<UploadEligibilityResponse>() {
            @Override
            public void onResponse(Call<UploadEligibilityResponse> call, 
                                   Response<UploadEligibilityResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    UploadEligibilityResponse data = response.body();
                    
                    if (data.isCanUpload()) {
                        // Show upload prompt dialog
                        showUploadPromptDialog(data.getDaysRemaining(), data.getMessage());
                    }
                }
            }
            
            @Override
            public void onFailure(Call<UploadEligibilityResponse> call, Throwable t) {
                Log.e("PatientDashboard", "Failed to check upload eligibility", t);
            }
        });
    }
    
    /**
     * Show popup dialog prompting patient to upload old records
     */
    private void showUploadPromptDialog(int daysRemaining, String message) {
        // Create custom dialog
        uploadDialog = new Dialog(this);
        uploadDialog.setContentView(R.layout.dialog_upload_prompt);
        uploadDialog.setCancelable(true);
        
        // Set dialog content
        TextView tvMessage = uploadDialog.findViewById(R.id.tvMessage);
        TextView tvDaysRemaining = uploadDialog.findViewById(R.id.tvDaysRemaining);
        Button btnUploadNow = uploadDialog.findViewById(R.id.btnUploadNow);
        Button btnLater = uploadDialog.findViewById(R.id.btnLater);
        
        tvMessage.setText("📤 Upload Your Old Medical Records");
        tvDaysRemaining.setText(
            String.format("You have %d day(s) remaining to upload your historical records.", 
            daysRemaining)
        );
        
        // Upload Now button
        btnUploadNow.setOnClickListener(v -> {
            uploadDialog.dismiss();
            // Navigate to upload activity
            Intent intent = new Intent(PatientDashboardActivity.this, 
                                       SelfUploadActivity.class);
            startActivity(intent);
        });
        
        // Later button
        btnLater.setOnClickListener(v -> uploadDialog.dismiss());
        
        // Show dialog
        uploadDialog.show();
    }
}
```

---

### Step 3: Create Dialog Layout

**Create `res/layout/dialog_upload_prompt.xml`:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="24dp"
    android:background="@drawable/dialog_background">
    
    <!-- Icon -->
    <ImageView
        android:layout_width="64dp"
        android:layout_height="64dp"
        android:layout_gravity="center"
        android:src="@drawable/ic_upload"
        android:tint="@color/primaryColor"
        android:contentDescription="Upload Icon" />
    
    <!-- Title -->
    <TextView
        android:id="@+id/tvMessage"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="📤 Upload Your Old Medical Records"
        android:textSize="20sp"
        android:textStyle="bold"
        android:textColor="@color/textPrimary"
        android:gravity="center" />
    
    <!-- Days Remaining -->
    <TextView
        android:id="@+id/tvDaysRemaining"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:text="You have 7 day(s) remaining"
        android:textSize="16sp"
        android:textColor="@color/textSecondary"
        android:gravity="center" />
    
    <!-- Description -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Digitize your historical medical records now. After this period, only doctors can add records."
        android:textSize="14sp"
        android:textColor="@color/textSecondary"
        android:gravity="center" />
    
    <!-- Buttons -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:orientation="horizontal">
        
        <Button
            android:id="@+id/btnLater"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginEnd="8dp"
            android:text="Later"
            android:textColor="@color/primaryColor"
            android:background="@drawable/button_outline"
            style="@style/Widget.MaterialComponents.Button.OutlinedButton" />
        
        <Button
            android:id="@+id/btnUploadNow"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:text="Upload Now"
            android:backgroundTint="@color/primaryColor"
            style="@style/Widget.MaterialComponents.Button" />
    </LinearLayout>
    
</LinearLayout>
```

---

## 🎯 User Experience Flow

### Day 1-10 (Eligible Period)

1. **Patient logs in** → Dashboard loads
2. **API call** → `GET /api/records/upload-eligibility`
3. **Response** → `canUpload: true, daysRemaining: 7`
4. **Popup shows** → "📤 Upload your old medical records! 7 days remaining"
5. **Patient clicks:**
   - **"Upload Now"** → Navigate to `SelfUploadActivity`
   - **"Later"** → Close dialog (will show again on next login)

### Day 11+ (Expired Period)

1. **Patient logs in** → Dashboard loads
2. **API call** → `GET /api/records/upload-eligibility`
3. **Response** → `canUpload: false, daysRemaining: 0`
4. **No popup** → Feature is disabled
5. **If patient tries to upload** → Show message: "Contact your doctor to add new records"

---

## 🧪 Testing the API

**Test with Postman/curl:**

```bash
curl -X GET https://ehr-backend-uedr.onrender.com/api/records/upload-eligibility \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response (Eligible):**
```json
{
  "success": true,
  "canUpload": true,
  "expiresAt": "2026-02-03T18:29:16.000Z",
  "daysRemaining": 9,
  "registrationDate": "2026-01-24T18:29:16.000Z",
  "message": "You can upload your old medical records! 9 day(s) remaining."
}
```

---

## 🔄 Popup Behavior Options

### Option 1: Show Every Login (Recommended)
- Shows popup each time patient logs in
- Ensures patients don't forget to upload
- Can be dismissed with "Later" button

### Option 2: Show Once Per Day
```java
// Save last shown date in SharedPreferences
SharedPreferences prefs = getSharedPreferences("upload_prefs", MODE_PRIVATE);
String lastShown = prefs.getString("last_popup_date", "");
String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(new Date());

if (!today.equals(lastShown) && data.isCanUpload()) {
    showUploadPromptDialog(data.getDaysRemaining(), data.getMessage());
    prefs.edit().putString("last_popup_date", today).apply();
}
```

### Option 3: Show Only Once Total
```java
SharedPreferences prefs = getSharedPreferences("upload_prefs", MODE_PRIVATE);
boolean hasShown = prefs.getBoolean("popup_shown", false);

if (!hasShown && data.isCanUpload()) {
    showUploadPromptDialog(data.getDaysRemaining(), data.getMessage());
    prefs.edit().putBoolean("popup_shown", true).apply();
}
```

---

## 📊 Admin Dashboard (Optional)

**Monitor Upload Activity:**

```javascript
// Example admin endpoint to see upload stats
GET /api/admin/upload-stats

Response:
{
  "totalPatientsEligible": 45,
  "patientsWhoUploaded": 28,
  "uploadRate": "62%",
  "expiringIn3Days": 12
}
```

---

## 🚀 Next Steps

1. ✅ **Backend Complete** - Upload eligibility API is ready
2. ⏳ **Android Frontend** - Implement popup dialog and SelfUploadActivity
3. ⏳ **AI Verification** - Add document verification service (from PATIENT_UPLOAD_FEATURE.md)
4. ⏳ **Testing** - Test with real patient accounts
5. ⏳ **Deployment** - Deploy to production

---

## 📝 Key Points

- ✅ **10-day window** starts from `registrationDate`
- ✅ **Only patients** can self-upload
- ✅ **Popup shows on login** if eligible (within 10 days)
- ✅ **After expiry** → Patient must contact doctor
- ✅ **Backend ready** → Just needs frontend integration
- ✅ **Server running** → Test endpoint is live locally

**Ready to build the Android popup and upload activity!** 🎉
