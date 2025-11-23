# Setup Instructions - Crack Classification Project

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

### Option 1: Quick Install (Recommended)
Run the following command in your terminal from the project directory:

```bash
pip install -r requirements.txt
```

### Option 2: Manual Installation
If you prefer to install packages individually, run these commands:

```bash
pip install pillow
pip install scikit-learn
pip install numpy
pip install joblib
```

## Verify Installation
To verify all packages are installed correctly, run:

```bash
python -c "from PIL import Image, ImageEnhance; from sklearn.model_selection import train_test_split; from sklearn.metrics import accuracy_score; import numpy as np; import joblib; print('All packages installed successfully!')"
```

You should see: `All packages installed successfully!`

## Running the Notebook
1. Open Jupyter Notebook or Jupyter Lab:
   ```bash
   jupyter notebook
   ```
   Or if using VS Code/Cursor, simply open `CrackClassification.ipynb`

2. Run the cells sequentially starting from the first cell

## Package Versions
The following versions were tested and confirmed working:
- pillow: 12.0.0
- scikit-learn: 1.7.2
- numpy: 2.2.4
- joblib: 1.5.2
- scipy: 1.16.3 (installed as dependency of scikit-learn)
- threadpoolctl: 3.6.0 (installed as dependency of scikit-learn)

## Troubleshooting

### Import Errors
If you encounter "Import could not be resolved" errors:
1. Make sure you're using the correct Python environment
2. Verify packages are installed: `pip list`
3. Try reinstalling the problematic package: `pip install --upgrade <package-name>`

### Windows-Specific Issues
- If you see warnings about `wmic`, don't worry - the code handles this with environment variables
- Make sure you're running the command prompt or PowerShell as administrator if installation fails

## Project Structure
```
SD_Crack_Classification/
├── CrackClassification.ipynb    # Main notebook
├── SETUP.md                     # This file
├── requirements.txt             # Package dependencies
└── Concrete_Crack/              # Dataset directory
    ├── 0_Non_Crack/            # Non-crack images
    └── 1_Crack/                # Crack images
```

## Support
If you encounter any issues during setup, please contact the team lead or check the Python/pip documentation.

