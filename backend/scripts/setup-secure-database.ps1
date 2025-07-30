# =====================================================
# MedFayda Production-Grade Database Setup Script
# Implements security best practices for Windows deployment
# =====================================================

param(
    [string]$DBHost = "localhost",
    [string]$DBUser = "medfayda_user", 
    [string]$DBName = "medfayda",
    [string]$DBPassword = "",
    [switch]$Force = $false,
    [switch]$Validate = $false
)

# Security and error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-PostgreSQLConnection {
    param([string]$Host, [string]$User, [string]$Database, [string]$Password)
    
    try {
        $env:PGPASSWORD = $Password
        $result = & psql -h $Host -U $User -d $Database -c "SELECT 1;" -t -A 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            Write-Status "❌ Connection failed: $result" $Red
            return $false
        }
    } catch {
        Write-Status "❌ Connection error: $_" $Red
        return $false
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

function Get-PostgreSQLPath {
    # Common PostgreSQL installation paths
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe", 
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Try to find psql in PATH
    try {
        $psqlPath = (Get-Command psql -ErrorAction Stop).Source
        return $psqlPath
    } catch {
        return $null
    }
}

function Invoke-SecureDatabaseSetup {
    param([string]$Host, [string]$User, [string]$Database, [string]$Password, [string]$ScriptPath)
    
    try {
        Write-Status "🔒 Setting up secure environment variables..." $Blue
        
        # Set environment variables securely
        $env:PGPASSWORD = $Password
        $env:PGHOST = $Host
        $env:PGUSER = $User
        $env:PGDATABASE = $Database
        $env:PGCONNECT_TIMEOUT = "30"
        $env:PGCOMMAND_TIMEOUT = "60"
        
        Write-Status "📋 Executing secure database setup script..." $Blue
        
        # Find PostgreSQL installation
        $psqlPath = Get-PostgreSQLPath
        if (-not $psqlPath) {
            throw "PostgreSQL psql command not found. Please ensure PostgreSQL is installed and in PATH."
        }
        
        Write-Status "📍 Using PostgreSQL at: $psqlPath" $Blue
        
        # Execute the script with security parameters
        $arguments = @(
            "-h", $Host,
            "-U", $User, 
            "-d", $Database,
            "-v", "ON_ERROR_STOP=1",  # Stop on first error
            "-v", "VERBOSITY=verbose", # Detailed output
            "-f", $ScriptPath,         # Script file
            "--no-password"            # Don't prompt for password (use env var)
        )
        
        Write-Status "🚀 Executing: $psqlPath $($arguments -join ' ')" $Blue
        
        $output = & $psqlPath @arguments 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✅ Database setup completed successfully!" $Green
            Write-Status "📊 Output:" $Blue
            $output | ForEach-Object { Write-Status "   $_" }
            return $true
        } else {
            Write-Status "❌ Database setup failed with exit code: $LASTEXITCODE" $Red
            Write-Status "📊 Error output:" $Red
            $output | ForEach-Object { Write-Status "   $_" $Red }
            return $false
        }
        
    } catch {
        Write-Status "❌ Setup error: $_" $Red
        return $false
    } finally {
        # Clean up environment variables
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        Remove-Item Env:\PGHOST -ErrorAction SilentlyContinue
        Remove-Item Env:\PGUSER -ErrorAction SilentlyContinue
        Remove-Item Env:\PGDATABASE -ErrorAction SilentlyContinue
        Remove-Item Env:\PGCONNECT_TIMEOUT -ErrorAction SilentlyContinue
        Remove-Item Env:\PGCOMMAND_TIMEOUT -ErrorAction SilentlyContinue
    }
}

function Test-DatabaseSetup {
    param([string]$Host, [string]$User, [string]$Database, [string]$Password)
    
    Write-Status "🔍 Validating database setup..." $Blue
    
    try {
        $env:PGPASSWORD = $Password
        
        # Test 1: Check if health_data schema exists
        $schemaCheck = & psql -h $Host -U $User -d $Database -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'health_data';" -t -A 2>&1
        
        if ($schemaCheck -match "health_data") {
            Write-Status "✅ health_data schema exists" $Green
        } else {
            Write-Status "❌ health_data schema missing" $Red
            return $false
        }
        
        # Test 2: Check if tables exist
        $tableCheck = & psql -h $Host -U $User -d $Database -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'health_data';" -t -A 2>&1
        
        if ([int]$tableCheck -ge 4) {
            Write-Status "✅ Tables created: $tableCheck" $Green
        } else {
            Write-Status "❌ Insufficient tables created: $tableCheck" $Red
            return $false
        }
        
        # Test 3: Check if encryption functions exist
        $functionCheck = & psql -h $Host -U $User -d $Database -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'health_data';" -t -A 2>&1
        
        if ([int]$functionCheck -ge 2) {
            Write-Status "✅ Encryption functions created: $functionCheck" $Green
        } else {
            Write-Status "❌ Encryption functions missing: $functionCheck" $Red
            return $false
        }
        
        # Test 4: Check RLS policies
        $policyCheck = & psql -h $Host -U $User -d $Database -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'health_data';" -t -A 2>&1
        
        if ([int]$policyCheck -ge 3) {
            Write-Status "✅ RLS policies created: $policyCheck" $Green
        } else {
            Write-Status "❌ RLS policies missing: $policyCheck" $Red
            return $false
        }
        
        Write-Status "🎉 All validation checks passed!" $Green
        return $true
        
    } catch {
        Write-Status "❌ Validation error: $_" $Red
        return $false
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Main execution
try {
    Write-Status "🏥 MedFayda Production-Grade Database Setup" $Blue
    Write-Status "=============================================" $Blue
    
    # Get password if not provided
    if (-not $DBPassword) {
        $securePassword = Read-Host "Enter database password for user '$DBUser'" -AsSecureString
        $DBPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    
    # Validate parameters
    if (-not $DBHost -or -not $DBUser -or -not $DBName -or -not $DBPassword) {
        throw "Missing required parameters. Use -DBHost, -DBUser, -DBName, and -DBPassword"
    }
    
    Write-Status "📋 Configuration:" $Blue
    Write-Status "   Host: $DBHost" 
    Write-Status "   User: $DBUser"
    Write-Status "   Database: $DBName"
    Write-Status "   Password: [HIDDEN]"
    
    # Test connection
    Write-Status "🔌 Testing database connection..." $Blue
    if (-not (Test-PostgreSQLConnection -Host $DBHost -User $DBUser -Database $DBName -Password $DBPassword)) {
        throw "Cannot connect to database. Please check your credentials and ensure PostgreSQL is running."
    }
    Write-Status "✅ Database connection successful!" $Green
    
    # Locate script file
    $scriptPath = Join-Path $PSScriptRoot "secure-database-setup.sql"
    if (-not (Test-Path $scriptPath)) {
        throw "Script file not found: $scriptPath"
    }
    Write-Status "📄 Script file located: $scriptPath" $Blue
    
    # Execute setup if not just validating
    if (-not $Validate) {
        if (-not $Force) {
            $confirm = Read-Host "This will modify your database schema. Continue? (y/N)"
            if ($confirm -ne "y" -and $confirm -ne "Y") {
                Write-Status "❌ Setup cancelled by user" $Yellow
                exit 0
            }
        }
        
        $setupSuccess = Invoke-SecureDatabaseSetup -Host $DBHost -User $DBUser -Database $DBName -Password $DBPassword -ScriptPath $scriptPath
        
        if (-not $setupSuccess) {
            throw "Database setup failed"
        }
    }
    
    # Validate setup
    $validationSuccess = Test-DatabaseSetup -Host $DBHost -User $DBUser -Database $DBName -Password $DBPassword
    
    if ($validationSuccess) {
        Write-Status "🎉 MedFayda database setup completed successfully!" $Green
        Write-Status "📋 Next steps:" $Blue
        Write-Status "   1. cd backend && npm start" 
        Write-Status "   2. cd frontend && npm run dev"
        Write-Status "   3. Access: http://localhost:3000"
    } else {
        throw "Database validation failed"
    }
    
} catch {
    Write-Status "❌ Setup failed: $_" $Red
    Write-Status "🔧 Troubleshooting:" $Yellow
    Write-Status "   1. Ensure PostgreSQL is running"
    Write-Status "   2. Verify database credentials"
    Write-Status "   3. Check if user has proper permissions"
    Write-Status "   4. Run with -Validate to check current state"
    exit 1
}
