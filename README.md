# Blog Editor Application

A full-stack blog editor application with auto-save functionality built with React, TypeScript, and Node.js.

## Features

- Blog editor with rich text editing
- Auto-save drafts after 5 seconds of inactivity
- Save as draft and publish functionality
- Tags support
- Separate views for published blogs and drafts
- Full CRUD operations for blog posts
- Responsive design for all devices

## Tech Stack

### Frontend
- React 18
- TypeScript
- TailwindCSS for styling
- React Router for navigation
- TinyMCE for rich text editing
- React Toastify for notifications
- Lucide React for icons

### Backend
- Node.js
- Express.js
- File-based JSON storage (can be replaced with a database)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173)

## API Endpoints

- `GET /api/blogs` - Retrieve all blogs
- `GET /api/blogs/:id` - Retrieve a blog by ID
- `POST /api/blogs/save-draft` - Save a new draft
- `POST /api/blogs/:id/save-draft` - Update an existing draft
- `POST /api/blogs/publish` - Publish a new blog
- `POST /api/blogs/:id/publish` - Publish an existing blog

## Implementation Details

### Auto-Save Functionality

The auto-save feature is implemented using a debounce mechanism that triggers a save operation after 5 seconds of user inactivity when editing blog content. This helps to prevent data loss and provides a seamless writing experience.

### Data Storage

For simplicity, this implementation uses a file-based JSON storage system for the backend. In a production to the environment, we can replace this with a proper database like MongoDB or PostgreSQL.
