# scripts/setup-backend.sh
#!/bin/bash
echo "Setting up Python backend..."
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r app/requirements.txt
echo "Backend setup complete!"