import requests
import sys
import json
from datetime import datetime

class GolfLMSAPITester:
    def __init__(self, base_url="https://golf-lms-crm.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers)

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
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def login_user(self, role, email, password):
        """Login and store token for role"""
        success, response = self.run_test(
            f"{role} Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.tokens[role] = response['token']
            self.users[role] = response['user']
            return True
        return False

    def get_auth_header(self, role):
        """Get authorization header for role"""
        if role in self.tokens:
            return {"Authorization": f"Bearer {self.tokens[role]}"}
        return {}

    def test_seed_data(self):
        """Test seed data endpoint"""
        success, response = self.run_test(
            "Seed Data",
            "POST",
            "seed",
            200
        )
        return success

    def test_announcements(self):
        """Test public announcements endpoint"""
        success, response = self.run_test(
            "Get Announcements",
            "GET",
            "announcements",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"Found {len(response)} announcements")
            return True
        return success

    def test_courses(self, role="STUDENT"):
        """Test courses endpoint"""
        success, response = self.run_test(
            "Get Courses",
            "GET",
            "courses",
            200,
            headers=self.get_auth_header(role)
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"Found {len(response)} courses")
            # Check if tees are included
            for course in response:
                if 'tees' in course and len(course['tees']) > 0:
                    print(f"Course '{course['name']}' has {len(course['tees'])} tees")
                    return True
        return success

    def test_scorecard_submission(self, role="STUDENT"):
        """Test scorecard submission for student"""
        if role not in self.users:
            print(f"❌ User {role} not logged in")
            return False
            
        # First get courses to find a tee
        success, courses = self.run_test(
            "Get Courses for Scorecard",
            "GET",
            "courses",
            200,
            headers=self.get_auth_header(role)
        )
        
        if not success or not courses or not courses[0].get('tees'):
            print("❌ No courses or tees available for scorecard test")
            return False
            
        tee_id = courses[0]['tees'][0]['id']
        
        # Submit a scorecard
        scorecard_data = {
            "tee_id": tee_id,
            "gross_score": 85,
            "holes_played": 18,
            "pcc": 0
        }
        
        success, response = self.run_test(
            "Submit Scorecard",
            "POST",
            "scores/sync",
            200,
            data=scorecard_data,
            headers=self.get_auth_header(role)
        )
        
        if success and response.get('success') and 'differential' in response:
            print(f"Score differential calculated: {response['differential']}")
            print(f"New handicap index: {response.get('new_handicap_index')}")
            return True
        return success

    def test_tournaments(self, role="STUDENT"):
        """Test tournament endpoints"""
        success, response = self.run_test(
            "Get Tournaments",
            "GET",
            "tournaments",
            200,
            headers=self.get_auth_header(role)
        )
        
        if success and isinstance(response, list):
            print(f"Found {len(response)} tournaments")
            
            # Try to RSVP to first tournament if exists
            if len(response) > 0:
                tournament_id = response[0]['id']
                rsvp_success, rsvp_response = self.run_test(
                    "RSVP Tournament",
                    "POST",
                    f"tournaments/{tournament_id}/rsvp",
                    200,
                    headers=self.get_auth_header(role)
                )
                if rsvp_success:
                    print("✅ Tournament RSVP successful")
                return rsvp_success
            return True
        return success

    def test_coach_evaluation(self, role="STUDENT"):
        """Test coach evaluation submission"""
        # First get coaches
        success, coaches = self.run_test(
            "Get Coaches",
            "GET",
            "users?role=COACH",
            200,
            headers=self.get_auth_header(role)
        )
        
        if not success or not coaches:
            print("❌ No coaches available for evaluation test")
            return False
            
        coach_id = coaches[0]['id']
        
        eval_data = {
            "coach_id": coach_id,
            "rating": 5,
            "feedback": "Excellent coaching and great communication!"
        }
        
        success, response = self.run_test(
            "Submit Coach Evaluation",
            "POST",
            "coach-evaluations",
            200,
            data=eval_data,
            headers=self.get_auth_header(role)
        )
        
        if success and response.get('success'):
            print("✅ Coach evaluation submitted successfully")
            return True
        return success

    def test_chat_functionality(self, role="STUDENT"):
        """Test chat endpoints"""
        # Get channels
        success, channels = self.run_test(
            "Get Chat Channels",
            "GET",
            "channels",
            200,
            headers=self.get_auth_header(role)
        )
        
        if not success or not channels:
            print("❌ No chat channels available")
            return False
            
        channel_id = channels[0]['id']
        
        # Get messages
        success, messages = self.run_test(
            "Get Channel Messages",
            "GET",
            f"channels/{channel_id}/messages",
            200,
            headers=self.get_auth_header(role)
        )
        
        if success:
            print(f"Found {len(messages) if isinstance(messages, list) else 0} messages in channel")
            
            # Send a message (if not parent)
            if role != "PARENT":
                message_data = {"content": f"Test message from {role} at {datetime.now()}"}
                msg_success, msg_response = self.run_test(
                    "Send Chat Message",
                    "POST",
                    f"channels/{channel_id}/messages",
                    200,
                    data=message_data,
                    headers=self.get_auth_header(role)
                )
                return msg_success
            return True
        return success

    def test_admin_functionality(self, role="ADMIN"):
        """Test admin-specific endpoints"""
        if role != "ADMIN":
            return True
            
        # Test coach evaluation aggregates
        success, ratings = self.run_test(
            "Get Coach Rating Aggregates",
            "GET",
            "coach-evaluations/aggregate",
            200,
            headers=self.get_auth_header(role)
        )
        
        if success:
            print(f"Found {len(ratings) if isinstance(ratings, list) else 0} coach ratings")
        
        # Test announcement creation (NEW in iteration 2)
        announcement_data = {
            "title": "Test Admin Announcement",
            "content": "This is a test announcement from admin dashboard",
            "priority": "HIGH"
        }
        
        ann_success, ann_response = self.run_test(
            "Create Admin Announcement",
            "POST",
            "announcements",
            200,
            data=announcement_data,
            headers=self.get_auth_header(role)
        )
        
        if ann_success and 'id' in ann_response:
            print("✅ Admin announcement creation successful")
            return success and ann_success
        return success

    def test_profile_endpoints(self, role="STUDENT"):
        """Test user profile endpoints"""
        # Get current user profile
        success, profile = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200,
            headers=self.get_auth_header(role)
        )
        
        if success and 'id' in profile:
            print(f"Profile loaded for user: {profile.get('full_name')}")
            print(f"Role: {profile.get('role')}, HCP Index: {profile.get('current_hcp_index')}")
            return True
        return success

    def test_vpc_consent_endpoint(self, role="STUDENT"):
        """Test VPC consent POST endpoint (NEW in iteration 2)"""
        if role != "STUDENT":
            return True
            
        # Test POST /api/pending-approvals
        consent_data = {
            "guardian_kcc_id": "KCC-9999"
        }
        
        success, response = self.run_test(
            "VPC Consent Request POST",
            "POST", 
            "pending-approvals",
            200,
            data=consent_data,
            headers=self.get_auth_header(role)
        )
        
        if success and 'id' in response:
            print("✅ VPC consent POST endpoint working")
            
            # Also test GET pending-approvals
            get_success, get_response = self.run_test(
                "Get Pending Approvals", 
                "GET",
                "pending-approvals", 
                200,
                headers=self.get_auth_header(role)
            )
            return success and get_success
        return success

    def test_events_and_attendance(self, role="COACH"):
        """Test events and attendance endpoints (NEW event creation in iteration 2)"""
        if role != "COACH":
            return True
            
        # Test getting events
        success, events = self.run_test(
            "Get Events",
            "GET",
            "events",
            200,
            headers=self.get_auth_header(role)
        )
        
        if success:
            print(f"Found {len(events) if isinstance(events, list) else 0} existing events")
            
            # Test creating a new event (NEW feature in iteration 2)
            from datetime import datetime, timedelta
            start_time = (datetime.now() + timedelta(days=1)).isoformat()
            end_time = (datetime.now() + timedelta(days=1, hours=2)).isoformat()
            
            event_data = {
                "title": "Test Practice Session",
                "description": "Coach created test event",
                "start_time": start_time,
                "end_time": end_time
            }
            
            create_success, create_response = self.run_test(
                "Create New Event",
                "POST",
                "events",
                200,
                data=event_data,
                headers=self.get_auth_header(role)
            )
            
            if create_success and 'id' in create_response:
                print("✅ Event creation successful")
                return success and create_success
        return success

def main():
    print("🏌️ Starting Karen Country Club Golf LMS & CRM API Tests")
    print("=" * 60)
    
    tester = GolfLMSAPITester()
    
    # Test seed data first
    if not tester.test_seed_data():
        print("⚠️ Seed data test failed - continuing anyway")
    
    # Test public endpoints
    print("\n📢 Testing Public Endpoints...")
    tester.test_announcements()
    
    # Test user logins
    print("\n🔑 Testing User Authentication...")
    demo_users = [
        ("STUDENT", "student@kcc.co.ke", "student123"),
        ("COACH", "coach@kcc.co.ke", "coach123"), 
        ("PARENT", "parent@kcc.co.ke", "parent123"),
        ("ADMIN", "admin@kcc.co.ke", "admin123")
    ]
    
    login_success = 0
    for role, email, password in demo_users:
        if tester.login_user(role, email, password):
            login_success += 1
    
    if login_success == 0:
        print("❌ No users could login - aborting tests")
        return 1
    
    print(f"✅ Successfully logged in {login_success}/4 demo users")
    
    # Test core functionality for each role
    for role in ["STUDENT", "COACH", "PARENT", "ADMIN"]:
        if role not in tester.tokens:
            continue
            
        print(f"\n👤 Testing {role} Functionality...")
        
        # Test common endpoints
        tester.test_profile_endpoints(role)
        tester.test_courses(role)
        tester.test_chat_functionality(role)
        
        # Role-specific tests
        if role == "STUDENT":
            tester.test_scorecard_submission(role)
            tester.test_tournaments(role)
            tester.test_coach_evaluation(role)
            tester.test_vpc_consent_endpoint(role)
        elif role == "COACH":
            tester.test_events_and_attendance(role)
        elif role == "ADMIN":
            tester.test_admin_functionality(role)
    
    # Print final results
    print(f"\n📊 Test Results")
    print("=" * 30)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "No tests run")
    
    return 0 if tester.tests_passed > (tester.tests_run * 0.8) else 1

if __name__ == "__main__":
    sys.exit(main())