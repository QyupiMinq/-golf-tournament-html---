#!/usr/bin/env python3
"""
Final Logo Upload Test - Clean and Comprehensive
"""

import requests
import json
import sys
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

BACKEND_URL = "https://manado-dashboard.preview.emergentagent.com/api"

class FinalLogoTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message):
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({"test": test_name, "status": status, "message": message})
        print(f"{status}: {test_name} - {message}")
    
    def create_test_image(self, width=100, height=100, color=(255, 0, 0)):
        """Create a small test image in base64 format"""
        img = Image.new('RGB', (width, height), color=color)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        base64_data = base64.b64encode(img_data).decode('utf-8')
        return f"data:image/png;base64,{base64_data}"
    
    def login_admin(self):
        """Login as admin"""
        try:
            credentials = {"email": "admin@manadogolf.com", "password": "admin"}
            response = self.session.post(f"{self.base_url}/auth/login", json=credentials, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                return True
            return False
        except:
            return False
    
    def clean_settings(self):
        """Clean up any invalid data from previous tests"""
        try:
            clean_data = {
                "id": "app_settings",
                "organization_logo": None,
                "club_logo": None,
                "login_logo": None,
                "dashboard_logo": None,
                "footer_signature": "Manado Golf League 2025"
            }
            response = self.session.post(f"{self.base_url}/settings", json=clean_data, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def test_complete_flow(self):
        """Test complete logo upload flow"""
        print("🚀 Final Logo Upload Flow Test")
        print("="*50)
        
        # Step 1: Login
        if not self.login_admin():
            self.log_result("Admin Login", False, "Failed to login as admin")
            return False
        self.log_result("Admin Login", True, "Successfully logged in as admin@manadogolf.com")
        
        # Step 2: Clean settings
        if not self.clean_settings():
            self.log_result("Settings Cleanup", False, "Failed to clean settings")
            return False
        self.log_result("Settings Cleanup", True, "Settings cleaned successfully")
        
        # Step 3: Create test logo
        test_logo = self.create_test_image(120, 120, (0, 150, 255))  # Blue logo
        self.log_result("Test Image Creation", True, f"Created test logo ({len(test_logo)} characters)")
        
        # Step 4: Upload organization logo
        try:
            upload_data = {
                "id": "app_settings",
                "organization_logo": test_logo,
                "footer_signature": "Test Upload Complete"
            }
            
            response = self.session.post(f"{self.base_url}/settings", json=upload_data, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                success_msg = result.get("message", "")
                self.log_result("Logo Upload - POST /api/settings", True, f"Status 200 OK: '{success_msg}'")
            else:
                self.log_result("Logo Upload - POST /api/settings", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Logo Upload - POST /api/settings", False, f"Exception: {str(e)}")
            return False
        
        # Step 5: Verify database persistence
        try:
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                stored_logo = settings.get("organization_logo")
                
                # Verify logo data
                has_data = bool(stored_logo)
                correct_format = stored_logo.startswith("data:image/png;base64,") if stored_logo else False
                data_matches = stored_logo == test_logo if stored_logo else False
                
                self.log_result("Database Persistence - Data Present", has_data, f"organization_logo field contains data: {has_data}")
                self.log_result("Database Persistence - Correct Format", correct_format, f"Data starts with 'data:image/png;base64,': {correct_format}")
                self.log_result("Database Persistence - Data Integrity", data_matches, f"Stored data matches uploaded data: {data_matches}")
                
                if not (has_data and correct_format and data_matches):
                    return False
                    
            else:
                self.log_result("Database Verification", False, f"Failed to retrieve settings: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Database Verification", False, f"Exception: {str(e)}")
            return False
        
        # Step 6: Verify page reload simulation (settings retrieval)
        try:
            # Simulate page reload by making a fresh request
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                logo_after_reload = settings.get("organization_logo")
                
                logo_persists = bool(logo_after_reload)
                logo_unchanged = logo_after_reload == test_logo if logo_after_reload else False
                
                self.log_result("Page Reload Simulation - Logo Persists", logo_persists, f"Logo data persists after reload: {logo_persists}")
                self.log_result("Page Reload Simulation - Data Unchanged", logo_unchanged, f"Logo data unchanged after reload: {logo_unchanged}")
                
                if not (logo_persists and logo_unchanged):
                    return False
                    
            else:
                self.log_result("Page Reload Simulation", False, f"Failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Page Reload Simulation", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🏌️ FINAL LOGO UPLOAD TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.test_results if "✅ PASS" in r["status"])
        failed = sum(1 for r in self.test_results if "❌ FAIL" in r["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"  {result['status']}: {result['test']} - {result['message']}")
        
        print("\n" + "="*60)
        
        if failed == 0:
            print("🎉 ALL TESTS PASSED - Logo upload flow is working perfectly!")
        else:
            print("⚠️  Some tests failed - see details above")

def main():
    tester = FinalLogoTester()
    success = tester.test_complete_flow()
    tester.print_summary()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()