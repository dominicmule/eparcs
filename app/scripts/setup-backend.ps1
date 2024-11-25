# scripts/setup-backend.ps1
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Backend dependencies installed successfully!"