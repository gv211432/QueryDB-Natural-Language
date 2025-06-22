# ChatWithDatabase

A modern web app to query your database using plain English. Built with Next.js (frontend) and FastAPI (backend), it allows you to connect to any SQL database, ask questions in natural language, and get SQL queries and results instantly.

---

## Features

- **Connect to any SQL database**: PostgreSQL, MySQL, SQLite, MongoDB, and more.
- **Natural language interface**: Ask questions in plain English, get SQL queries and results.
- **Modern UI**: Built with shadcn/ui and Tailwind CSS for a beautiful, responsive experience.
- **Sidebar connection manager**: Easily add, view, and switch between database connections.
- **Copy results**: One-click copy for generated SQL or results.
- **Dark mode**: Toggle between light and dark themes.

---

## Project Structure

```
clg/
├── Backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entrypoint
│   │   ├── database.py     # Database logic
│   │   ├── config.py       # Settings (CORS, frontend URL, etc.)
│   │   └── models.py       # (Optional) ORM models
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── page.tsx        # Main UI (chat, sidebar, etc.)
│   │   └── api/
│   │       └── chat/route.ts # API route to backend
│   ├── components/         # UI components (shadcn/ui)
│   ├── public/             # Static assets
│   └── ...                 # Config, styles, etc.
└── README.md               # This file
```

---

## Getting Started

### 1. Backend (FastAPI)

1. **Install dependencies:**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```
2. **Configure CORS:**
   - Edit `app/config.py` and set `settings.frontend_url` to your frontend URL (e.g. `http://localhost:3000`).
3. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend (Next.js)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```
2. **Configure backend URL:**
   - Create a `.env.local` file in `frontend/`:
     ```env
     NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
     ```
3. **Run the frontend:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open in browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

---

## Usage

1. **Open the sidebar** and set your database connection URI and type.
2. **Enter your question** in plain English (e.g. "Show me all users").
3. **Submit** to get the generated SQL and results.
4. **Copy** any result or SQL with one click.
5. **Switch themes** using the sun/moon button.

---

## Supported Database URI Formats

- **PostgreSQL:**
  `postgresql://user:password@host:port/dbname`
- **MySQL:**
  `mysql://user:password@host:port/dbname`
- **SQLite:**
  `sqlite:///path/to/database.db`
- **MongoDB:**
  `mongodb://user:password@host:port/dbname`

> _Note: Your database must be accessible from the backend server._

---

## Natural Language Query System (Detailed)

### Overview

The core feature of this project is its Natural Language Query System, which allows users to interact with their databases using plain English (or other supported languages) instead of writing SQL queries manually. This system bridges the gap between non-technical users and complex databases, making data access and analysis much more accessible.

### How It Works

1. **User Input:**
   - The user enters a question or request in natural language (e.g., "Show me all users who registered last month" or "Count the number of orders by status").
   - The user also provides the database connection URI (and type) via the sidebar.

2. **Frontend Processing:**
   - The frontend captures the user's question and database URI, then sends them to the backend API via a POST request.

3. **Backend Processing:**
   - The FastAPI backend receives the request at the `/send-message` endpoint.
   - The backend uses a component (e.g., `ChatWithSql` in `app/database.py`) to:
     - Parse the natural language question.
     - Convert it into a valid SQL query tailored for the connected database type.
     - Optionally, execute the SQL query on the database and fetch results.
   - The backend returns the generated SQL and/or the query results to the frontend.

4. **Frontend Display:**
   - The frontend displays the generated SQL query and/or the results in a chat-like interface.
   - Users can copy the SQL or results, ask follow-up questions, or change the database connection at any time.

### Example Flow

1. **User:** "List all products with price greater than $100"
2. **System:**
   - Converts to SQL: `SELECT * FROM products WHERE price > 100;`
   - Executes the query and returns the result set.
3. **User:** "Show me the top 5 customers by order count"
4. **System:**
   - Converts to SQL: `SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id ORDER BY order_count DESC LIMIT 5;`
   - Executes and returns the results.

### Benefits

- **No SQL knowledge required:** Anyone can query the database using everyday language.
- **Faster insights:** Reduces the time to get answers from your data.
- **Flexible:** Works with multiple database types and can be extended to support more.
- **Safe:** Only executes queries on user-provided connections; no hardcoded credentials.

### Customization & Extensibility

- The natural language to SQL conversion logic can be improved or replaced with more advanced NLP models (e.g., OpenAI, HuggingFace, or custom LLMs).
- You can add support for more languages or database dialects by extending the backend logic.
- The system can be adapted for analytics, reporting, or even database administration tasks.

---

## Customization

- **UI:**
  - All UI is built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS. You can easily customize components in `frontend/components/`.
- **Backend:**
  - The backend logic for converting natural language to SQL is in `Backend/app/database.py` (see `ChatWithSql`).

---

## Troubleshooting

- **Network error?**
  - Make sure both backend and frontend are running.
  - Check CORS settings in `Backend/app/config.py`.
  - Ensure the database URI is correct and accessible.
- **Backend errors?**
  - Check backend logs for Python exceptions.
- **Frontend errors?**
  - Check browser console and terminal output.

---

## License

MIT. See [LICENSE](LICENSE) for details.
