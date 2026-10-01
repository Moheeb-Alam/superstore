# FreshMart – Super Store E-commerce
1. `npm install`
2. `cp .env.example .env` and set JWT_SECRET / ADMIN_PASSWORD
3. `npm start` → store: http://localhost:3000 · admin: http://localhost:3000/admin.html

Structure: backend/{routes,controllers,middleware,db.js,uploads}, frontend/public.
Data lives in backend/data.json (auto-seeded). Replace backend/db.js to use MongoDB/Supabase.
Chatbot (backend/controllers/chatbot.js) reads live data, so admin changes apply instantly.
