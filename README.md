# 🏥 MedFayda - Centralized Health Records System

> **Empowering Ethiopia's healthcare system with secure, accessible medical records**

A comprehensive healthcare management platform for Ethiopia, providing centralized medical records, patient portals, and healthcare provider tools.


## Project Synopsis  

### Problem Statement  
Ethiopia’s healthcare system struggles with:  
- Fragmented patient records across hospitals.  
- No centralized system to access medical history.  
- Identity verification challenges during emergencies.  

### Planned Solution  
MedFayda solves this by:  
- Fayda ID authentication (OIDC integration) for secure login.  
- Unified health records linked to Fayda IDs.  
- Real-time access for doctors with patient consent.  
- SMS fallback for areas with poor internet.  

### Expected Outcome  
- faster diagnosis with instant record access.  
- Reduced duplicate tests, saving costs.  
- Secure, nationwide scalability via Fayda.  

### Fayda’s Role  
- Primary identity verification (government-backed trust).  
- OIDC integration for seamless authentication.  
- Compliance with national digital ID standards.  

---

## ✨ Features

### 👥 **Patient Portal**
- **Fayda ID Integration** - Secure authentication using Ethiopia's national ID system
- **SMS Authentication** - Alternative login method for accessibility  
- **Medical Records** - Complete health history with lab results, medications, and treatments
- **Appointment Management** - Schedule and manage healthcare appointments
- **Medication Tracking** - Track prescriptions and medication reminders
- **Profile Management** - Update personal and emergency contact information

### 👨‍⚕️ **Doctor Portal**  
- **Professional Authentication** - License-based secure access
- **Patient Lookup** - FIN-based centralized patient record access
- **Medical Record Creation** - Add new consultations, treatments, and diagnoses
- **Cross-Hospital Access** - View patient records from any participating health center

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **PostgreSQL** 15 or higher (optional - works with mock data)
- **npm** 8.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/medfayda.git
   cd medfayda
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend  
   npm install
   npm run dev
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000

## 📁 Project Structure

```
MedFayda/
├── 📁 backend/              # Node.js/Express API server
│   ├── 📁 config/          # Database and app configuration
│   ├── 📁 middleware/      # Express middleware
│   ├── 📁 models/          # Database models (Sequelize)
│   ├── 📁 routes/          # API routes
│   ├── 📁 services/        # Business logic services
│   └── server.js           # Main server file
│
├── 📁 frontend/            # Next.js React application
│   ├── 📁 src/app/         # Next.js app directory
│   ├── 📁 public/          # Static assets
│   └── package.json        # Frontend dependencies
│
└── README.md               # This file
```

## 🧪 Demo Credentials

### **Patient Portal**
- **Fayda ID Login**: Automatic mock authentication
- **SMS Login**: Any phone number + any 6-digit OTP

### **Doctor Portal**  
- **License**: `MD001` | **Hospital**: `HC001` | **Password**: `doctor123`
- **License**: `MD002` | **Hospital**: `HC002` | **Password**: `doctor123`

### **Patient FINs for Doctor Lookup**
- `FIN1753873082364` - Mock User
- `SMS911234567` - SMS User  
- `DOC001234567` - Test Patient

## 🛠️ Technology Stack

**Backend:**
- **Node.js** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT** authentication
- **Security middleware** (Helmet, CORS, Rate limiting)

**Frontend:**
- **Next.js 14** with App Router
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Responsive design** for all devices

## 💻 Development

```bash
# Backend development
cd backend
npm run dev

# Frontend development  
cd frontend
npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

## 🔒 Security Features

- **Government-grade security** standards
- **Fayda ID integration** for national authentication
- **JWT tokens** with secure expiration
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Input validation** and sanitization

## 🇪🇹 Ethiopian Healthcare Integration

- **Ministry of Health** API compatibility
- **Health Centers Registry** integration
- **Ethiopian regions** and cities support
- **Local healthcare standards** compliance

## 👥 Contributors
- **Natnael Darsema**
- **Kidus Paulos**  
- **Foziya Fetudin**

## Email address
```
natnaeldarsema@gmail.com
pauloskidus48@gmail.com
```
## 📄 License

MIT License - Built with ❤️ for Ethiopia's healthcare future 🇪🇹
