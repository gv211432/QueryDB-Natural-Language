FastAPI Backend for Chat with SQL
Setup

Install dependencies:

pip install -r requirements.txt


Create a .env file with:

GOOGLE_API_KEY=your_google_api_key_here
FRONTEND_URL=http://localhost:3000


Run the server:

uvicorn app.main:app --host 0.0.0.0 --port 8000

Notes

Ensure MySQL database is accessible with provided credentials.
The API expects database credentials and a query in the POST request to /send-message.

