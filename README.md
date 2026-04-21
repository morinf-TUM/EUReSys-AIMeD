# AI-enabled Medical Device CE Marking Support System

## Overview

The I-enabled Medical Device CE Marking Support System is a  platform designed to help medical device manufacturers navigate the complex regulatory landscape of the European Union. This system provides automated classification, compliance documentation suggestion and initial regulatory guidance for:

- **MDR (Medical Device Regulation EU 2017/745)**
- **AI Act (Artificial Intelligence Act Proposal 2021/0106)**
- **GDPR (General Data Protection Regulation EU 2016/679)**

### Key Features

- **Automated Classification**: as well as justification thereof for MDR, AI Act, and GDPR classification
- **Documentation Guidance**: AI-powered creation of regulatory guidance
- **Flexible LLM Integration**: Support for both online Mistral API and local Mistral server

### Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)              │          
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Scoping Interface, Documentation Center, Contact detail│  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              ↑
                              │ (REST API)
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                    Backend (Django)                           │
│          ┌─────────────────┐    ┌─────────────┐               │
│          │  LLM Service    │    │  Models     │               │
│          │  (Mistral)      │    │ (PostgreSQL)│               │
│          └─────────────────┘    └─────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

## Installation

Two step-by-step guides cover the two modes the codebase supports:

- **Development** — `Guides/DEV_SETUP.md`: local install with the React dev
  server and `manage.py runserver`, for writing and testing code.
- **Production** — `Guides/PROD_SETUP.md`: gunicorn + nginx + systemd on a
  deployment host, with the frontend served as a pre-built static bundle.

The same codebase runs in both modes — behaviour is selected at runtime
from environment variables (see `.env.dev.example` and `.env.prod.example`
at the repo root).

The condensed walkthrough below is kept for historical reference; follow
one of the two guides above for a real install.

## Quick Start (Development)

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** (tested with 3.10.12)
- **Node.js 18+** (tested with 18.20.8)
- **PostgreSQL 14+**
- **npm or yarn** for package management

### 1. Clone Repository

```bash
git clone https://github.com/morinf-TUM/EUReSys-AIMeD
cd EUReSys-AIMeD
```

### 2. Set Up Database

Install and configure PostgreSQL:

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE regulatory_db;"
sudo -u postgres psql -c "CREATE USER regulatory_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE regulatory_db TO regulatory_user;"
sudo -u postgres psql -c "ALTER DATABASE regulatory_db OWNER TO regulatory_user;"
```

Verify the database connection:

```bash
psql -U regulatory_user -d regulatory_db -h localhost -W
# Enter password: password
# Type \q to exit
```

### 3. Backend Setup

Install Python dependencies:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install required dependencies
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Create a superuser for admin access:

```bash
python manage.py createsuperuser
# Follow the prompts to create username, email, and password
```

### 4. Frontend Setup

Install Node.js dependencies:

```bash
cd frontend

# Install dependencies using npm
npm install

# OR using yarn
yarn install

cd ..
```

**Important**: Update the API base URL for development. Edit `frontend/src/services/api.ts`:

```typescript
// Change this line (around line 6):
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api'

// To this for development:
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'
```

Or set the environment variable:

```bash
# Create frontend/.env file
echo "REACT_APP_API_BASE_URL=http://localhost:8000/api" > frontend/.env
```

### 5. Running the Application

Start both backend and frontend servers in separate terminals:

**Terminal 1 - Backend:**

```bash
# Activate virtual environment if not already active
source venv/bin/activate

# Start Django development server
python manage.py runserver
```

The backend will be available at:
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/

**Terminal 2 - Frontend:**

```bash
cd frontend

# Start React development server
npm start
# OR
yarn start
```

The frontend will automatically open at http://localhost:3000

### 6. Verification

Verify your setup is working correctly:

1. **Frontend**: Open http://localhost:3000 in your browser
2. **Backend API**: Visit http://localhost:8000/api/ (should see API root)
3. **Admin Interface**: Visit http://localhost:8000/admin/ (login with superuser credentials)
4. **Database**: Check that migrations ran successfully:
   ```bash
   python manage.py showmigrations
   ```

Run the test suite to verify functionality:

```bash
# Run backend tests
python manage.py test

# Run specific test modules
python tests/test_runner.py
```

## Configuration (Optional)

### LLM Integration

The system supports Mistral LLM for AI-powered document generation. You can use either the online API or a local server.

#### Option 1: Online Mistral API (Recommended for Development)

```bash
export USE_LOCAL_MISTRAL=false
export MISTRAL_API_KEY=your_api_key_here
```

Get your API key from [Mistral AI](https://mistral.ai).

#### Option 2: Local Mistral Server

```bash
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://localhost:11434/v1
```

For detailed setup instructions, see [LOCAL_MISTRAL_SETUP.md](./Guides/LOCAL_MISTRAL_SETUP.md).


### Environment Variables

Key environment variables for development (optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `True` | Django debug mode |
| `SECRET_KEY` | development key | Django secret key (change in production) |
| `USE_LOCAL_MISTRAL` | `false` | Use local Mistral server instead of API |
| `LOCAL_MISTRAL_URL` | `http://localhost:11434/v1` | Local Mistral server endpoint |
| `MISTRAL_API_KEY` | `''` | Mistral API key for online service |

## Testing

### Run All Tests

```bash
# Run Django test suite
python manage.py test

# Run comprehensive test runner
python tests/test_runner.py

# Run specific test modules
python -m pytest tests/regulatory/test_mdr_classification.py
python -m pytest tests/regulatory/test_ai_act_classification.py
```

### Run Frontend Tests

```bash
cd frontend
npm test
# OR
yarn test
```

### Manual API Testing

```bash
# Test frontend-backend integration
bash tests/test_frontend_manual.sh
```

## Documentation

### Setup and Configuration Guides

- **[DEV_SETUP.md](./Guides/DEV_SETUP.md)** - Local development install (React dev server + `manage.py runserver`)
- **[PROD_SETUP.md](./Guides/PROD_SETUP.md)** - Production deployment on a host (gunicorn + nginx + systemd, static frontend bundle)
- **[LOCAL_MISTRAL_SETUP.md](./Guides/LOCAL_MISTRAL_SETUP.md)** - Detailed LLM configuration and setup
- **[USER_MANAGEMENT_GUIDE.md](./Guides/USER_MANAGEMENT_GUIDE.md)** - User administration and management via API

## Troubleshooting

### Common Issues

**Issue: Database connection refused**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U regulatory_user -d regulatory_db -h localhost

# Verify credentials in backend/settings.py match your setup
```

**Issue: Frontend cannot connect to backend**

- Verify backend is running on http://localhost:8000
- Check `frontend/src/services/api.ts` has correct API_BASE_URL
- Check browser console for CORS errors
- Verify `django-cors-headers` is installed

**Issue: Missing Python dependencies**

```bash
# Reinstall from the pinned set
pip install -r requirements.txt

# Verify installation
pip list | grep -E "django-cors-headers|mistralai"
```

**Issue: Frontend build errors**

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue: Migration errors**

```bash
# Check migration status
python manage.py showmigrations

# If needed, run migrations again
python manage.py migrate

# For fresh start (development only!)
# WARNING: This will delete all data
python manage.py flush
python manage.py migrate
```

**Issue: Port already in use**

```bash
# Backend (port 8000)
python manage.py runserver 8001  # Use different port

# Frontend (port 3000)
PORT=3001 npm start  # Use different port
```

### Getting Help

- Check the guides in `./Guides/` directory
- Review test files in `tests/` for usage examples
- Check Django logs for backend errors
- Check browser console for frontend errors

## Project Structure

```
EUReSys-AIMeD/
├── backend/                 # Django backend application
│   ├── core/               # Core Django app (models, views, etc.)
│   ├── llm/                # LLM integration service
│   ├── settings.py         # Django settings
│   └── urls.py             # URL routing
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript type definitions
│   └── package.json       # Frontend dependencies
├── Guides/                 # Documentation guides
│   ├── DEV_SETUP.md
│   ├── PROD_SETUP.md
│   ├── LOCAL_MISTRAL_SETUP.md
│   └── USER_MANAGEMENT_GUIDE.md
├── tests/                  # Test suite
│   ├── regulatory/        # Regulatory logic tests
│   └── test_runner.py     # Comprehensive test runner
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Contributing

This is a development project. For contributing guidelines:

1. Follow Django and React best practices
2. Write tests for new features
3. Ensure regulatory compliance for classification logic
4. Document any changes to regulatory rules

## License

This project is licensed under the **GNU Affero General Public License
v3.0** (AGPL-3.0). In short: you may use, modify, and redistribute the
code freely, but any distribution or network-accessible deployment of
modified versions must make the corresponding source code available
under the same license. See the [LICENSE](LICENSE) file for the full
text.

**Important Legal Notice**: This software is designed to assist with regulatory compliance but does not replace professional legal or regulatory advice. Users are responsible for ensuring their medical devices comply with all applicable regulations. All LLM-generated outputs must be reviewed by qualified regulatory professionals before use in regulatory submissions.
