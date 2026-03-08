# Firestore Database Setup Guide

The application requires role-based access control configured in the Firestore database. Follow these steps to set up the necessary data.

## 1. Access Firestore
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Select your project: `rms-project-e5b04`.
3. Navigate to **Build** > **Firestore Database**.

## 2. Create the `roles` Collection
You need to create a collection named `roles` and add 5 documents inside it.

### Required Documents

| Document ID (Role) | Field Name | Field Type | Field Value (Example) |
| :--- | :--- | :--- | :--- |
| `admin` | `allowed_email` | string | `admin@example.com` |
| `manager` | `allowed_email` | string | `manager@example.com` |
| `kitchen` | `allowed_email` | string | `kitchen@example.com` |
| `reception` | `allowed_email` | string | `reception@example.com` |
| `employee` | `allowed_email` | string | `employee@example.com` |

> **Note:** Replace `admin@example.com`, etc., with the **actual email addresses** that should have access to each role.

## 3. Step-by-Step Creation
1. Click **Start collection**.
2. Enter Collection ID: `roles`.
3. Click **Next**.
4. Create the first document:
   - **Document ID**: `admin`
   - **Field**: `allowed_email`
   - **Type**: `string`
   - **Value**: (Enter your admin email)
5. Click **Save**.
6. Click **Add document** to add the remaining roles (`manager`, `kitchen`, `reception`, `employee`) following the table above.

## 4. Verify Rules
Ensure your **Rules** tab in Firestore allows read access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roles/{role} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```
