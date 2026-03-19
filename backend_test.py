#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class LiveScoringAPITester:
    def __init__(self, base_url="https://golf-lms-crm.preview.emergentagent.com"):
        self.base_url = base_url.rstrip("/")
        self.tokens = {}
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Exception: {str(e)}")
            return False, {}

    def login_user(self, email, password, role_name):
        """Login and get token"""
        success, response = self.run_test(
            f"Login {role_name}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.tokens[role_name] = response['token']
            print(f"   Token stored for {role_name}")
            return True
        return False

    def get_auth_headers(self, role_name):
        """Get authorization headers for a role"""
        token = self.tokens.get(role_name)
        if not token:
            return {'Content-Type': 'application/json'}
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }

    def test_tournament_leaderboard(self, tournament_id):
        """Test GET /api/tournaments/{tournament_id}/leaderboard"""
        success, response = self.run_test(
            f"Get Tournament {tournament_id} Leaderboard",
            "GET",
            f"tournaments/{tournament_id}/leaderboard",
            200
        )
        
        if success:
            # Validate leaderboard structure
            expected_keys = ['tournament', 'scores', 'rsvp_count', 'players_started']
            missing_keys = [key for key in expected_keys if key not in response]
            if missing_keys:
                print(f"   ⚠️  Missing keys in leaderboard: {missing_keys}")
                return False
            
            scores = response.get('scores', [])
            print(f"   📊 Found {len(scores)} players with scores")
            
            # Validate score structure for first player
            if scores:
                score = scores[0]
                required_score_keys = ['position', 'student_name', 'total_score', 'to_par', 'holes_completed']
                missing_score_keys = [key for key in required_score_keys if key not in score]
                if missing_score_keys:
                    print(f"   ⚠️  Missing keys in score: {missing_score_keys}")
                else:
                    print(f"   ✨ Player 1: {score['student_name']} - Pos {score['position']}, Score {score['total_score']}, To Par {score['to_par']}, Holes {score['holes_completed']}")
            
            return len(scores) >= 4  # Should have 4 players as mentioned in the test requirements
        
        return False

    def test_live_score_submission(self, tournament_id, student_id, role_name):
        """Test POST /api/tournaments/{tournament_id}/live-scores"""
        test_hole_scores = [4, 5, 3, 5, 4, 6, 4, 5, 4, None, None, None, None, None, None, None, None, None]
        
        success, response = self.run_test(
            f"Submit Live Score for Student {student_id}",
            "POST",
            f"tournaments/{tournament_id}/live-scores",
            200,
            data={
                "student_id": student_id,
                "hole_scores": test_hole_scores,
                "tee_id": "tee-muthaiga-white"
            },
            headers=self.get_auth_headers(role_name)
        )
        
        if success:
            # Validate response structure
            expected_keys = ['student_id', 'hole_scores', 'total_score', 'to_par', 'holes_completed']
            missing_keys = [key for key in expected_keys if key not in response]
            if missing_keys:
                print(f"   ⚠️  Missing keys in live score response: {missing_keys}")
                return False
            
            print(f"   🎯 Score submitted: Total {response['total_score']}, To Par {response['to_par']}, Holes {response['holes_completed']}")
            return True
        
        return False

    def test_tournament_status_update(self, tournament_id, new_status, role_name):
        """Test PUT /api/tournaments/{tournament_id}/status"""
        success, response = self.run_test(
            f"Update Tournament {tournament_id} Status to {new_status}",
            "PUT",
            f"tournaments/{tournament_id}/status",
            200,
            data={"status": new_status},
            headers=self.get_auth_headers(role_name)
        )
        
        if success and response.get('success'):
            print(f"   🚦 Tournament status updated to {new_status}")
            return True
        
        return False

    def test_unauthorized_access(self):
        """Test that student cannot access coach endpoints"""
        student_headers = self.get_auth_headers('STUDENT')
        
        # Test student cannot submit live scores
        success, _ = self.run_test(
            "Student Cannot Submit Live Scores",
            "POST",
            "tournaments/t-3/live-scores",
            403,
            data={
                "student_id": "demo-student",
                "hole_scores": [4, 5, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]
            },
            headers=student_headers
        )
        
        if not success:
            print("   ⚠️  Student should be blocked from submitting scores")
            return False
        
        # Test student cannot update tournament status
        success, _ = self.run_test(
            "Student Cannot Update Tournament Status",
            "PUT",
            "tournaments/t-3/status",
            403,
            data={"status": "COMPLETED"},
            headers=student_headers
        )
        
        if not success:
            print("   ⚠️  Student should be blocked from updating tournament status")
            return False
        
        return True

def main():
    print("🏌️ Karen Country Club Golf LMS - Live Leaderboard & Scoring API Tests")
    print("=" * 70)
    
    tester = LiveScoringAPITester()
    
    # Login all test users
    if not tester.login_user("student@kcc.co.ke", "student123", "STUDENT"):
        print("❌ Student login failed, stopping tests")
        return 1
    
    if not tester.login_user("coach@kcc.co.ke", "coach123", "COACH"):
        print("❌ Coach login failed, stopping tests")
        return 1
    
    if not tester.login_user("admin@kcc.co.ke", "admin123", "ADMIN"):
        print("❌ Admin login failed, stopping tests")
        return 1
    
    # Test 1: GET /api/tournaments/t-3/leaderboard
    print("\n" + "="*50)
    print("TEST 1: Tournament Leaderboard API")
    print("="*50)
    
    leaderboard_success = tester.test_tournament_leaderboard("t-3")
    if not leaderboard_success:
        print("❌ Leaderboard test failed - critical functionality broken")
    
    # Test 2: POST live scores (coach auth)
    print("\n" + "="*50)
    print("TEST 2: Live Score Submission API")
    print("="*50)
    
    live_score_success = tester.test_live_score_submission("t-3", "demo-student", "COACH")
    if not live_score_success:
        print("❌ Live score submission failed - critical functionality broken")
    
    # Test 3: PUT tournament status (coach auth)
    print("\n" + "="*50)
    print("TEST 3: Tournament Status Update API")
    print("="*50)
    
    # Try to update status from LIVE to COMPLETED and back to LIVE
    status_success_1 = tester.test_tournament_status_update("t-3", "COMPLETED", "COACH")
    status_success_2 = tester.test_tournament_status_update("t-3", "LIVE", "COACH")
    status_success = status_success_1 and status_success_2
    
    # Test 4: Authorization tests
    print("\n" + "="*50)
    print("TEST 4: Authorization & Security")
    print("="*50)
    
    auth_success = tester.test_unauthorized_access()
    
    # Summary
    print("\n" + "="*70)
    print("BACKEND TEST SUMMARY")
    print("="*70)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    critical_tests = [leaderboard_success, live_score_success, status_success, auth_success]
    critical_passed = sum(critical_tests)
    
    print(f"🎯 Critical features: {critical_passed}/4 working")
    print("\n🔍 Critical Test Results:")
    print(f"   • Tournament Leaderboard: {'✅ PASS' if leaderboard_success else '❌ FAIL'}")
    print(f"   • Live Score Submission: {'✅ PASS' if live_score_success else '❌ FAIL'}")
    print(f"   • Tournament Status Update: {'✅ PASS' if status_success else '❌ FAIL'}")
    print(f"   • Authorization Controls: {'✅ PASS' if auth_success else '❌ FAIL'}")
    
    if critical_passed == 4:
        print("\n🎉 All critical backend APIs are working correctly!")
        return 0
    else:
        print(f"\n⚠️  {4 - critical_passed} critical backend issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())