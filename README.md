# ⚖️ Scalyth Legal Vault (`legal.scalyth.tech`)

Secure enterprise legal document repository and founder disclosure vault for **Scalyth Technologies Inc.**

---

## 🚀 Key Features

1. **🔐 Master Gateway Authentication**
   - Single-entry secure login portal.
   - Master password stored in `.env.local`: `LEGAL_MASTER_PASSWORD=SCALYTH2026`.
   - Identity session signing with HttpOnly secure cookies.

2. **📁 Full File & Folder Management**
   - **Folders**: Create custom directories, color tag them, organize legal covenants.
   - **Files & Contracts**: Create documents directly using built-in legal templates (Founder Disclosure, Mutual Enterprise NDA, IP Assignment Deed) or upload files.
   - **Preloaded Seed Documents**:
     - `Scalyth_Founder_Disclosure_Statement_2026.md`
     - `Scalyth_Founders_Agreement_and_CapTable.md`
     - `Enterprise_Mutual_Non_Disclosure_Agreement_MNDA.md`
     - `IP_Assignment_&_Inventions_Transfer_Deed.md`
     - `Board_Resolution_DPDP_Act_&_ISO_Compliance.md`

3. **🔒 File-Level Password Protection**
   - Protect sensitive files (like founder disclosures) with individual passwords or PINs.
   - Decrypt in-browser with specific file password or administrative Master Passkey fallback (`SCALYTH2026`).

4. **🕵️ Real-Time Device Fingerprint & View Audit History**
   - Answers: *"Kab kis device ya user ne vo file dekhi hai history mein aana chahiye ki kisne dekhi hai"*
   - Tracks:
     - **Timestamp**: Exact date, time, and timezone.
     - **User / Signatory**: Name, identity, and role.
     - **Action**: `VIEW`, `DOWNLOAD`, `UNLOCK`, `FAILED_UNLOCK`, `LOGIN`, `CREATE`, `DELETE`.
     - **Device Telemetry**:
       - Device Type (`Desktop`, `Mobile`, `Tablet`)
       - Operating System (`Windows 11`, `macOS`, `iOS`, `Android`, `Linux`)
       - Web Browser (`Chrome`, `Safari`, `Edge`, `Firefox`)
       - Screen Resolution
       - Client User-Agent
     - **Network**: Client IP address / VPC origin.
     - **Security Status**: `VERIFIED` or `BLOCKED` (with security alerts for failed unlocks).
   - Dedicated full-page **Audit Trail** + per-file **Inspection History** modal.
   - Export access history to **CSV**.

5. **📄 Confidential Document Viewer**
   - Built-in reader with dynamic legal watermarks (`CONFIDENTIAL - SCALYTH TECHNOLOGIES - VIEWED BY [USER]`).
   - Copy, download, and print support.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The master password is configured in `.env.local`:
```env
LEGAL_MASTER_PASSWORD=SCALYTH2026
SESSION_SECRET=scalyth-legal-vault-master-session-key-2026-enterprise-auth
NEXT_PUBLIC_APP_NAME="Scalyth Legal & Founder Vault"
NEXT_PUBLIC_APP_DOMAIN="legal.scalyth.tech"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Automated Verification Test
```bash
npm run test:vault
```

---

## 🔑 Default Credentials

| Item | Value |
| :--- | :--- |
| **Master Vault Password** | `SCALYTH2026` (stored in `.env.local`) |
| **Founder Disclosure PIN** | `FOUNDER2026` (or Master Pass `SCALYTH2026`) |
| **Domain Host** | `legal.scalyth.tech` |
| **Default User** | Founder / Managing Partner |
