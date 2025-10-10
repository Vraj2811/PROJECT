#!/usr/bin/env python3
"""
Simple test script to verify the random question API endpoint
"""

import requests
import json

def test_random_question_api():
    """Test the random question API endpoint"""
    base_url = "http://127.0.0.1:5000"
    
    # Test session setup (simulate login)
    session = requests.Session()
    
    # Login as student
    login_data = {
        'username': 'student',
        'password': 'student123',
        'role': 'student'
    }
    
    print("Testing student login...")
    login_response = session.post(f"{base_url}/login", data=login_data)
    print(f"Login response status: {login_response.status_code}")
    
    if login_response.status_code in [200, 302]:  # Success or redirect after login
        print("Login successful!")
        
        # Test topics API
        print("\nTesting topics API...")
        topics_response = session.get(f"{base_url}/api/practice/topics")
        print(f"Topics API status: {topics_response.status_code}")
        
        if topics_response.status_code == 200:
            topics_data = topics_response.json()
            print(f"Topics data: {json.dumps(topics_data, indent=2)}")
            
            # Test random question API with all topics
            print("\nTesting random question API (all topics)...")
            random_response = session.get(f"{base_url}/api/practice/random-question?topics=all")
            print(f"Random question API status: {random_response.status_code}")
            
            if random_response.status_code == 200:
                question_data = random_response.json()
                print(f"Question data: {json.dumps(question_data, indent=2)}")
                print("✅ Random question API working correctly!")
            else:
                print(f"❌ Random question API failed: {random_response.text}")
                
            # Test with specific topics
            if topics_data.get('status') == 'success' and topics_data.get('topics'):
                first_topic = topics_data['topics'][0]
                topic_param = f"{first_topic['subject']}:{first_topic['topic']}"
                
                print(f"\nTesting random question API with specific topic: {topic_param}")
                specific_response = session.get(f"{base_url}/api/practice/random-question?topics={topic_param}")
                print(f"Specific topic API status: {specific_response.status_code}")
                
                if specific_response.status_code == 200:
                    specific_data = specific_response.json()
                    print(f"Specific question data: {json.dumps(specific_data, indent=2)}")
                    print("✅ Specific topic random question API working correctly!")
                else:
                    print(f"❌ Specific topic API failed: {specific_response.text}")
        else:
            print(f"❌ Topics API failed: {topics_response.text}")
    else:
        print(f"❌ Login failed: {login_response.text}")

if __name__ == "__main__":
    test_random_question_api()
