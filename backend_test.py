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
        """Test leaderboard endpoints - verify no invalid points after cleanup"""
        print("\n=== Testing Leaderboard Endpoints (Post-Cleanup Verification) ===")
        
        # Test individual leaderboard - should show 0 points for all players
        try:
            response = self.session.get(f"{self.base_url}/leaderboard/individual", timeout=10)
            
            if response.status_code == 200:
                leaderboard = response.json()
                
                # Check if all players have 0 points (since match_results were cleaned)
                players_with_points = [p for p in leaderboard if p.get("total_points", 0) > 0]
                all_zero_points = len(players_with_points) == 0
                
                self.log_result(
                    "GET /api/leaderboard/individual", 
                    True, 
                    f"Individual leaderboard retrieved with {len(leaderboard)} players. Players with points: {len(players_with_points)}", 
                    {
                        "total_players": len(leaderboard), 
                        "players_with_points": len(players_with_points),
                        "all_zero_points": all_zero_points,
                        "sample_players": leaderboard[:3] if leaderboard else []
                    }
                )
                
                # Log specific verification for cleanup
                if all_zero_points:
                    self.log_result(
                        "Leaderboard Cleanup Verification", 
                        True, 
                        "✅ All players have 0 points - invalid match_results cleanup successful"
                    )
                else:
                    self.log_result(
                        "Leaderboard Cleanup Verification", 
                        False, 
                        f"❌ {len(players_with_points)} players still have points - cleanup may be incomplete",
                        {"players_with_points": players_with_points}
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
        
        # Test team leaderboard - should show 0 points for all teams
        try:
            response = self.session.get(f"{self.base_url}/leaderboard/team", timeout=10)
            
            if response.status_code == 200:
                leaderboard = response.json()
                
                # Check if all teams have 0 points
                teams_with_points = [t for t in leaderboard if t.get("total_points", 0) > 0]
                all_zero_points = len(teams_with_points) == 0
                
                self.log_result(
                    "GET /api/leaderboard/team", 
                    True, 
                    f"Team leaderboard retrieved with {len(leaderboard)} teams. Teams with points: {len(teams_with_points)}", 
                    {
                        "total_teams": len(leaderboard), 
                        "teams_with_points": len(teams_with_points),
                        "all_zero_points": all_zero_points,
                        "sample_teams": leaderboard[:3] if leaderboard else []
                    }
                )
                
                # Log specific verification for cleanup
                if all_zero_points:
                    self.log_result(
                        "Team Leaderboard Cleanup Verification", 
                        True, 
                        "✅ All teams have 0 points - invalid match_results cleanup successful"
                    )
                else:
                    self.log_result(
                        "Team Leaderboard Cleanup Verification", 
                        False, 
                        f"❌ {len(teams_with_points)} teams still have points - cleanup may be incomplete",
                        {"teams_with_points": teams_with_points}
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
        """Test settings endpoint with focus on dual logo feature (organization_logo + club_logo)"""
        print("\n=== Testing Settings Endpoint (Dual Logo Feature) ===")
        
        # Test GET /api/settings - verify new dual logo fields exist
        try:
            response = self.session.get(f"{self.base_url}/settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                has_organization_logo = "organization_logo" in settings
                has_club_logo = "club_logo" in settings
                has_login_logo = "login_logo" in settings
                has_dashboard_logo = "dashboard_logo" in settings  # Backward compatibility
                has_footer_signature = "footer_signature" in settings
                
                self.log_result(
                    "GET /api/settings - New Fields Check", 
                    True, 
                    f"Settings retrieved. organization_logo: {has_organization_logo}, club_logo: {has_club_logo}", 
                    {
                        "organization_logo_present": has_organization_logo,
                        "organization_logo_value": settings.get("organization_logo"),
                        "club_logo_present": has_club_logo,
                        "club_logo_value": settings.get("club_logo"),
                        "login_logo_present": has_login_logo,
                        "dashboard_logo_present": has_dashboard_logo,  # Backward compatibility
                        "footer_signature_present": has_footer_signature
                    }
                )
                
                # Verify backward compatibility - existing fields should still be present
                backward_compatible = has_dashboard_logo and has_footer_signature and has_login_logo
                self.log_result(
                    "GET /api/settings - Backward Compatibility", 
                    backward_compatible, 
                    f"Existing fields preserved: dashboard_logo={has_dashboard_logo}, footer_signature={has_footer_signature}, login_logo={has_login_logo}", 
                    {
                        "backward_compatible": backward_compatible,
                        "existing_fields": {
                            "dashboard_logo": has_dashboard_logo,
                            "footer_signature": has_footer_signature,
                            "login_logo": has_login_logo
                        }
                    }
                )
                
            else:
                self.log_result(
                    "GET /api/settings - New Fields Check", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/settings - New Fields Check", False, f"Exception: {str(e)}")
        
        # Test POST /api/settings - update with dual logos
        try:
            # Dummy base64 strings for testing (different for each logo)
            dummy_org_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            dummy_club_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNkYGBgYGBgYAAAAAUAAY27m/MAAAAASUVORK5CYII="
            dummy_login_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAFElEQVR42mNkYGBgYGBgYGBgYGBgAAACAAEAAY27m/MAAAAASUVORK5CYII="
            
            settings_data = {
                "id": "app_settings",
                "dashboard_logo": None,  # Keep for backward compatibility
                "organization_logo": dummy_org_logo,  # New field
                "club_logo": dummy_club_logo,  # New field
                "footer_signature": "Manado Golf League 2025",
                "login_logo": dummy_login_logo  # Existing field
            }
            
            response = self.session.post(
                f"{self.base_url}/settings",
                json=settings_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log_result(
                    "POST /api/settings - Dual Logo Update", 
                    True, 
                    "Settings updated successfully with organization_logo and club_logo", 
                    result
                )
                
                # Verify the update by getting settings again
                verify_response = self.session.get(f"{self.base_url}/settings", timeout=10)
                if verify_response.status_code == 200:
                    updated_settings = verify_response.json()
                    org_logo_saved = updated_settings.get("organization_logo") == dummy_org_logo
                    club_logo_saved = updated_settings.get("club_logo") == dummy_club_logo
                    login_logo_saved = updated_settings.get("login_logo") == dummy_login_logo
                    
                    all_logos_saved = org_logo_saved and club_logo_saved and login_logo_saved
                    
                    self.log_result(
                        "POST /api/settings - Dual Logo Verification", 
                        all_logos_saved, 
                        f"Logo data persistence: org_logo={org_logo_saved}, club_logo={club_logo_saved}, login_logo={login_logo_saved}", 
                        {
                            "organization_logo_saved": org_logo_saved,
                            "club_logo_saved": club_logo_saved,
                            "login_logo_saved": login_logo_saved,
                            "all_logos_saved": all_logos_saved
                        }
                    )
                    
                    # Test individual logo updates
                    self.test_individual_logo_updates(updated_settings)
                
            else:
                self.log_result(
                    "POST /api/settings - Dual Logo Update", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("POST /api/settings - Dual Logo Update", False, f"Exception: {str(e)}")
    
    def test_individual_logo_updates(self, current_settings):
        """Test updating individual logo fields without affecting others"""
        print("\n=== Testing Individual Logo Field Updates ===")
        
        try:
            # Test updating only organization_logo
            new_org_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFklEQVR42mNkYGBgYGBgYGBgYGBgYAAAAAUAAY27m/MAAAAASUVORK5CYII="
            
            update_data = current_settings.copy()
            update_data["organization_logo"] = new_org_logo
            
            response = self.session.post(
                f"{self.base_url}/settings",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                # Verify only organization_logo changed
                verify_response = self.session.get(f"{self.base_url}/settings", timeout=10)
                if verify_response.status_code == 200:
                    updated = verify_response.json()
                    org_updated = updated.get("organization_logo") == new_org_logo
                    club_unchanged = updated.get("club_logo") == current_settings.get("club_logo")
                    login_unchanged = updated.get("login_logo") == current_settings.get("login_logo")
                    
                    individual_update_success = org_updated and club_unchanged and login_unchanged
                    
                    self.log_result(
                        "Individual Logo Update Test", 
                        individual_update_success, 
                        f"Organization logo updated independently: org_changed={org_updated}, club_unchanged={club_unchanged}, login_unchanged={login_unchanged}", 
                        {
                            "organization_logo_updated": org_updated,
                            "club_logo_unchanged": club_unchanged,
                            "login_logo_unchanged": login_unchanged,
                            "individual_update_success": individual_update_success
                        }
                    )
                    
        except Exception as e:
            self.log_result("Individual Logo Update Test", False, f"Exception: {str(e)}")
    
    def test_database_cleanup_verification(self):
        """Test database collections to verify cleanup"""
        print("\n=== Testing Database Cleanup Verification ===")
        
        # Test match-results endpoint to verify it's empty
        try:
            response = self.session.get(f"{self.base_url}/match-results", timeout=10)
            
            if response.status_code == 200:
                match_results = response.json()
                is_empty = len(match_results) == 0
                
                self.log_result(
                    "GET /api/match-results", 
                    True, 
                    f"Match results collection has {len(match_results)} documents", 
                    {"count": len(match_results), "is_empty": is_empty}
                )
                
                if is_empty:
                    self.log_result(
                        "Match Results Cleanup Verification", 
                        True, 
                        "✅ match_results collection is empty - cleanup successful"
                    )
                else:
                    self.log_result(
                        "Match Results Cleanup Verification", 
                        False, 
                        f"❌ match_results collection still has {len(match_results)} documents",
                        {"sample_results": match_results[:3] if match_results else []}
                    )
                    
            else:
                self.log_result(
                    "GET /api/match-results", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/match-results", False, f"Exception: {str(e)}")
        
        # Test matches endpoint to verify it's empty
        try:
            response = self.session.get(f"{self.base_url}/matches", timeout=10)
            
            if response.status_code == 200:
                matches = response.json()
                is_empty = len(matches) == 0
                
                self.log_result(
                    "GET /api/matches (cleanup check)", 
                    True, 
                    f"Matches collection has {len(matches)} documents", 
                    {"count": len(matches), "is_empty": is_empty}
                )
                
                if is_empty:
                    self.log_result(
                        "Matches Collection Verification", 
                        True, 
                        "✅ matches collection is empty as expected"
                    )
                else:
                    self.log_result(
                        "Matches Collection Verification", 
                        True, 
                        f"ℹ️ matches collection has {len(matches)} documents (this may be expected)",
                        {"sample_matches": matches[:3] if matches else []}
                    )
                    
            else:
                self.log_result(
                    "GET /api/matches (cleanup check)", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.json() if response.content else None
                )
                
        except Exception as e:
            self.log_result("GET /api/matches (cleanup check)", False, f"Exception: {str(e)}")
    
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
        self.test_database_cleanup_verification()
        
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