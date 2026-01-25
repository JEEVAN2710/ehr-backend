# Android 10-Day Upload Window - Complete Implementation

## 🎯 Quick Start

Copy-paste this code directly into your Android Studio project to implement the 10-day patient self-upload feature with popup notification.

---

## Step 1: Create Response Model

**File:** `app/src/main/java/com/ehr/models/UploadEligibilityResponse.java`

```java
package com.ehr.models;

public class UploadEligibilityResponse {
    private boolean success;
    private boolean canUpload;
    private String expiresAt;
    private int daysRemaining;
    private String registrationDate;
    private String message;
    
    // Constructors
    public UploadEligibilityResponse() {}
    
    public UploadEligibilityResponse(boolean success, boolean canUpload, String expiresAt, 
                                    int daysRemaining, String registrationDate, String message) {
        this.success = success;
        this.canUpload = canUpload;
        this.expiresAt = expiresAt;
        this.daysRemaining = daysRemaining;
        this.registrationDate =registrationDate;
        this.message = message;
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public boolean isCanUpload() { return canUpload; }
    public String getExpiresAt() { return expiresAt; }
    public int getDaysRemaining() { return daysRemaining; }
    public String getRegistrationDate() { return registrationDate; }
    public String getMessage() { return message; }
    
    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setCanUpload(boolean canUpload) { this.canUpload = canUpload; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
    public void setDaysRemaining(int daysRemaining) { this.daysRemaining = daysRemaining; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }
    public void setMessage(String message) { this.message = message; }
}
```

---

## Step 2: Add API Endpoint

**Add to** `ApiService.java`:

```java
// Check if patient can upload records (10-day window)
@GET("records/upload-eligibility")
Call<UploadEligibilityResponse> checkUploadEligibility();
```

---

## Step 3: Create Dialog Layout

**File:** `app/src/main/res/layout/dialog_upload_prompt.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="20dp"
    app:cardCornerRadius="20dp"
    app:cardElevation="12dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="32dp"
        android:background="#FFFFFF">

        <!-- Upload Icon -->
        <ImageView
            android:layout_width="80dp"
            android:layout_height="80dp"
            android:layout_gravity="center"
            android:src="@drawable/ic_upload"
            android:tint="#1976D2"
            android:contentDescription="Upload Icon" />

        <!-- Title -->
        <TextView
            android:id="@+id/tvDialogTitle"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="20dp"
            android:text="📤 Upload Your Old Medical Records"
            android:textSize="22sp"
            android:textStyle="bold"
            android:textColor="#212121"
            android:gravity="center" />

        <!-- Days Remaining -->
        <TextView
            android:id="@+id/tvDaysRemaining"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:text="You have 7 day(s) remaining"
            android:textSize="18sp"
            android:textColor="#1976D2"
            android:textStyle="bold"
            android:gravity="center" />

        <!-- Description -->
        <TextView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:text="Digitize your historical medical records now. After this period, only doctors can add records."
            android:textSize="15sp"
            android:textColor="#757575"
            android:gravity="center"
            android:lineSpacingExtra="6dp" />

        <!-- Features List -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="20dp"
            android:orientation="vertical"
            android:padding="16dp"
            android:background="#F5F5F5">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="✅ Upload PDFs and images"
                android:textSize="14sp"
                android:textColor="#212121"
                android:layout_marginBottom="6dp" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="✅ AI verifies documents automatically"
                android:textSize="14sp"
                android:textColor="#212121"
                android:layout_marginBottom="6dp" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="✅ Duplicate detection included"
                android:textSize="14sp"
                android:textColor="#212121" />
        </LinearLayout>

        <!-- Buttons -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="28dp"
            android:orientation="horizontal"
            android:weightSum="2">

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnLater"
                style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                android:layout_width="0dp"
                android:layout_height="56dp"
                android:layout_weight="1"
                android:layout_marginEnd="10dp"
                android:text="Later"
                android:textSize="16sp"
                android:textColor="#1976D2"
                app:strokeColor="#1976D2"
                app:strokeWidth="2dp" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnUploadNow"
                style="@style/Widget.MaterialComponents.Button"
                android:layout_width="0dp"
                android:layout_height="56dp"
                android:layout_weight="1"
                android:layout_marginStart="10dp"
                android:text="Upload Now"
                android:textSize="16sp"
                android:backgroundTint="#1976D2" />
        </LinearLayout>

    </LinearLayout>

</androidx.cardview.widget.CardView>
```

---

## Step 4: Create Upload Icon

**File:** `app/src/main/res/drawable/ic_upload.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FF000000"
        android:pathData="M9,16h6v-6h4l-7,-7 -7,7h4zM5,18h14v2H5z"/>
</vector>
```

---

## Step 5: Update PatientDashboardActivity

**Add these imports:**

```java
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.util.Log;
import android.view.Window;
import android.widget.TextView;
import com.google.android.material.button.MaterialButton;
import com.ehr.models.UploadEligibilityResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
```

**Add these member variables:**

```java
private ApiService apiService;
private Dialog uploadDialog;
private static final String TAG = "PatientDashboard";
```

**Add to onCreate():**

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_patient_dashboard);
    
    // Initialize API service
    apiService = ApiClient.getClient().create(ApiService.class);
    
    // Initialize views
    initViews();
    
    // Load dashboard data
    loadDashboardData();
    
    // Check upload eligibility and show popup if applicable
    checkUploadEligibility();
}
```

**Add these methods:**

```java
/**
 * Check if patient can still upload records (10-day window)
 * Shows popup if eligible
 */
private void checkUploadEligibility() {
    Call<UploadEligibilityResponse> call = apiService.checkUploadEligibility();
    
    call.enqueue(new Callback<UploadEligibilityResponse>() {
        @Override
        public void onResponse(Call<UploadEligibilityResponse> call, 
                               Response<UploadEligibilityResponse> response) {
            if (response.isSuccessful() && response.body() != null) {
                UploadEligibilityResponse data = response.body();
                
                Log.d(TAG, "Upload Eligibility - Can Upload: " + data.isCanUpload());
                Log.d(TAG, "Days Remaining: " + data.getDaysRemaining());
                
                if (data.isCanUpload() && data.getDaysRemaining() > 0) {
                    // Show upload prompt dialog
                    showUploadPromptDialog(data.getDaysRemaining(), data.getMessage());
                }
            } else {
                Log.e(TAG, "Failed to check upload eligibility: " + response.code());
            }
        }
        
        @Override
        public void onFailure(Call<UploadEligibilityResponse> call, Throwable t) {
            Log.e(TAG, "Error checking upload eligibility", t);
            // Silently fail - don't interrupt user experience
        }
    });
}

/**
 * Show popup dialog prompting patient to upload old records
 */
private void showUploadPromptDialog(int daysRemaining, String message) {
    // Create dialog
    uploadDialog = new Dialog(this);
    uploadDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
    uploadDialog.setContentView(R.layout.dialog_upload_prompt);
    uploadDialog.setCancelable(true);
    
    // Set transparent background for rounded corners
    if (uploadDialog.getWindow() != null) {
        uploadDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
    }
    
    // Get views
    TextView tvDaysRemaining = uploadDialog.findViewById(R.id.tvDaysRemaining);
    MaterialButton btnUploadNow = uploadDialog.findViewById(R.id.btnUploadNow);
    MaterialButton btnLater = uploadDialog.findViewById(R.id.btnLater);
    
    // Set days remaining text
    tvDaysRemaining.setText(
        String.format("You have %d day%s remaining", 
            daysRemaining, 
            daysRemaining == 1 ? "" : "s")
    );
    
    // Upload Now button - navigate to upload activity
    btnUploadNow.setOnClickListener(v -> {
        uploadDialog.dismiss();
        
        // Navigate to Self Upload Activity
        Intent intent = new Intent(PatientDashboardActivity.this, 
                                   SelfUploadActivity.class);
        intent.putExtra("daysRemaining", daysRemaining);
        startActivity(intent);
    });
    
    // Later button - just dismiss
    btnLater.setOnClickListener(v -> uploadDialog.dismiss());
    
    // Show dialog
    uploadDialog.show();
}
```

---

## 🎯 Testing Instructions

### Test 1: New Patient (Within 10 Days)

1. Register a new patient account
2. Login to the app
3. **Expected:** Popup should appear immediately on dashboard
4. Click "Upload Now" → Should navigate to upload activity
5. Click "Later" → Popup should dismiss

### Test 2: Old Patient (After 10 Days)

1. Login with a patient account created more than 10 days ago
2. **Expected:** No popup appears
3. Dashboard loads normally

### Test 3: Non-Patient User

1. Login as Doctor or Lab Assistant
2. **Expected:** No popup appears (only patients can self-upload)

---

## 📱 Screenshots

**Popup Dialog:**
``````
┌────────────────────────────────┐
│                                │
│           🔼                   │
│      (Upload Icon)             │
│                                │
│  📤 Upload Your Old Medical    │
│        Records                 │
│                                │
│   You have 7 day(s) remaining  │
│                                │
│  Digitize your historical      │
│  medical records now. After    │
│  this period, only doctors     │
│  can add records.              │
│                                │
│  ┌──────────────────────────┐ │
│  │ ✅ Upload PDFs and images│ │
│  │ ✅ AI verifies documents │ │
│  │ ✅ Duplicate detection   │ │
│  └──────────────────────────┘ │
│                                │
│   [  Later  ]  [Upload Now]    │
│                                │
└────────────────────────────────┘
``````

---

## ✅ Implementation Checklist

- [ ] Created `UploadEligibilityResponse.java`
- [ ] Added `checkUploadEligibility()` to `ApiService.java`
- [ ] Created `dialog_upload_prompt.xml` layout
- [ ] Created `ic_upload.xml` drawable
- [ ] Added imports to `PatientDashboardActivity.java`
- [ ] Added `checkUploadEligibility()` method
- [ ] Added `showUploadPromptDialog()` method
- [ ] Called `checkUploadEligibility()` in `onCreate()`
- [ ] Tested with new patient account
- [ ] Tested popup appears and dismisses correctly
- [ ] Tested "Upload Now" navigation
- [ ] Verified no popup for old patients

---

**Implementation Complete!** 🎉

The popup will now automatically appear for all patients within their 10-day upload window. After 10 days, it disappears forever for that user.
