from langchain_google_genai import GoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from app.config import settings

class ChatWithSql:
    def __init__(self, db_uri):
        self.db_uri = db_uri
        self.llm = GoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.google_api_key,
            temperature=0.3
        )

    def message(self, query):
        db = SQLDatabase.from_uri(self.db_uri)
        toolkit = SQLDatabaseToolkit(db=db, llm=self.llm)
        agent_executor = create_sql_agent(
            llm=self.llm,
            toolkit=toolkit,
            verbose=True
        )
        return agent_executor.run(query)