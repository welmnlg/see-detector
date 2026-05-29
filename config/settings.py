import os

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

RAW_VULNERABLE_DIR = os.path.join(DATA_DIR, 'raw', 'vulnerable')
RAW_BENIGN_DIR = os.path.join(DATA_DIR, 'raw', 'benign')
EXTRACTED_DIR = os.path.join(DATA_DIR, 'extracted')
FEATURES_DIR = os.path.join(DATA_DIR, 'features')
MODELS_DIR = os.path.join(DATA_DIR, 'models')

# Chrome Stats API
CHROME_STATS_API_KEY = "4611d1b1-3ada-4950-8acf-21963f6c892f"

# ML Pipeline Settings
TEST_SIZE = 0.1
VAL_SIZE = 0.2
RANDOM_STATE = 42
TARGET_CLASS_SIZE = 250 # Using SMOTE to oversample minority class

# Sensitive Permissions (based on Lim et al. Table 3)
SENSITIVE_PERMISSIONS = [
    'cookies', 'history', 'tabs', 'bookmarks', 'topSites', 'browsingData',
    'downloads', 'geolocation', 'webRequest', 'webRequestBlocking', 'debugger',
    'management', 'activeTab', 'clipboardRead', 'clipboardWrite', 'contentSettings',
    'privacy', 'proxy', 'nativeMessaging', 'webNavigation', 'declarativeNetRequest',
    'offscreen', 'fileBrowserHandler'
]

# HTTP Request APIs for JS Scanning (based on Lim et al. Table 1)
HTTP_APIS = [
    r'\bfetch\s*\(',
    r'\bXMLHttpRequest\b',
    r'\baxios\b',
    r'\$\.ajax\b',
    r'\$\.post\b',
    r'\$\.get\b',
    r'\$\.getJSON\b',
    r'\.open\s*\(\s*["\'](?:GET|POST|PUT|DELETE)',
    r'\bexecuteScript\b',
    r'\bjsonp\b',
    r'\blocation\s*[.=]',
    r'\bsendBeacon\b',
    r'\bWebSocket\b'
]

# Holistic Match Patterns (based on Lim et al. Table 2)
HOLISTIC_PATTERNS = [
    '<all_urls>',
    '*://*/*',
    'http://*/*',
    'https://*/*',
    'file://*/*',
    'ftp://*/*'
]
