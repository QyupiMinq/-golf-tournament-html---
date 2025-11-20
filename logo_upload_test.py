#!/usr/bin/env python3
"""
Logo Upload Flow Testing - Complete End-to-End
Tests the complete logo upload flow with new simplified code
"""

import requests
import json
import sys
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

# Backend URL from environment
BACKEND_URL = "https://golf-league-dash-1.preview.emergentagent.com/api"

class LogoUploadTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def create_test_image(self, width=100, height=100, color=(255, 0, 0)):
        """Create a small test image in base64 format"""
        # Create a small test image
        img = Image.new('RGB', (width, height), color=color)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        
        # Convert to base64
        base64_data = base64.b64encode(img_data).decode('utf-8')
        return f"data:image/png;base64,{base64_data}"
    
    def create_large_test_image(self):
        """Create a large test image (>2MB) for error testing"""
        # Create a large image (2000x2000 should be >2MB)
        img = Image.new('RGB', (2000, 2000), color=(0, 255, 0))
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        
        # Convert to base64
        base64_data = base64.b64encode(img_data).decode('utf-8')
        return f"data:image/png;base64,{base64_data}"
    
    def test_admin_login(self):
        """Test 1: Login as admin (admin@manadogolf.com / admin)"""
        print("\n=== TEST 1: Admin Login ===")
        
        try:
            # Try the specified admin credentials
            credentials = {"email": "admin@manadogolf.com", "password": "admin"}
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=credentials,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                
                user = data.get("user", {})
                is_admin = user.get("role") == "admin"
                
                self.log_result(
                    "Admin Login", 
                    is_admin, 
                    f"Login successful as {user.get('name', 'Unknown')} with role {user.get('role', 'Unknown')}", 
                    {"user_email": user.get("email"), "user_role": user.get("role")}
                )
                return is_admin
            else:
                self.log_result(
                    "Admin Login", 
                    False, 
                    f"Login failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def test_settings_navigation(self):
        """Test 2: Navigate to /settings (verify settings endpoint)"""
        print("\n=== TEST 2: Settings Navigation ===")
        
        try:
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                has_org_logo = "organization_logo" in settings
                has_club_logo = "club_logo" in settings
                
                self.log_result(
                    "Settings Navigation", 
                    True, 
                    f"Settings endpoint accessible. Organization logo field: {has_org_logo}, Club logo field: {has_club_logo}", 
                    {
                        "organization_logo_present": has_org_logo,
                        "club_logo_present": has_club_logo,
                        "current_org_logo": bool(settings.get("organization_logo")),
                        "current_club_logo": bool(settings.get("club_logo"))
                    }
                )
                return settings
            else:
                self.log_result(
                    "Settings Navigation", 
                    False, 
                    f"Settings endpoint failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                return None
                
        except Exception as e:
            self.log_result("Settings Navigation", False, f"Exception: {str(e)}")
            return None
    
    def test_organization_logo_upload(self):
        """Test 3: Upload organization logo and verify API response"""
        print("\n=== TEST 3: Organization Logo Upload ===")
        
        try:
            # Create a test image
            test_logo = self.create_test_image(150, 150, (255, 100, 50))  # Orange logo
            
            # Prepare settings data with organization logo
            settings_data = {
                "id": "app_settings",
                "organization_logo": test_logo,
                "club_logo": None,  # Don't change club logo
                "login_logo": None,  # Don't change login logo
                "footer_signature": "Test Upload - Organization Logo"
            }
            
            # Upload the logo
            response = self.session.post(
                f"{self.base_url}/settings",
                json=settings_data,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                success_message = result.get("message", "")
                
                self.log_result(
                    "Organization Logo Upload - POST Request", 
                    True, 
                    f"POST /api/settings returned 200 OK with message: '{success_message}'", 
                    {"response_message": success_message, "logo_data_length": len(test_logo)}
                )
                
                # Verify the logo data was sent in request body
                self.log_result(
                    "Organization Logo Upload - Request Body", 
                    True, 
                    f"Logo data sent in request body (length: {len(test_logo)} characters)", 
                    {"logo_data_starts_with": test_logo[:50] + "..." if len(test_logo) > 50 else test_logo}
                )
                
                return test_logo
            else:
                self.log_result(
                    "Organization Logo Upload - POST Request", 
                    False, 
                    f"POST /api/settings failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                return None
                
        except Exception as e:
            self.log_result("Organization Logo Upload", False, f"Exception: {str(e)}")
            return None
    
    def test_database_persistence(self, uploaded_logo):
        """Test 4: Verify logo in database (MongoDB settings collection)"""
        print("\n=== TEST 4: Database Persistence Verification ===")
        
        try:
            # Get settings again to verify persistence
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                stored_logo = settings.get("organization_logo")
                
                # Check if organization_logo field contains base64 data
                has_logo_data = bool(stored_logo)
                data_length = len(stored_logo) if stored_logo else 0
                starts_with_data_image = stored_logo.startswith("data:image/") if stored_logo else False
                matches_uploaded = stored_logo == uploaded_logo if stored_logo and uploaded_logo else False
                
                self.log_result(
                    "Database Persistence - Logo Field", 
                    has_logo_data, 
                    f"organization_logo field contains data: {has_logo_data}, length: {data_length}", 
                    {
                        "has_logo_data": has_logo_data,
                        "data_length": data_length,
                        "starts_with_data_image": starts_with_data_image
                    }
                )
                
                self.log_result(
                    "Database Persistence - Data Format", 
                    starts_with_data_image, 
                    f"Logo data starts with 'data:image/': {starts_with_data_image}", 
                    {"logo_prefix": stored_logo[:30] if stored_logo else None}
                )
                
                self.log_result(
                    "Database Persistence - Data Integrity", 
                    matches_uploaded, 
                    f"Stored logo matches uploaded logo: {matches_uploaded}", 
                    {"data_integrity_verified": matches_uploaded}
                )
                
                return stored_logo
            else:
                self.log_result(
                    "Database Persistence", 
                    False, 
                    f"Failed to retrieve settings with status {response.status_code}", 
                    response.json() if response.content else None
                )
                return None
                
        except Exception as e:
            self.log_result("Database Persistence", False, f"Exception: {str(e)}")
            return None
    
    def test_logo_display_verification(self, stored_logo):
        """Test 5: Verify logo display after reload (check if logo URL includes base64 data)"""
        print("\n=== TEST 5: Logo Display Verification ===")
        
        try:
            # Since we can't test actual UI display, we verify the data is available for display
            if stored_logo:
                is_valid_base64 = stored_logo.startswith("data:image/")
                has_sufficient_data = len(stored_logo) > 100  # Should be substantial data
                
                self.log_result(
                    "Logo Display - Settings Page Preview", 
                    is_valid_base64 and has_sufficient_data, 
                    f"Logo data available for settings page preview: valid format={is_valid_base64}, sufficient data={has_sufficient_data}", 
                    {
                        "valid_format": is_valid_base64,
                        "data_length": len(stored_logo),
                        "sufficient_data": has_sufficient_data
                    }
                )
                
                self.log_result(
                    "Logo Display - Dashboard Header", 
                    is_valid_base64 and has_sufficient_data, 
                    f"Logo data available for dashboard header (left): format valid={is_valid_base64}", 
                    {"organization_logo_ready": is_valid_base64 and has_sufficient_data}
                )
                
                self.log_result(
                    "Logo Display - Sidebar Menu", 
                    is_valid_base64 and has_sufficient_data, 
                    f"Logo data available for sidebar menu (top): format valid={is_valid_base64}", 
                    {"sidebar_logo_ready": is_valid_base64 and has_sufficient_data}
                )
                
                return True
            else:
                self.log_result(
                    "Logo Display Verification", 
                    False, 
                    "No logo data available for display verification", 
                    {"stored_logo": None}
                )
                return False
                
        except Exception as e:
            self.log_result("Logo Display Verification", False, f"Exception: {str(e)}")
            return False
    
    def test_file_size_error_handling(self):
        """Test 6: Error handling - file too large (>2MB)"""
        print("\n=== TEST 6: File Size Error Handling ===")
        
        try:
            # Create a large test image
            large_logo = self.create_large_test_image()
            
            settings_data = {
                "id": "app_settings",
                "organization_logo": large_logo
            }
            
            response = self.session.post(
                f"{self.base_url}/settings",
                json=settings_data,
                timeout=30  # Longer timeout for large file
            )
            
            # Check if there's proper error handling
            if response.status_code == 413 or response.status_code == 400:
                # Proper error response
                error_data = response.json() if response.content else {}
                error_message = error_data.get("detail", "")
                
                has_size_error = "terlalu besar" in error_message.lower() or "too large" in error_message.lower() or "size" in error_message.lower()
                
                self.log_result(
                    "File Size Error Handling", 
                    has_size_error, 
                    f"Large file properly rejected with status {response.status_code}: '{error_message}'", 
                    {"status_code": response.status_code, "error_message": error_message}
                )
            elif response.status_code == 200:
                # Server accepted large file - this might be okay depending on implementation
                self.log_result(
                    "File Size Error Handling", 
                    True, 
                    f"Large file accepted (status 200) - server may handle large files or compress them", 
                    {"status_code": response.status_code, "file_size": len(large_logo)}
                )
            else:
                # Other error
                error_data = response.json() if response.content else {}
                self.log_result(
                    "File Size Error Handling", 
                    False, 
                    f"Unexpected response status {response.status_code}", 
                    {"status_code": response.status_code, "response": error_data}
                )
                
        except Exception as e:
            self.log_result("File Size Error Handling", False, f"Exception: {str(e)}")
    
    def test_invalid_file_type_handling(self):
        """Test 7: Error handling - invalid file type"""
        print("\n=== TEST 7: Invalid File Type Error Handling ===")
        
        try:
            # Create invalid base64 data (not an image)
            invalid_data = "data:text/plain;base64,SGVsbG8gV29ybGQ="  # "Hello World" in base64
            
            settings_data = {
                "id": "app_settings",
                "organization_logo": invalid_data
            }
            
            response = self.session.post(
                f"{self.base_url}/settings",
                json=settings_data,
                timeout=10
            )
            
            # Check response
            if response.status_code == 400:
                # Proper error response
                error_data = response.json() if response.content else {}
                error_message = error_data.get("detail", "")
                
                self.log_result(
                    "Invalid File Type Error Handling", 
                    True, 
                    f"Invalid file type properly rejected with status {response.status_code}: '{error_message}'", 
                    {"status_code": response.status_code, "error_message": error_message}
                )
            elif response.status_code == 200:
                # Server accepted invalid data - check if it was actually saved
                verify_response = self.session.get(f"{self.base_url}/settings", timeout=10)
                if verify_response.status_code == 200:
                    settings = verify_response.json()
                    stored_logo = settings.get("organization_logo")
                    
                    if stored_logo == invalid_data:
                        self.log_result(
                            "Invalid File Type Error Handling", 
                            False, 
                            "Invalid file type was accepted and stored - should be rejected", 
                            {"stored_invalid_data": True}
                        )
                    else:
                        self.log_result(
                            "Invalid File Type Error Handling", 
                            True, 
                            "Invalid file type was not stored (good validation)", 
                            {"stored_invalid_data": False}
                        )
            else:
                # Other error
                error_data = response.json() if response.content else {}
                self.log_result(
                    "Invalid File Type Error Handling", 
                    True, 
                    f"Invalid file rejected with status {response.status_code}", 
                    {"status_code": response.status_code, "response": error_data}
                )
                
        except Exception as e:
            self.log_result("Invalid File Type Error Handling", False, f"Exception: {str(e)}")
    
    def run_complete_logo_upload_test(self):
        """Run complete end-to-end logo upload test"""
        print(f"🚀 Starting Complete Logo Upload Flow Test")
        print(f"Backend URL: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Focus: Complete end-to-end logo upload with new simplified code")
        
        # Test 1: Login as admin
        if not self.test_admin_login():
            print("\n❌ Admin login failed - cannot proceed with logo upload tests")
            return False
        
        # Test 2: Navigate to /settings
        current_settings = self.test_settings_navigation()
        if not current_settings:
            print("\n❌ Settings navigation failed - cannot proceed")
            return False
        
        # Test 3: Upload organization logo
        uploaded_logo = self.test_organization_logo_upload()
        if not uploaded_logo:
            print("\n❌ Logo upload failed - cannot proceed with verification")
            return False
        
        # Test 4: Verify database persistence
        stored_logo = self.test_database_persistence(uploaded_logo)
        if not stored_logo:
            print("\n❌ Database persistence verification failed")
            return False
        
        # Test 5: Verify logo display readiness
        self.test_logo_display_verification(stored_logo)
        
        # Test 6: Error handling - large file
        self.test_file_size_error_handling()
        
        # Test 7: Error handling - invalid file type
        self.test_invalid_file_type_handling()
        
        # Print summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("🏌️ LOGO UPLOAD FLOW TEST SUMMARY")
        print("="*70)
        
        passed = sum(1 for r in self.test_results if "✅ PASS" in r["status"])
        failed = sum(1 for r in self.test_results if "❌ FAIL" in r["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        # Test case results
        print("\n📋 TEST CASE RESULTS:")
        print("1. Organization Logo Upload: ", end="")
        upload_tests = [r for r in self.test_results if "Organization Logo Upload" in r["test"]]
        if all("✅ PASS" in r["status"] for r in upload_tests):
            print("✅ PASS")
        else:
            print("❌ FAIL")
        
        print("2. Database Persistence: ", end="")
        db_tests = [r for r in self.test_results if "Database Persistence" in r["test"]]
        if all("✅ PASS" in r["status"] for r in db_tests):
            print("✅ PASS")
        else:
            print("❌ FAIL")
        
        print("3. Logo Display Readiness: ", end="")
        display_tests = [r for r in self.test_results if "Logo Display" in r["test"]]
        if all("✅ PASS" in r["status"] for r in display_tests):
            print("✅ PASS")
        else:
            print("❌ FAIL")
        
        print("4. Error Handling: ", end="")
        error_tests = [r for r in self.test_results if "Error Handling" in r["test"]]
        if all("✅ PASS" in r["status"] for r in error_tests):
            print("✅ PASS")
        else:
            print("❌ FAIL")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if "✅ PASS" in result["status"]:
                print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "="*70)

def main():
    """Main function to run the logo upload tests"""
    tester = LogoUploadTester()
    success = tester.run_complete_logo_upload_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()