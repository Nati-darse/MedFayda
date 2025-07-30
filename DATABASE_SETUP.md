# PostgreSQL Database Setup for MedFayda

## Prerequisites

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - Windows: PostgreSQL should start automatically
   - macOS: `brew services start postgresql`
   - Ubuntu: `sudo systemctl start postgresql`

## Database Setup Steps

### 1. Connect to PostgreSQL as superuser

```bash
# Connect as postgres user
psql -U postgres

# Or on some systems:
sudo -u postgres psql
```

### 2. Create Database and User

```sql
-- Create the database
CREATE DATABASE medfayda;

-- Create a dedicated user
CREATE USER medfayda_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medfayda TO medfayda_user;

-- Exit
\q
```

### 3. Update Environment Variables

Edit `backend/.env` file:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medfayda
DB_USER=medfayda_user
DB_PASSWORD=your_secure_password
```

**Important:** Replace `your_secure_password` with a strong password!

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Start the Application

```bash
# Start the backend server
npm start

# Or for development with auto-reload
npm run dev
```

The application will automatically:
- Connect to PostgreSQL
- Create all necessary tables
- Set up indexes for optimal performance

## Verification

### Check if database is working:

1. **Backend logs should show:**
   ```
   ✅ PostgreSQL database connection established successfully.
   ✅ Database synchronized successfully.
   🚀 Server is running on port 5000
   ```

2. **Test the connection:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Check database tables:**
   ```sql
   psql -U medfayda_user -d medfayda
   \dt
   ```

   You should see tables: Users, Patients, HealthRecords, Appointments, Reminders

## Troubleshooting

### Common Issues:

1. **Connection refused**
   - Make sure PostgreSQL is running
   - Check if the port 5432 is correct
   - Verify firewall settings

2. **Authentication failed**
   - Double-check username and password in .env
   - Ensure the user has proper permissions

3. **Database doesn't exist**
   - Make sure you created the database: `CREATE DATABASE medfayda;`

4. **Permission denied**
   - Grant proper privileges: `GRANT ALL PRIVILEGES ON DATABASE medfayda TO medfayda_user;`

### Reset Database (if needed):

```sql
-- Connect as postgres superuser
psql -U postgres

-- Drop and recreate
DROP DATABASE IF EXISTS medfayda;
CREATE DATABASE medfayda;
GRANT ALL PRIVILEGES ON DATABASE medfayda TO medfayda_user;
```

## Production Considerations

For production deployment:

1. **Use environment-specific passwords**
2. **Enable SSL connections**
3. **Set up database backups**
4. **Configure connection pooling**
5. **Monitor database performance**

## Database Schema

The application uses these main tables:

- **Users**: Store user accounts (patients, doctors, admins)
- **Patients**: Extended patient information
- **HealthRecords**: Medical records and visit history
- **Appointments**: Scheduled appointments
- **Reminders**: Medication and checkup reminders

All tables use UUIDs as primary keys for better security and scalability.
