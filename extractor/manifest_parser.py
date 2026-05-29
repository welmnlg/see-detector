import json
import os
from pathlib import Path
import sys

# Add parent directory to path to import settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def parse_manifest(ext_dir):
    """
    Parses manifest.json and extracts features relevant to SEE attack detection.
    
    Enhanced based on Lim et al. (2025) PoC Listings:
      - Listing 5 (HH): Parses declarative_net_request rules JSON for redirect actions
      - Listing 3 (LF): Detects file:// in content script match patterns
      - Listing 6 (UDown): Detects downloads permission
      - Listing 4 (CE): Detects cookies permission
    
    Returns a dictionary of features.
    """
    manifest_path = Path(ext_dir) / 'manifest.json'
    
    # Default feature values
    features = {
        'manifest_version': 0,
        'permissions_count': 0,
        'has_host_permissions': False,
        'host_permissions_count': 0,
        'has_content_scripts': False,
        'has_holistic_match_pattern': False,
        'match_pattern_scope': 0, # 0=none, 1=specific, 2=broad, 3=all_urls
        'has_service_worker': False,
        'has_background_page': False,
        'sensitive_permissions_count': 0,
        'has_web_accessible_resources': False,
        'has_externally_connectable': False,
        'has_csp_declaration': False,
        'has_update_url': False,
        
        # NEW: Content script scope features
        'content_script_count': 0,              # Number of content script entries
        'has_file_match_pattern': False,         # file:// in content_scripts matches (LF indicator)
        'has_all_frames': False,                 # all_frames: true (broader injection)
        'content_script_run_at': 0,              # 0=none, 1=start, 2=end, 3=idle
        
        # NEW: DeclarativeNetRequest rules analysis (Listing 5 - HH)
        'has_dnr_rules_file': False,             # Has declarative_net_request rule resources
        'has_redirect_rules': False,             # Rules contain "redirect" action type
        'dnr_rule_count': 0,                     # Number of DNR rules defined
        
        # NEW: Optional host permissions (MV3)
        'has_optional_host_permissions': False,
        'optional_permissions_count': 0,
    }
    
    # Initialize all sensitive permission flags to False
    for perm in settings.SENSITIVE_PERMISSIONS:
        features[f'has_{perm}_permission'] = False
        
    if not manifest_path.exists():
        print(f"Warning: manifest.json not found in {ext_dir}")
        return features

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            
        features['manifest_version'] = manifest.get('manifest_version', 0)
        
        # =====================================================================
        # PERMISSIONS ANALYSIS
        # =====================================================================
        permissions = manifest.get('permissions', [])
        if isinstance(permissions, list):
            features['permissions_count'] = len(permissions)
            for perm in permissions:
                if perm in settings.SENSITIVE_PERMISSIONS:
                    features[f'has_{perm}_permission'] = True
                    features['sensitive_permissions_count'] += 1
                    
        # Optional permissions
        opt_permissions = manifest.get('optional_permissions', [])
        if isinstance(opt_permissions, list):
            features['optional_permissions_count'] = len(opt_permissions)
            for perm in opt_permissions:
                if perm in settings.SENSITIVE_PERMISSIONS:
                    features[f'has_{perm}_permission'] = True
                    features['sensitive_permissions_count'] += 1
                    
        # Optional host permissions (MV3)
        opt_host_perms = manifest.get('optional_host_permissions', [])
        if isinstance(opt_host_perms, list) and len(opt_host_perms) > 0:
            features['has_optional_host_permissions'] = True
                    
        # =====================================================================
        # HOST PERMISSIONS
        # =====================================================================
        host_perms = manifest.get('host_permissions', [])
        if isinstance(host_perms, list) and len(host_perms) > 0:
            features['has_host_permissions'] = True
            features['host_permissions_count'] = len(host_perms)
            
        # =====================================================================
        # CONTENT SCRIPTS ANALYSIS (Listings 2, 3, 4 - UProf, LF, CE)
        # =====================================================================
        content_scripts = manifest.get('content_scripts', [])
        if isinstance(content_scripts, list) and len(content_scripts) > 0:
            features['has_content_scripts'] = True
            features['content_script_count'] = len(content_scripts)
            
            # Analyze match patterns
            highest_scope = 0
            for script in content_scripts:
                matches = script.get('matches', [])
                if isinstance(matches, list):
                    for match in matches:
                        # Detect file:// pattern (Listing 3 - LF indicator)
                        if match.startswith('file://'):
                            features['has_file_match_pattern'] = True
                            
                        if match == '<all_urls>':
                            highest_scope = max(highest_scope, 3)
                            features['has_holistic_match_pattern'] = True
                        elif match in settings.HOLISTIC_PATTERNS:
                            highest_scope = max(highest_scope, 3)
                            features['has_holistic_match_pattern'] = True
                        elif '*://*/*' in match or 'http://*/*' in match or 'https://*/*' in match:
                            highest_scope = max(highest_scope, 3)
                            features['has_holistic_match_pattern'] = True
                        elif '*' in match:
                            highest_scope = max(highest_scope, 2)
                        else:
                            highest_scope = max(highest_scope, 1)
                            
                # Detect all_frames (broader injection scope)
                if script.get('all_frames', False):
                    features['has_all_frames'] = True
                    
                # Detect run_at timing (map to integers for ML compatibility)
                run_at = script.get('run_at', 'document_idle')
                if run_at == 'document_start':
                    features['content_script_run_at'] = max(features['content_script_run_at'], 1)
                elif run_at == 'document_end':
                    features['content_script_run_at'] = max(features['content_script_run_at'], 2)
                elif run_at == 'document_idle':
                    features['content_script_run_at'] = max(features['content_script_run_at'], 3)
            
            features['match_pattern_scope'] = highest_scope

        # =====================================================================
        # BACKGROUND WORKER / PAGE
        # =====================================================================
        background = manifest.get('background', {})
        if isinstance(background, dict):
            if 'service_worker' in background:
                features['has_service_worker'] = True
            if 'page' in background or 'scripts' in background:
                features['has_background_page'] = True
                
        # =====================================================================
        # DECLARATIVE NET REQUEST RULES (Listing 5 - HH)
        # =====================================================================
        dnr = manifest.get('declarative_net_request', {})
        if isinstance(dnr, dict):
            rule_resources = dnr.get('rule_resources', [])
            if isinstance(rule_resources, list) and len(rule_resources) > 0:
                features['has_dnr_rules_file'] = True
                
                # Parse each rules file to check for redirect actions
                for resource in rule_resources:
                    rules_path = resource.get('path', '')
                    if rules_path:
                        full_rules_path = Path(ext_dir) / rules_path
                        if full_rules_path.exists():
                            try:
                                with open(full_rules_path, 'r', encoding='utf-8') as rf:
                                    rules = json.load(rf)
                                    if isinstance(rules, list):
                                        features['dnr_rule_count'] += len(rules)
                                        for rule in rules:
                                            action = rule.get('action', {})
                                            if isinstance(action, dict):
                                                if action.get('type') == 'redirect':
                                                    features['has_redirect_rules'] = True
                            except Exception:
                                pass
                                
        # =====================================================================
        # OTHER FEATURES
        # =====================================================================
        if 'web_accessible_resources' in manifest and len(manifest['web_accessible_resources']) > 0:
            features['has_web_accessible_resources'] = True
            
        if 'externally_connectable' in manifest:
            features['has_externally_connectable'] = True
            
        if 'content_security_policy' in manifest:
            features['has_csp_declaration'] = True
            
        if 'update_url' in manifest:
            features['has_update_url'] = True

    except json.JSONDecodeError:
        print(f"Error decoding JSON in {manifest_path}")
    except Exception as e:
        print(f"Error parsing manifest {manifest_path}: {e}")

    return features

if __name__ == "__main__":
    # Test script
    test_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')
    if os.path.exists(test_dir):
        for item in sorted(os.listdir(test_dir)):
            ext_path = os.path.join(test_dir, item)
            if os.path.isdir(ext_path):
                print(f"\n{'='*60}")
                print(f"Analyzing manifest: {item}")
                print(f"{'='*60}")
                feats = parse_manifest(ext_path)
                for k, v in feats.items():
                    if v and v != 0 and v != 'none':
                        print(f"  {k}: {v}")
