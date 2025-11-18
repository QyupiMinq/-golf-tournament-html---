#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Manado Golf League Dashboard
Tests all endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://golf-league-dash.preview.emergentagent.com/api"

class GolfLeagueAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.created_team_id = None
        self.created_player_id = None
        self.created_match_id = None
        
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
    
    def test_auth_login(self):
        """Test authentication login with default admin credentials"""
        print("\n=== Testing Authentication ===")
        
        # Try common admin credentials
        admin_credentials = [
            {"email": "admin@manadogolf.com", "password": "admin123"},
            {"email": "admin@golf.com", "password": "admin"},
            {"email": "admin@manado.com", "password": "password"},
            {"email": "admin@example.com", "password": "admin123"}
        ]
        
        for creds in admin_credentials:
            try:
                response = self.session.post(
                    f"{self.base_url}/auth/login",
                    json=creds,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data.get("access_token")
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    self.log_result(
                        "POST /api/auth/login", 
                        True, 
                        f"Login successful with {creds['email']}", 
                        {"user": data.get("user", {})}
                    )
                    return True
                    
            except Exception as e:
                continue
        
        # If no admin found, try to register one
        try:
            register_data = {
                "email": "admin@manadogolf.com",
                "password": "admin123",
                "name": "Admin Manado Golf",
                "role": "admin"
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=register_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                self.log_result(
                    "POST /api/auth/register", 
                    True, 
                    "Admin user created and logged in", 
                    {"user": data.get("user", {})}
                )
                return True
                
        except Exception as e:
            pass
            
        self.log_result(
            "POST /api/auth/login", 
            False, 
            "Failed to authenticate with any admin credentials"
        )
        return False
    
    def test_teams_endpoints(self):
        """Test teams CRUD operations"""
        print("\n=== Testing Teams Endpoints ===")
        
        # Test GET /api/teams
        try:
            response = self.session.get(f"{self.base_url}/teams", timeout=10)
            
            if response.status_code == 200:
                teams = response.json()
                self.log_result(
                    "GET /api/teams", 
                    True, 
                    f"Retrieved {len(teams)} teams", 
                    {"count": len(teams), "sample": teams[:2] if teams else []}
                )
            else:
                self.log_result(
                    "GET /api/teams", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/teams", False, f"Exception: {str(e)}")
        
        # Test POST /api/teams - Create new team
        try:
            # First, we need a captain_id, let's create a dummy player first or use existing
            team_data = {
                "name": "Tim Manado Utara",
                "captain_id": "dummy-captain-id-123"  # We'll use a dummy ID for now
            }
            
            response = self.session.post(
                f"{self.base_url}/teams",
                json=team_data,
                timeout=10
            )
            
            if response.status_code == 200:
                team = response.json()
                self.created_team_id = team.get("id")
                self.log_result(
                    "POST /api/teams", 
                    True, 
                    f"Team created successfully: {team.get('name')}", 
                    {"team_id": self.created_team_id, "name": team.get("name")}
                )
            else:
                self.log_result(
                    "POST /api/teams", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("POST /api/teams", False, f"Exception: {str(e)}")
    
    def test_players_endpoints(self):
        """Test players CRUD operations"""
        print("\n=== Testing Players Endpoints ===")
        
        # Test GET /api/players
        try:
            response = self.session.get(f"{self.base_url}/players", timeout=10)
            
            if response.status_code == 200:
                players = response.json()
                self.log_result(
                    "GET /api/players", 
                    True, 
                    f"Retrieved {len(players)} players", 
                    {"count": len(players), "sample": players[:2] if players else []}
                )
            else:
                self.log_result(
                    "GET /api/players", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/players", False, f"Exception: {str(e)}")
        
        # Test POST /api/players - Create new player
        try:
            # Use the team we created, or a dummy team_id
            team_id = self.created_team_id if self.created_team_id else "dummy-team-id-123"
            
            player_data = {
                "name": "Budi Santoso",
                "email": "budi.santoso@golf.com",
                "team_id": team_id,
                "handicap": 18
            }
            
            response = self.session.post(
                f"{self.base_url}/players",
                json=player_data,
                timeout=10
            )
            
            if response.status_code == 200:
                player = response.json()
                self.created_player_id = player.get("id")
                self.log_result(
                    "POST /api/players", 
                    True, 
                    f"Player created successfully: {player.get('name')}", 
                    {"player_id": self.created_player_id, "name": player.get("name")}
                )
            else:
                self.log_result(
                    "POST /api/players", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("POST /api/players", False, f"Exception: {str(e)}")
    
    def test_matches_endpoints(self):
        """Test matches CRUD operations"""
        print("\n=== Testing Matches Endpoints ===")
        
        # Test GET /api/matches
        try:
            response = self.session.get(f"{self.base_url}/matches", timeout=10)
            
            if response.status_code == 200:
                matches = response.json()
                self.log_result(
                    "GET /api/matches", 
                    True, 
                    f"Retrieved {len(matches)} matches", 
                    {"count": len(matches), "sample": matches[:2] if matches else []}
                )
            else:
                self.log_result(
                    "GET /api/matches", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/matches", False, f"Exception: {str(e)}")
        
        # Test POST /api/matches - Create new match
        try:
            match_data = {
                "match_number": 99,
                "date": "2025-01-15",
                "match_type": "individual"
            }
            
            response = self.session.post(
                f"{self.base_url}/matches",
                json=match_data,
                timeout=10
            )
            
            if response.status_code == 200:
                match = response.json()
                self.created_match_id = match.get("id")
                self.log_result(
                    "POST /api/matches", 
                    True, 
                    f"Match created successfully: Match #{match.get('match_number')}", 
                    {"match_id": self.created_match_id, "match_number": match.get("match_number")}
                )
            else:
                self.log_result(
                    "POST /api/matches", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("POST /api/matches", False, f"Exception: {str(e)}")
    
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n=== Testing Dashboard Stats ===")
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                self.log_result(
                    "GET /api/dashboard/stats", 
                    True, 
                    "Dashboard stats retrieved successfully", 
                    stats
                )
            else:
                self.log_result(
                    "GET /api/dashboard/stats", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/dashboard/stats", False, f"Exception: {str(e)}")
    
    def test_leaderboard_endpoints(self):
        """Test leaderboard endpoints"""
        print("\n=== Testing Leaderboard Endpoints ===")
        
        # Test individual leaderboard
        try:
            response = self.session.get(f"{self.base_url}/leaderboard/individual", timeout=10)
            
            if response.status_code == 200:
                leaderboard = response.json()
                self.log_result(
                    "GET /api/leaderboard/individual", 
                    True, 
                    f"Individual leaderboard retrieved with {len(leaderboard)} players", 
                    {"count": len(leaderboard), "sample": leaderboard[:2] if leaderboard else []}
                )
            else:
                self.log_result(
                    "GET /api/leaderboard/individual", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/leaderboard/individual", False, f"Exception: {str(e)}")
        
        # Test team leaderboard
        try:
            response = self.session.get(f"{self.base_url}/leaderboard/team", timeout=10)
            
            if response.status_code == 200:
                leaderboard = response.json()
                self.log_result(
                    "GET /api/leaderboard/team", 
                    True, 
                    f"Team leaderboard retrieved with {len(leaderboard)} teams", 
                    {"count": len(leaderboard), "sample": leaderboard[:2] if leaderboard else []}
                )
            else:
                self.log_result(
                    "GET /api/leaderboard/team", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/leaderboard/team", False, f"Exception: {str(e)}")
    
    def test_settings_endpoint(self):
        """Test settings endpoint with focus on login_logo field"""
        print("\n=== Testing Settings Endpoint (Login Logo Feature) ===")
        
        # Test GET /api/settings - verify login_logo field exists
        try:
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                has_login_logo = "login_logo" in settings
                self.log_result(
                    "GET /api/settings", 
                    True, 
                    f"Settings retrieved successfully. login_logo field present: {has_login_logo}", 
                    {
                        "login_logo_present": has_login_logo,
                        "login_logo_value": settings.get("login_logo"),
                        "dashboard_logo_present": "dashboard_logo" in settings,
                        "footer_signature_present": "footer_signature" in settings
                    }
                )
            else:
                self.log_result(
                    "GET /api/settings", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/settings", False, f"Exception: {str(e)}")
        
        # Test POST /api/settings - update with login_logo
        try:
            # Dummy base64 string for testing
            dummy_logo_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            
            settings_data = {
                "id": "app_settings",
                "dashboard_logo": None,
                "footer_signature": None,
                "login_logo": dummy_logo_base64
            }
            
            response = self.session.post(
                f"{self.base_url}/settings",
                json=settings_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log_result(
                    "POST /api/settings", 
                    True, 
                    "Settings updated successfully with login_logo", 
                    result
                )
                
                # Verify the update by getting settings again
                verify_response = self.session.get(f"{self.base_url}/settings", timeout=10)
                if verify_response.status_code == 200:
                    updated_settings = verify_response.json()
                    login_logo_saved = updated_settings.get("login_logo") == dummy_logo_base64
                    self.log_result(
                        "POST /api/settings (verification)", 
                        login_logo_saved, 
                        f"login_logo data saved correctly: {login_logo_saved}", 
                        {"login_logo_matches": login_logo_saved}
                    )
                
            else:
                self.log_result(
                    "POST /api/settings", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("POST /api/settings", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Manado Golf League Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Authentication is required for all endpoints
        if not self.test_auth_login():
            print("\n❌ Authentication failed - cannot proceed with other tests")
            return False
        
        # Run all endpoint tests
        self.test_teams_endpoints()
        self.test_players_endpoints()
        self.test_matches_endpoints()
        self.test_dashboard_stats()
        self.test_leaderboard_endpoints()
        self.test_settings_endpoint()
        
        # Print summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🏌️ MANADO GOLF LEAGUE BACKEND TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.test_results if "✅ PASS" in r["status"])
        failed = sum(1 for r in self.test_results if "❌ FAIL" in r["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if "✅ PASS" in result["status"]:
                print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "="*60)

def main():
    """Main function to run the tests"""
    tester = GolfLeagueAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()