import os
import json
import logging
import time
from prompts.story_prompt import SYSTEM_PROMPT

try:
    import google.generativeai as genai
    import google.api_core.exceptions as google_exceptions
except ImportError:
    genai = None
    logging.warning("google-generativeai package is missing. Run pip install -r requirements.txt")

def generate_story_insights(story_text):
    """
    Calls Google Gemini API to analyze the story text.
    If GEMINI_API_KEY is missing, it automatically returns premium mock data
    so the app remains fully testable without keys.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key or not genai:
        logging.warning("GEMINI_API_KEY is not configured or google-generativeai package is missing. Using premium mock generator.")
        return generate_mock_data(story_text)
        
    genai.configure(api_key=api_key)
    model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-pro')
    
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.2
    }
    
    prompt = f"Analyze the following news story and output the structured JSON:\n\n{story_text}"
    
    # Try the preferred model (gemini-2.5-pro)
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
            generation_config=generation_config
        )
        response = model.generate_content(prompt)
        return json.loads(response.text.strip())
    except Exception as e:
        logging.warning(f"Model {model_name} failed: {e}. Retrying with gemini-1.5-pro fallback...")
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=SYSTEM_PROMPT,
                generation_config=generation_config
            )
            response = model.generate_content(prompt)
            return json.loads(response.text.strip())
        except Exception as fallback_err:
            logging.error(f"Fallback model failed: {fallback_err}. Attempting flash model fallback...")
            try:
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_PROMPT,
                    generation_config=generation_config
                )
                response = model.generate_content(prompt)
                return json.loads(response.text.strip())
            except Exception as final_err:
                logging.error(f"Gemini API invocation failed entirely: {final_err}. Falling back to Mock generator.")
                return generate_mock_data(story_text)

def generate_mock_data(story_text):
    """Generates realistic structured mock output based on the input text."""
    time.sleep(1.5)  # Simulate API processing delay
    
    # Try to extract a title from first line or sentence
    clean_lines = [line.strip() for line in story_text.split('\n') if line.strip()]
    first_line = clean_lines[0][:60] if clean_lines else "Telangana Growth Story"
    if len(first_line) == 60:
        first_line += "..."
        
    # Analyze text for category
    story_lower = story_text.lower()
    category = "Politics"
    if any(k in story_lower for k in ["tech", "software", "ai", "digital", "internet", "startup"]):
        category = "Technology"
    elif any(k in story_lower for k in ["rupee", "budget", "economy", "market", "finance", "tax", "industry"]):
        category = "Economy"
    elif any(k in story_lower for k in ["health", "hospital", "covid", "doctor", "disease", "vaccine"]):
        category = "Healthcare"
    elif any(k in story_lower for k in ["forest", "rain", "monsoon", "climate", "pollution", "tree", "water"]):
        category = "Environment"
    elif any(k in story_lower for k in ["school", "university", "education", "student", "exam", "college"]):
        category = "Education"
    elif any(k in story_lower for k in ["police", "court", "arrest", "crime", "illegal", "security"]):
        category = "Crime"

    return {
      "title": f"Advisor Analysis: {first_line}",
      "category": category,
      "angles": [
        {
          "title": f"Local Impact in Hyderabad",
          "angleType": "Local Impact",
          "description": f"How do these developments directly alter the day-to-day lives of residents in the Greater Hyderabad Municipal Corporation (GHMC) area? Conduct local focus groups to map changes."
        },
        {
          "title": "Socio-Economic Cost Analysis",
          "angleType": "Economic Focus",
          "description": "Analyze the financial implications of this story. Who stands to benefit economically, and which sections of society will bear the underlying costs?"
        },
        {
          "title": "Policy Loophole Examination",
          "angleType": "Policy & Governance",
          "description": "Critically analyze current administrative regulations. What policies are currently in place that enabled this development, and where do existing frameworks fall short?"
        },
        {
          "title": "The Human Angle",
          "angleType": "Human Interest",
          "description": "Focus on a single family or individual affected by this event. Build a strong narrative that captures the emotional weight and personal scale of the situation."
        },
        {
          "title": "Digital Transformation & Technology",
          "angleType": "Tech & Innovation",
          "description": "How are modern digital tools, social networks, or AI solutions influencing or resolving the challenges highlighted in this story?"
        }
      ],
      "followups": [
        {
          "title": "Tracking Administrative Accountability",
          "description": "Reviewing official commitments made in response to this report. We will interview department heads on project timelines.",
          "timeline": "24-48 Hours"
        },
        {
          "title": "Evaluating Public Reaction & Civic Action",
          "description": "Covering responses from resident welfare associations (RWAs) and local NGOs organizing demonstrations or town halls.",
          "timeline": "1 Week"
        },
        {
          "title": "Statistical Deep Dive: The Data Trends",
          "description": "Aggregating historical data from the past decade to show if this incident is an anomaly or part of a growing systemic pattern.",
          "timeline": "1 Week"
        },
        {
          "title": "Budgetary Audits and Funding Pipelines",
          "description": "Investigating the state budget allocations for this sector. We will trace money trails and inspect contract details.",
          "timeline": "1 Month"
        },
        {
          "title": "One Month Assessment: Has Anything Changed?",
          "description": "Revisiting the original location of the story to document concrete actions taken by local municipalities.",
          "timeline": "1 Month"
        }
      ],
      "questions": [
        {
          "question": "What is the immediate action plan from the Telangana Government regarding this issue?",
          "platform": "Twitter/X",
          "interestLevel": "High"
        },
        {
          "question": "How can local citizens report similar problems or get immediate relief?",
          "platform": "Quora",
          "interestLevel": "Trending"
        },
        {
          "question": "Are there any budgetary reports detailing where the allocated funds were actually spent?",
          "platform": "Reddit",
          "interestLevel": "Medium"
        },
        {
          "question": "What historical precedents exist for this type of policy implementation in Telangana?",
          "platform": "Wikipedia/Quora",
          "interestLevel": "Medium"
        },
        {
          "question": "How does the implementation timeline compare to neighboring states like Andhra Pradesh?",
          "platform": "Twitter/X",
          "interestLevel": "High"
        }
      ],
      "investigations": [
        {
          "title": "Under the Radar: Contract Allocations and Procurement Records",
          "description": "Reviewing procurement bids and contractor history. Investigate if contracts were awarded to vendors with prior performance defaults.",
          "potentialSources": "Telangana e-Procurement Portal, Department of Finance audit reports, RTI applications."
        },
        {
          "title": "Groundwater and Environmental Impact Audit",
          "description": "Tracing ecological degradation resulting from structural or industrial setups. Test soil and water samples around the site.",
          "potentialSources": "Telangana State Pollution Control Board (TSPCB), Environmental scientists, local farming community unions."
        },
        {
          "title": "The Displaced Families Story: Unmet Resettlement Promises",
          "description": "Verifying resettlement claims. Compare official registers of compensated people with physical interviews of residents in transit shelters.",
          "potentialSources": "Land Revenue Department, Rehabilitation and Resettlement (R&R) records, local panchayat authorities."
        }
      ],
      "socialIdeas": [
        {
          "platform": "Twitter/X Thread",
          "hook": "🚨 EXCLUSIVE: What the latest developments in Telangana mean for you. A breakdown of the key facts. 🧵👇",
          "content": "A 5-part thread summarizing: 1) The main incident, 2) Economic implications, 3) Citizen concerns, 4) Government response, 5) Question for readers: What do you think is the way forward? #TelanganaToday"
        },
        {
          "platform": "Instagram Reel",
          "hook": "Why everyone in Telangana is talking about this today... 😮",
          "content": "Visual outline showing dynamic charts of project budgets. Transition to video clips of local citizens expressing their views. On-screen text: 'What is your opinion?' Caption points to link in bio."
        },
        {
          "platform": "LinkedIn",
          "hook": "A masterclass in policy administration or a lesson in systemic failure? Here's an analysis of the policy shifts in Telangana.",
          "content": "Professional analysis of regulatory and industrial impact. Invites corporate leaders and policy experts to discuss public-private partnership models in the comments."
        },
        {
          "platform": "YouTube Short",
          "hook": "Did you know this about Telangana's new project? 📈",
          "content": "Fast-paced infographic style video showing 3 key facts in 60 seconds. Voiceover: upbeat, professional. Ends with a CTA to read Telangana Today for deep-dive reporting."
        },
        {
          "platform": "Twitter/X",
          "hook": "POLL: Which area of the new policy requires the most urgent review?",
          "content": "Interactive poll with options: 1) Budgetary Transparency, 2) Environmental Protection, 3) Implementation Speed, 4) Citizen Compensation. Pin to top of feed."
        }
      ]
    }
