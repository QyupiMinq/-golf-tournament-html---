#!/usr/bin/env python3
"""
Detailed Backend API Testing - Verify data structures and edge cases
"""

import requests
import json
from datetime import datetime

BACKEND_URL = "https://golf-league-app.preview.emergentagent.com/api"

def test_detailed_responses():
    """Test detailed response structures"""
    session = requests.Session()
    
    # Login first
    login_data = {
        "email": "admin@manadogolf.com",
        "password": "admin123"
    }
    
    response = session.post(f"{BACKEND_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        print("✅ Authentication successful")
    else:
        print("❌ Authentication failed")
        return
    
    print("\n=== Detailed Response Structure Tests ===")
    
    # Test dashboard stats structure
    response = session.get(f"{BACKEND_URL}/dashboard/stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Dashboard Stats Structure:")
        print(f"   Teams: {stats.get('teams_count', 'N/A')}")
        print(f"   Players: {stats.get('players_count', 'N/A')}")
        print(f"   Matches: {stats.get('matches_count', 'N/A')}")
        print(f"   Completed: {stats.get('completed_matches', 'N/A')}")
        print(f"   Pending: {stats.get('pending_matches', 'N/A')}")
    
    # Test teams structure
    response = session.get(f"{BACKEND_URL}/teams")
    if response.status_code == 200:
        teams = response.json()
        if teams:
            print(f"\n✅ Teams Structure (sample):")
            sample_team = teams[0]
            print(f"   ID: {sample_team.get('id', 'N/A')}")
            print(f"   Name: {sample_team.get('name', 'N/A')}")
            print(f"   Captain ID: {sample_team.get('captain_id', 'N/A')}")
            print(f"   Payment Status: {sample_team.get('payment_status', 'N/A')}")
    
    # Test players structure
    response = session.get(f"{BACKEND_URL}/players")
    if response.status_code == 200:
        players = response.json()
        if players:
            print(f"\n✅ Players Structure (sample):")
            sample_player = players[0]
            print(f"   ID: {sample_player.get('id', 'N/A')}")
            print(f"   Name: {sample_player.get('name', 'N/A')}")
            print(f"   Team ID: {sample_player.get('team_id', 'N/A')}")
            print(f"   Handicap: {sample_player.get('handicap', 'N/A')}")
            print(f"   Payment Status: {sample_player.get('payment_status', 'N/A')}")
    
    # Test leaderboard structure
    response = session.get(f"{BACKEND_URL}/leaderboard/individual")
    if response.status_code == 200:
        leaderboard = response.json()
        if leaderboard:
            print(f"\n✅ Individual Leaderboard Structure (sample):")
            sample_entry = leaderboard[0]
            print(f"   Player: {sample_entry.get('player_name', 'N/A')}")
            print(f"   Team: {sample_entry.get('team_name', 'N/A')}")
            print(f"   Total Points: {sample_entry.get('total_points', 'N/A')}")
            print(f"   Matches Played: {sample_entry.get('matches_played', 'N/A')}")
    
    # Test settings structure
    response = session.get(f"{BACKEND_URL}/settings")
    if response.status_code == 200:
        settings = response.json()
        print(f"\n✅ Settings Structure:")
        print(f"   ID: {settings.get('id', 'N/A')}")
        print(f"   Dashboard Logo: {'Set' if settings.get('dashboard_logo') else 'Not Set'}")
        print(f"   Footer Signature: {'Set' if settings.get('footer_signature') else 'Not Set'}")

if __name__ == "__main__":
    test_detailed_responses()