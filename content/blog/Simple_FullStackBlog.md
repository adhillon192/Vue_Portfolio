---
title: "Building a Production-Ready Blog Platform with Docker:  A Full-Stack Journey"
description: Creating a containerized blog management system from scratch using Express.js, PostgreSQL, and vanilla JavaScript—demonstrating how Docker transforms local development and deployment workflows.
date: 2025-04-23
image: https://images.pexels.com/photos/1050312/pexels-photo-1050312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 8
author: 
  name: Amardeep Dhillon
  avatar: 
    src: https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    alt: Amardeep Dhillon
---

## Introduction

Content management systems are everywhere, but understanding how they work under the hood requires building one from scratch. The **Simple Full-Stack Blog** is a containerized blog platform that demonstrates fundamental web development concepts:  RESTful API design, database interactions, Docker orchestration, and client-server communication—all without the complexity of modern frameworks.

Built with **Express.js**, **PostgreSQL**, and **vanilla JavaScript**, this project showcases how traditional web technologies combined with modern DevOps practices create production-ready applications. The entire stack runs in Docker containers, making development consistent across environments and deployment straightforward.

**Repository:** [github.com/adhillon192/Simple_FullStack_Blog](https://github.com/adhillon192/Simple_FullStack_Blog)

## The Problem Statement

Most blog tutorials rely on monolithic frameworks or managed services that abstract away critical concepts. This project takes a different approach by:

- Building a REST API **from first principles** with Express
- Managing database connections **without ORM magic**
- Handling client-side rendering **with vanilla JavaScript**
- Containerizing the entire stack **with Docker Compose**

The goal was educational:  understand every layer of the stack rather than relying on abstractions.

## Architecture Overview

The application follows a classic three-tier architecture:

```
┌─────────────────┐
│   Frontend      │  HTML + Vanilla JS + Bulma CSS
│   (Browser)     │  Port:  Served via Live Server
└────────┬────────┘
         │ HTTP Requests (fetch API)
         ▼
┌─────────────────┐
│   Backend       │  Express.js REST API
│   (Node.js)     │  Port: 3000
└────────┬────────┘
         │ SQL Queries (pg library)
         ▼
┌─────────────────┐
│   Database      │  PostgreSQL 15
│   (Docker)      │  Port: 5432
└─────────────────┘
```

Each layer communicates through well-defined interfaces, making the system modular and testable.

## Backend Implementation

### Express.js Server Architecture

The backend (`server.js`) implements a minimal but complete RESTful API: 

```javascript
const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Create a new post
app.post('/api/posts', async (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Key Design Decisions:**

1. **Input Validation** - Server-side validation prevents invalid data from reaching the database
2. **Parameterized Queries** - Using `$1, $2` prevents SQL injection attacks
3. **Error Handling** - Try-catch blocks ensure failures are logged and communicated to clients
4. **HTTP Status Codes** - Proper codes (201, 400, 500) follow REST conventions

### Database Connection Management

The `db.js` module creates a PostgreSQL connection pool:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db',        // Docker service name
  database: 'blogdb',
  password: 'password',
  port: 5432,
});

module.exports = pool;
```

**Why Connection Pooling?**

Instead of creating a new database connection for every request, the pool maintains a set of reusable connections. This:

- Reduces connection overhead
- Improves response times
- Prevents database connection exhaustion under load

The `host:  'db'` configuration is critical—it references the Docker Compose service name, enabling container-to-container communication.

### RESTful API Design

The API implements full CRUD operations:

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `POST` | `/api/posts` | Create new post | 201 + post object |
| `GET` | `/api/posts` | Retrieve all posts | 200 + array |
| `PUT` | `/api/posts/:id` | Update post | 200 + updated object |
| `DELETE` | `/api/posts/:id` | Delete post | 200 + success message |

Each endpoint follows REST principles: 

- Uses appropriate HTTP methods
- Returns consistent JSON responses
- Includes error messages for failures
- Orders results (newest first) for user experience

## Frontend Implementation

### Vanilla JavaScript Architecture

Rather than using React or Vue, the frontend leverages vanilla JavaScript with the `fetch` API:

```javascript
// addpost.js - Creating a new post
async function addPost() {
  const title = document. getElementById('title').value;
  const content = document.getElementById('content').value;

  try {
    const response = await fetch('http://localhost:3000/api/posts', {
      method:  'POST',
      headers:  { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      showNotification('Added Successfully', 'is-success');
      clearForm();
    } else {
      showNotification('Error adding post', 'is-danger');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Network error', 'is-danger');
  }
}
```

**Why Vanilla JavaScript?**

- **Educational Value** - Understand browser APIs without framework abstractions
- **Zero Build Step** - No webpack, babel, or compilation required
- **Performance** - No framework overhead for simple interactions
- **Fundamentals** - Learn DOM manipulation and async patterns

### Three-Page Architecture

The application consists of three distinct views:

**1. Add Post Page (`addpost.html`)**
- Form with title and content fields
- Success/error notifications
- Clear button to reset form
- Client-side validation before API calls

**2. Blog View (`blog.html`)**
- Displays all posts in reverse chronological order
- Shows "No posts yet" message when empty
- Responsive card-based layout
- Auto-fetches on page load

**3. Manage Posts (`managepost.html`)**
- Admin dashboard listing all posts
- Edit button opens inline form with pre-filled data
- Delete button with confirmation dialog
- Real-time updates after modifications

### Bulma CSS for Rapid Styling

The project uses [Bulma](https://bulma.io/), a modern CSS framework:

```html
<div class="card">
  <div class="card-content">
    <p class="title">{{ post.title }}</p>
    <p class="content">{{ post.content }}</p>
  </div>
  <footer class="card-footer">
    <a class="card-footer-item" onclick="editPost({{ post.id }})">Edit</a>
    <a class="card-footer-item" onclick="deletePost({{ post.id }})">Delete</a>
  </footer>
</div>
```

Bulma provides:
- **Responsive grid system** without custom CSS
- **Pre-styled components** (cards, buttons, forms)
- **Flexbox-based layouts** that adapt to screen sizes
- **Utility classes** for spacing and typography

## Docker Orchestration

### Multi-Container Setup with Docker Compose

The `docker-compose.yml` defines two services:

```yaml
services:
  backend:
    build:
      context: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASS=password
      - DB_NAME=blogdb

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: blogdb
    ports:
      - "5432:5432"
    volumes: 
      - pgdata:/var/lib/postgresql/data

volumes: 
  pgdata:
```

**Key Orchestration Features:**

1. **Service Dependencies** - `depends_on` ensures database starts before backend
2. **Named Volumes** - `pgdata` persists database across container restarts
3. **Environment Variables** - Configuration injected at runtime
4. **Port Mapping** - Exposes services to host machine for development

### Backend Dockerfile

The backend container uses a multi-step build process:

```dockerfile
FROM node:18

WORKDIR /app

COPY package. json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

**Dockerfile Best Practices:**

- Uses official Node.js 18 base image
- Copies `package.json` first for better layer caching
- Installs dependencies before copying source code
- Exposes port for documentation purposes
- Defines explicit start command

### Database Initialization

PostgreSQL requires manual table creation on first run:

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
```

**Schema Design Decisions:**

- `SERIAL` for auto-incrementing primary keys
- `TEXT` type accommodates variable-length content
- `NOT NULL` constraints enforce data integrity
- Minimal schema keeps focus on core concepts

## Development Workflow

### Starting the Application

```bash
# Clone repository
git clone https://github.com/adhillon192/Simple_FullStack_Blog.git
cd Simple_FullStack_Blog

# Start all services
docker-compose up --build

# In another terminal, create database table
docker exec -it <db_container_id> psql -U postgres -d blogdb
CREATE TABLE posts (...);

# Open frontend files in browser
# addpost.html, blog.html, managepost. html
```

### Why This Workflow Works

- **Single Command Startup** - `docker-compose up` launches entire stack
- **Consistent Environments** - Docker ensures same behavior across machines
- **No Dependency Hell** - PostgreSQL, Node.js versions locked in containers
- **Easy Teardown** - `docker-compose down` removes everything cleanly

## CORS Configuration

Cross-Origin Resource Sharing (CORS) was configured to allow browser requests: 

```javascript
app.use(cors({
  origin: 'http://127.0.0.1:5500', // VS Code Live Server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));
```

**Why CORS Matters:**

When the frontend runs on `127.0.0.1:5500` (Live Server) and backend on `localhost:3000`, browsers block requests by default for security. The CORS middleware tells browsers it's safe to allow these cross-origin requests.

## Error Handling Patterns

### Server-Side Validation

```javascript
app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Validate input
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );

    // Check if post exists
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Layered Error Handling:**

1. **Input validation** catches missing fields (400 Bad Request)
2. **Business logic checks** detect non-existent resources (404 Not Found)
3. **Exception handling** manages database errors (500 Internal Server Error)

### Client-Side Error Display

```javascript
function showNotification(message, type) {
  const notification = document. getElementById('notification');
  notification.innerHTML = `
    <div class="notification ${type}">
      <button class="delete" onclick="clearNotification()"></button>
      ${message}
    </div>
  `;
  setTimeout(clearNotification, 3000);
}
```

User-facing errors appear as temporary notifications using Bulma's notification component.

## Key Learning Outcomes

### Understanding the Request-Response Cycle

This project clarifies how web applications work:

1. User clicks "Add Post" button
2. JavaScript captures form data
3. `fetch()` sends HTTP POST to `localhost:3000/api/posts`
4. Express routes request to handler function
5. Handler validates input and queries PostgreSQL
6. Database returns inserted row
7. Express sends JSON response to browser
8. JavaScript updates DOM to show success message

### Docker Networking Concepts

The project demonstrates Docker networking:

- **Service Names as Hostnames** - `host:  'db'` resolves to database container
- **Port Mapping** - Internal container ports exposed to host machine
- **Volume Persistence** - Data survives container restarts
- **Service Dependencies** - Orchestration ensures correct startup order

### RESTful API Principles

Implementing CRUD operations taught:

- **Resource-based URLs** (`/api/posts/: id`)
- **HTTP method semantics** (GET retrieves, POST creates, PUT updates, DELETE removes)
- **Stateless communication** (each request contains all necessary information)
- **Standard status codes** (201 Created, 404 Not Found, 500 Server Error)

## Challenges and Solutions

### Challenge 1: Docker Service Discovery

**Problem:** Backend couldn't connect to PostgreSQL using `localhost`.

**Solution:** Docker Compose creates an internal network where services communicate using service names.  Changing `host: 'localhost'` to `host: 'db'` resolved the issue.

### Challenge 2: CORS Policy Blocking

**Problem:** Browser console showed "CORS policy blocked" errors.

**Solution:** Configured Express middleware to explicitly allow requests from Live Server's origin (`http://127.0.0.1:5500`).

### Challenge 3: Data Persistence

**Problem:** Database data disappeared after `docker-compose down`.

**Solution:** Added named volume `pgdata` in `docker-compose.yml` to persist PostgreSQL data directory.

## Future Enhancements

The roadmap includes several improvements:

- **User Authentication** - Add login system with session management
- **Rich Text Editor** - Replace textarea with markdown or WYSIWYG editor
- **Image Uploads** - Support featured images for blog posts
- **Search Functionality** - Full-text search across titles and content
- **Pagination** - Handle large numbers of posts efficiently
- **Categories/Tags** - Organize posts by topic
- **Automated Testing** - Add Jest for unit tests and Cypress for E2E tests
- **CI/CD Pipeline** - Automate testing and deployment with GitHub Actions
- **Database Migrations** - Use tools like Flyway or Liquibase for schema versioning

## Production Considerations

To make this production-ready, several changes would be needed:

### Security Hardening

- Use environment variables for database credentials
- Implement password hashing for user accounts
- Add rate limiting to prevent abuse
- Validate and sanitize all user input
- Enable HTTPS with SSL certificates

### Performance Optimization

- Add Redis caching layer for frequently accessed posts
- Implement database indexing on commonly queried fields
- Use CDN for static assets
- Enable gzip compression for API responses
- Optimize SQL queries with `EXPLAIN ANALYZE`

### Monitoring and Logging

- Integrate structured logging (Winston or Pino)
- Add application performance monitoring (APM)
- Set up error tracking (Sentry)
- Create health check endpoints
- Monitor database connection pool metrics

## Conclusion

Building the Simple Full-Stack Blog demonstrated that powerful applications don't require complex frameworks—solid fundamentals combined with modern tooling are often sufficient. The project reinforced several key concepts:

- **RESTful APIs** can be built with minimal code using Express
- **PostgreSQL** provides enterprise-level data management without complexity
- **Docker** eliminates "works on my machine" problems
- **Vanilla JavaScript** remains powerful for simple interactivity

Whether you're learning full-stack development or preparing for technical interviews, understanding how to build systems from scratch provides invaluable context that frameworks alone cannot teach. 

The complete source code, including detailed setup instructions, is available on [GitHub](https://github.com/adhillon192/Simple_FullStack_Blog). Feel free to fork, extend, or use it as a learning resource for your own projects.

---

**Tech Stack:** Node.js | Express.js | PostgreSQL 15 | Docker | Docker Compose | Vanilla JavaScript | Bulma CSS

**Source Code:** [GitHub Repository](https://github.com/adhillon192/Simple_FullStack_Blog)

**Key Concepts:** RESTful APIs | Docker Orchestration | Database Connection Pooling | CORS | Full-Stack Architecture