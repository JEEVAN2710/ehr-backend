# NFC Card Integration - Android App (Java)

## Overview
This document contains prompts for Zencoder AI to implement NFC functionality for the EHR Android app. 

**User Flow:**
1. User signs in with credentials (username/password)
2. After sign-in, user sees NFC logo button in the main interface
3. Tapping NFC button opens NFC functionality based on role:
   - **Patient**: View emergency data from card
   - **Doctor**: Read/Update patient emergency data on card
   - **Admin**: Initialize new cards, reset cards, full management

**NFC Card Purpose:**
The app uses **LINQS® DESFire EV1 8K NFC cards** for:
1. **Emergency data storage** (offline, readable by any NFC phone in emergencies)
2. **Medical data management** (role-based: patients read-only, doctors read/write)

## Hardware Specification
- **NFC Card**: LINQS® Highest Memory PVC NFC Card (DESFire EV1 8K chip)
- **Storage**: 8KB (8,192 bytes)
- **Features**: Advanced access control, encryption, multiple applications support

---

## Phase 1: NFC Permissions and Dependencies

### Prompt 1: Add NFC Dependencies and Permissions

```
I'm building an Android app in Android Studio using Java. I need to integrate NFC functionality for reading and writing to DESFire EV1 8K NFC cards.

Please add the following:

1. In AndroidManifest.xml:
   - Add NFC permissions (android.permission.NFC)
   - Add NFC feature requirement (<uses-feature android:name="android.hardware.nfc" android:required="true" />)
   - Add intent filters for NFC tag discovery in the main activity

2. In build.gradle (app level):
   - Add any necessary dependencies for NFC support
   - If available, add library for DESFire card support (like nfctools or similar)

3. Create a basic NFCManager.java class that will handle:
   - Checking if device supports NFC
   - Checking if NFC is enabled
   - Showing dialog to enable NFC if disabled

Return the complete code for AndroidManifest.xml updates, build.gradle updates, and NFCManager.java.
```

---

## Phase 2: Backend API Integration for Keys

### Prompt 2: Create API Service for NFC Key Management

```
I need to integrate with my backend API to get NFC write keys based on user roles.

Backend API endpoint: POST /api/nfc/get-write-key
Authentication: Bearer token (JWT) in header
Request body: { "userId": "string", "role": "string" }

Response for Admin:
{
  "masterKey": "string",
  "writeKey": "string"
}

Response for Doctor:
{
  "writeKey": "string"
}

Response for Patient:
{
  "message": "Read-only access"
}

Please create:
1. A RetrofitClient.java class for API calls (if not already exists)
2. An NFCKeyService.java interface with the endpoint
3. An NFCKeyManager.java class that:
   - Calls the API with user credentials (from session/SharedPreferences)
   - Stores keys temporarily in memory only (not SharedPreferences)
   - Provides methods like getWriteKey(), hasWritePermission()
   - Clears keys on logout

Include proper error handling and use Retrofit with Gson converter.
```

---

## Phase 3: Role-Based UI Components

### Prompt 3: Add NFC Button to Main Dashboard

```
I need to add an NFC button to the main dashboard that appears after user signs in.

After successful sign-in, add an NFC logo button (Floating Action Button or toolbar button) that:
- Opens NFCActivity when clicked
- Shows appropriate NFC options based on user role

Please update:
1. Main dashboard activities (PatientDashboardActivity.java, DoctorDashboardActivity.java, AdminDashboardActivity.java):
   - Add NFC Floating Action Button (FAB) with NFC icon
   - On click, launch NFCActivity with user role passed as Intent extra
   - Position FAB in bottom-right corner

2. Create NFCActivity.java - Main NFC activity that shows role-based options:
   
   For PATIENT:
   - "Read My Emergency Data" button
   - Message: "Tap your NFC card to view emergency information"
   - NO write/update functionality
   
   For DOCTOR:
   - "Read Patient Card" button
   - "Update Patient Card" button
   - Patient selection dropdown (fetch from API)
   - Instructions for each action
   
   For ADMIN:
   - All doctor features
   - "Initialize New Card" button
   - "Reset Card" button
   - "View Card Info" button

3. activity_nfc.xml - Layout with different sections for each role using ViewSwitcher

4. UpdateCardActivity.java - Form activity for entering emergency data:
   - Fields: name, age, blood group (dropdown), allergies, recent operation, emergency contact name, emergency contact phone
   - "Fill from Patient Record" button (auto-populate from selected patient)
   - "Tap Card to Write" button (enabled after validation)

Use Material Design 3 components. Make the UI clean and intuitive.
```

---

## Phase 4: NFC Reading Functionality (All Roles)

### Prompt 4: Implement NFC Card Reading

```
I need to implement NFC card reading functionality that works for all user roles.

The DESFire EV1 8K cards store:
1. NDEF message with emergency data (plain text, publicly readable, no authentication needed)
2. Patient ID for linking card to patient record in database

Please create:

1. NFCReaderHelper.java class with methods:
   - readEmergencyData(Tag tag): Returns EmergencyData object
   - readAuthToken(Tag tag): Returns authentication token string
   - handleNFCIntent(Intent intent): Processes NFC intent and extracts tag

2. EmergencyData.java model class with fields:
   - String name
   - int age
   - String bloodGroup
   - String allergies
   - String recentOperation
   - String emergencyContactName
   - String emergencyContactPhone
   - String patientId

3. In NFCActivity.java, add:
   - NFC foreground dispatch system in onResume()
   - Handle NFC intent in onNewIntent()
   - Parse NDEF message and display emergency data in a dialog or new screen
   - Extract patient ID from card data

4. Create DisplayEmergencyDataActivity.java:
   - Shows emergency data in a clean, readable format
   - Works offline (no API calls needed)
   - Emergency-themed UI (red accents, medical icons)
   - Option to "Call Emergency Contact" (launches phone dialer)
   - Option to "Share via SMS" (for first responders)

Use Android's NFC APIs (android.nfc package). Handle IsoDep for DESFire cards. Include proper error handling for:
- Tag lost during reading
- Invalid data format
- Empty NDEF message
```

---

## Phase 5: NFC Writing Functionality (Doctor/Admin Only)

### Prompt 5: Implement NFC Card Writing with Access Control

```
I need to implement NFC card writing functionality ONLY for doctors and admins.

Requirements:
1. Before writing, authenticate with DESFire card using the writeKey from backend API
2. Write emergency data to NDEF message (plain text format for offline reading)
3. Write patient ID to link card with patient record
4. Show progress dialog during write operation
5. Validate all data before writing

Please create:

1. NFCWriterHelper.java class with methods:
   - authenticateCard(Tag tag, String writeKey): Authenticates with DESFire using provided key
   - writeEmergencyData(Tag tag, EmergencyData data): Writes formatted NDEF message
   - writePatientId(Tag tag, String patientId): Writes patient ID to card
   - formatEmergencyDataAsNDEF(EmergencyData data): Formats data as readable text NDEF message

2. In UpdateCardActivity.java:
   - Add "Tap Card to Write" button (enabled after form is filled)
   - Validate all form fields before allowing write
   - Call NFCKeyManager to get writeKey
   - If user doesn't have write permission, show error and disable button
   - Enable NFC foreground dispatch when ready to write
   - Show progress dialog: "Writing to card... Please keep card close"
   - On success, show success message and log the operation
   - On failure, show detailed error message

3. The NDEF message format should be:
```
🚨 EMERGENCY MEDICAL INFO 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: [Patient Name]
Age: [Age] years
Blood Group: [Blood Group]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ALLERGIES: [Allergies]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Recent Operation: [Operation Details]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Emergency Contact:
[Contact Name]
[Contact Phone]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: [ID]
```

4. Add audit logging:
   - After successful write, call API: POST /api/audit/nfc-operation with { userId, patientId, cardId, operation: "WRITE", timestamp }

Use DESFire-specific APIs if available, otherwise use NDEF formatting. Include comprehensive error handling for:
- Authentication failure (wrong key)
- Write failure (card removed)
- Insufficient permissions
- Card is read-only or locked
```

---

## Phase 6: Patient Role - Read-Only Restrictions

### Prompt 6: Implement Patient Read-Only Access

```
I need to ensure patients can ONLY read NFC cards, not write to them.

In the patient's view of NFCActivity:

1. Hide/disable all write-related buttons
2. Show clear message: "You have read-only access. Contact your doctor to update card information."
3. When patient taps card:
   - Read emergency data and display it
   - Read auth token and use it to auto-login (if not already logged in)
   - If patient somehow tries to write (by bypassing UI), show error: "Unauthorized. Only doctors can update cards."

Please update:
1. NFCActivity.java - Add role checking in onCreate():
   - Get user role from Intent extras or SharedPreferences
   - If role is "patient":
     - Hide update/write buttons
     - Disable NFC write mode
     - Show read-only indicator

2. Create a method checkWritePermission() that:
   - Checks user role
   - Checks if write key is available from backend
   - Returns boolean
   - Shows toast message if permission denied

3. Add visual indicator:
   - For patients: Show badge/chip saying "READ ONLY"
   - For doctors: Show badge/chip saying "READ & WRITE"

Use Material Design components for the badges. Make the read-only restriction clear to users.
```

---

## Phase 7: Admin Functions - Card Initialization

### Prompt 7: Implement Admin Card Management

```
I need admin-specific functions to initialize and manage NFC cards.

Admin users (after signing in and clicking NFC button) should be able to:
1. Initialize a new blank card for a patient
2. Reset an existing card (erase and re-initialize)
3. View card details (card ID, registered patient, last updated)

Please create:

1. AdminNFCActivity.java with options:
   - "Initialize New Card" button
   - "Reset Existing Card" button
   - "View Card Info" button

2. InitializeCardActivity.java:
   - Select patient from dropdown/search
   - Get patient's emergency data from backend API: GET /api/patients/{id}/emergency-data
   - "Tap Card to Initialize" button
   - On tap:
     - Authenticate with master key (from backend)
     - Set up DESFire application structure
     - Create keys: Master Key, Doctor Write Key, Patient Read Key
     - Set file permissions:
       * Emergency data: Public read, Doctor/Admin write
       * Auth token: App read, Doctor/Admin write
     - Write initial emergency data
     - Generate and write unique patient ID
     - Call backend: POST /api/nfc/register-card with { patientId, cardId }
     - Show success message

3. CardInfoActivity.java:
   - On tap, read card ID and patient ID
   - Call backend: GET /api/nfc/card-info/{cardId}
   - Display:
     - Card ID
     - Registered patient name and ID
     - Last updated date and by whom
     - Current emergency data
     - Option to "Update" or "Reset"

4. Handle DESFire-specific operations:
   - Create application on card (application ID)
   - Set authentication keys
   - Create files with specific permissions
   - Format card if needed

Include confirmation dialogs before destructive operations (reset/format). Add comprehensive logging for all admin operations.
```

---

## Phase 8: Offline Functionality & Error Handling

### Prompt 8: Ensure Robust Offline NFC Reading

```
The most critical feature is that emergency data must be readable OFFLINE in true emergencies.

Please ensure:

1. Emergency data reading works WITHOUT internet connection:
   - No API calls required to read emergency data
   - Data is parsed directly from NDEF message on card
   - Display works even in airplane mode

2. Emergency data reading should work even for non-app users:
   - Any phone can read NDEF message from card
   - Within your app, users can access EmergencyReadActivity.java via NFC button
   - Works offline 100%
   - Displays data in large, readable format
   - Option to "Call Emergency Contact" directly from the screen
   - Option to "Share via SMS" to send emergency info to first responders
   - Can be launched from NFCActivity after user signs in

3. Public NFC reading (optional - for external emergency access):
   - Any NFC reader app can read the NDEF plain text
   - Your app can also handle NFC intents if installed
   - Emergency data is universally readable

4. Comprehensive error handling:
   - Tag lost during read → "Card removed too quickly. Please tap again."
   - Empty/corrupted NDEF → "No emergency data on this card"
   - Unsupported card type → "This card is not compatible"
   - NFC disabled → "Please enable NFC in settings"
   - No NFC hardware → "This device doesn't support NFC"

5. Add retry mechanism:
   - If read fails, show "Retry" button
   - Automatically retry up to 3 times
   - Clear error messages for each failure type

6. Testing mode (debug builds only):
   - Add "Simulate Card Read" button that uses test data
   - Allows testing without physical NFC card

Make sure emergency data display looks professional, uses medical iconography, and is accessible (large text, high contrast). This is life-critical functionality.
```

---

## Phase 9: Security & Data Validation

### Prompt 9: Implement Security Best Practices

```
I need to ensure NFC operations are secure and data is validated.

Security requirements:

1. Key Management:
   - NEVER hardcode NFC keys in the app
   - Always fetch keys from backend API (over HTTPS)
   - Store keys in memory only (not SharedPreferences/database)
   - Clear keys from memory after use
   - Clear all keys on logout

2. Data Validation before writing:
   - Name: Required, 2-50 characters, letters and spaces only
   - Age: Required, 1-120, numeric only
   - Blood Group: Required, must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-
   - Allergies: Optional, max 200 characters
   - Recent Operation: Optional, max 200 characters
   - Emergency Contact Phone: Required, valid phone format
   - Emergency Contact Name: Required, 2-50 characters

3. Create DataValidator.java with methods:
   - validateEmergencyData(EmergencyData data): Returns ValidationResult
   - validateBloodGroup(String bloodGroup): Boolean
   - validatePhone(String phone): Boolean
   - sanitizeInput(String input): Removes dangerous characters

4. Prevent code injection:
   - When reading NDEF data, sanitize text
   - Remove any HTML/script tags
   - Limit field lengths when parsing
   - Validate data format matches expected structure

5. Audit logging:
   - Log all write operations with timestamp, user ID, patient ID
   - Log failed authentication attempts
   - Log card initialization/reset operations
   - Send logs to backend: POST /api/audit/nfc-operation

6. Add security checks:
   - Before writing, verify user has current valid session (JWT not expired)
   - Re-authenticate with backend before destructive operations (reset/format)
   - Add confirmation dialogs for all write operations
   - Rate limiting: Max 5 write attempts per minute per user

7. Secure patient ID storage:
   - Store patient ID securely on card
   - Set proper read/write permissions on DESFire files

Create comprehensive validation with clear error messages. Include unit tests for DataValidator class if possible.
```

---

## Phase 10: UI Polish & User Experience

### Prompt 10: Enhance NFC User Interface

```
I need to make the NFC features user-friendly and intuitive.

UI/UX improvements needed:

1. NFC Status Indicator:
   - Create a persistent NFC icon in toolbar/action bar
   - Green: NFC enabled and ready
   - Red: NFC disabled
   - Gray: No NFC hardware
   - Tapping icon shows status details and option to enable NFC

2. Tap Instruction Animation:
   - When waiting for NFC tap, show animated phone & card illustration
   - Pulsing animation to indicate "ready to scan"
   - Clear text: "Hold card against back of phone"
   - Sound/vibration on successful read

3. Progress Indicators:
   - Reading: "Reading card data..." with spinner
   - Writing: "Writing to card... Keep card close" with progress bar
   - Authenticating: "Authenticating..." with spinner

4. Create NFCGuidanceActivity.java:
   - First-time user tutorial showing:
     - Where to tap card on phone (with device-specific image if possible)
     - How long to hold card
     - What to do if read fails
   - Show this tutorial on first NFC operation
   - Option to "Don't show again"

5. Success/Error Feedback:
   - Success: Green checkmark animation + success sound + vibration
   - Error: Red X animation + error sound + vibration
   - Clear, actionable error messages

6. Update UpdateCardActivity.java form:
   - Use Material TextFields with proper hints
   - Add icons for each field (person icon for name, phone icon for contact, etc.)
   - Blood group as dropdown spinner, not text input
   - Add "Quick Fill from Patient Record" button to auto-populate from database
   - Show character counts for text fields
   - Disable "Write to Card" button until all required fields are valid

7. Card History:
   - In patient profile, show "NFC Card History" section
   - List of all updates with timestamps and who updated
   - Fetched from backend: GET /api/patients/{id}/card-history

8. Accessibility:
   - Add content descriptions for all NFC-related images/icons
   - Ensure NFC instructions are screen-reader friendly
   - Large touch targets for NFC action buttons (min 48dp)
   - High contrast mode support

Use Material Design 3 components. Add smooth transitions between states. Include haptic feedback for important actions.
```

---

## Phase 11: Testing & Edge Cases

### Prompt 11: Implement Comprehensive Testing & Edge Cases

```
I need to handle all edge cases and add testing capabilities.

Edge cases to handle:

1. Multiple cards tapped simultaneously:
   - Read only the first detected tag
   - Show message if multiple tags detected

2. User removes card during read/write:
   - Catch TagLostException
   - Show message: "Card removed during operation. Please try again."
   - Don't crash or leave card in inconsistent state

3. Card is locked or write-protected:
   - Detect write protection
   - Show message: "This card is locked. Contact admin."

4. Card has wrong format/not initialized:
   - Detect if card has no NDEF message
   - For doctors/admins: Offer to initialize card
   - For patients: Show message to contact admin

5. Patient has no card registered:
   - When doctor tries to update card for patient, check if patient has card
   - If not, show option to initialize new card

6. Duplicate card registration:
   - Before registering card, check if cardId already registered
   - Show warning if card is registered to different patient
   - Allow admin to override

7. Backend API is down:
   - Emergency data read should still work (offline)
   - Write operations should show: "Cannot connect to server. Try again later."
   - Queue write operations for retry when connection restored?

8. Testing features (debug builds only):
   - Add "Test Mode" toggle in developer options
   - Mock NFC operations with test data
   - Simulate successful/failed reads and writes
   - Test without physical NFC cards

Create:
1. NFCTestActivity.java (debug builds only):
   - Buttons to simulate various scenarios
   - "Simulate Emergency Data Read"
   - "Simulate Write Success"
   - "Simulate Tag Lost"
   - "Simulate Authentication Failure"
   - Uses mock data and shows same UI as real operations

2. Add try-catch blocks for all NFC operations:
   - TagLostException
   - IOException
   - FormatException
   - SecurityException
   - IllegalStateException

3. Add detailed logging:
   - Log all NFC operations (debug level)
   - Log errors with stack traces
   - Use Timber or Android Log with proper tags

4. Create NFCHealthCheck.java:
   - Method to verify NFC functionality on app start
   - Check NFC availability
   - Check permissions
   - Log device NFC capabilities

Include unit tests for EmergencyData parsing, data validation, and NDEF formatting functions.
```

---

## Additional Requirements

### Backend API Endpoints Required

Ensure your backend has these endpoints:

```
POST /api/nfc/get-write-key
- Request: { userId, role }
- Response (Admin): { masterKey, writeKey }
- Response (Doctor): { writeKey }
- Response (Patient): { message: "Read-only access" }

GET /api/patients/{id}/emergency-data
- Response: { name, age, bloodGroup, allergies, recentOperation, emergencyContact }

POST /api/nfc/register-card
- Request: { patientId, cardId }
- Response: { success, message }

POST /api/audit/nfc-operation
- Request: { userId, operation, cardId, patientId, timestamp }
- Response: { success }

GET /api/nfc/card-info/{cardId}
- Response: { cardId, patientId, patientName, lastUpdated, lastUpdatedBy }

GET /api/patients/{id}/card-history
- Response: [ { timestamp, operation, performedBy, changes } ]
```

---

## Libraries to Consider

Suggest to Zencoder AI to use these libraries if available:

1. **NFC Tools**: For DESFire card handling
2. **Desfire4Android**: DESFire-specific library (if available on Maven)
3. **Material Components**: For UI (com.google.android.material:material)
4. **Retrofit**: For API calls
5. **Gson**: For JSON parsing
6. **Glide**: For loading images/animations
7. **Timber**: For better logging

---

## Important Notes for Zencoder AI

When giving these prompts to Zencoder AI:

1. **Provide prompts sequentially** - Start with Phase 1 and go in order (11 phases total)
2. **Test after each phase** - Verify NFC functionality works before proceeding
3. **User signs in first** - All NFC features are accessed AFTER authentication via NFC button
4. **Customize based on your existing code** - Adapt prompts to match your app's architecture
5. **API endpoints** - Make sure backend APIs are ready before implementing client code
6. **Physical testing required** - NFC features must be tested on real device with real NFC cards
6. **Security is critical** - Don't skip validation and security steps
7. **Offline functionality is priority #1** - Emergency data must work without internet

---

## Quick Reference: Role Permissions

| Feature | Patient | Doctor | Admin |
|---------|---------|---------|-------|
| Access NFC features via button | ✅ | ✅ | ✅ |
| Read emergency data (offline) | ✅ | ✅ | ✅ |
| Write emergency data | ❌ | ✅ | ✅ |
| Initialize new card | ❌ | ❌ | ✅ |
| Reset/format card | ❌ | ❌ | ✅ |
| Change card keys | ❌ | ❌ | ✅ |
| View card history | Own card only | Assigned patients | All cards |

---

## Testing Checklist

Before deploying:

- [ ] NFC button appears in dashboard after sign-in
- [ ] NFC features are role-based (patient read-only, doctor read/write)
- [ ] NFC read works offline (airplane mode test)
- [ ] Patient cannot write to cards (UI and backend blocked)
- [ ] Doctor can write to cards after authentication
- [ ] Admin can initialize new cards
- [ ] Login via NFC works for all roles
- [ ] Error messages are clear and actionable
- [ ] All required fields are validated
- [ ] App doesn't crash when card is removed during operation
- [ ] Works on multiple Android devices (test various NFC chip positions)
- [ ] Emergency data is readable by any NFC-capable phone (not just your app)
- [ ] Keys are never stored persistently
- [ ] Audit logs are created for all write operations

---

## Support & Troubleshooting

Common issues and solutions:

**Issue**: "No NFC adapter found"
- Solution: Device doesn't have NFC hardware, show error message

**Issue**: "Tag was lost"
- Solution: User removed card too quickly, ask to hold card longer

**Issue**: "Authentication failed"
- Solution: Wrong key or insufficient permissions, check user role

**Issue**: Emergency data not readable on other phones
- Solution: Ensure NDEF formatting is standard (not app-specific)

**Issue**: Write operation fails
- Solution: Check if card is write-protected or locked

---

## Final Notes

This implementation provides **military-grade access control** while keeping emergency data **accessible offline** for life-saving scenarios. The DESFire EV1 8K chip's security features ensure only authorized personnel can modify patient data, while anyone with an NFC phone can read emergency information in critical situations.

Remember: **Emergency data accessibility saves lives** 🚑
