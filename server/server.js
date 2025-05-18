import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const DATA_FILE = path.join(process.cwd(), 'server', 'data', 'blogs.json');

// Ensure data directory exists
const ensureDataFile = async () => {
  try {
    await fs.mkdir(path.join(process.cwd(), 'server', 'data'), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error ensuring data file exists:', error);
  }
};

// Data access functions
const getBlogs = async () => {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const saveBlogs = async (blogs) => {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(blogs, null, 2));
};

// Routes
// Get all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await getBlogs();
    res.json(blogs);
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({ message: 'Failed to retrieve blogs' });
  }
});

// Get blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blog = blogs.find(blog => blog.id === req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error getting blog:', error);
    res.status(500).json({ message: 'Failed to retrieve blog' });
  }
});

// Save or update a draft
app.post('/api/blogs/save-draft', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const now = new Date().toISOString();
    
    // New blog
    const newBlog = {
      id: uuidv4(),
      title: req.body.title || 'Untitled Blog',
      content: req.body.content || '',
      tags: req.body.tags || [],
      status: 'draft',
      created_at: now,
      updated_at: now
    };
    
    blogs.push(newBlog);
    await saveBlogs(blogs);
    
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
});

// Update existing draft
app.post('/api/blogs/:id/save-draft', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blogIndex = blogs.findIndex(blog => blog.id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const updatedBlog = {
      ...blogs[blogIndex],
      title: req.body.title !== undefined ? req.body.title : blogs[blogIndex].title,
      content: req.body.content !== undefined ? req.body.content : blogs[blogIndex].content,
      tags: req.body.tags !== undefined ? req.body.tags : blogs[blogIndex].tags,
      status: 'draft',
      updated_at: new Date().toISOString()
    };
    
    blogs[blogIndex] = updatedBlog;
    await saveBlogs(blogs);
    
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ message: 'Failed to update draft' });
  }
});

// Publish a new blog
app.post('/api/blogs/publish', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const now = new Date().toISOString();
    
    const newBlog = {
      id: uuidv4(),
      title: req.body.title || 'Untitled Blog',
      content: req.body.content || '',
      tags: req.body.tags || [],
      status: 'published',
      created_at: now,
      updated_at: now
    };
    
    blogs.push(newBlog);
    await saveBlogs(blogs);
    
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({ message: 'Failed to publish blog' });
  }
});

// Publish an existing blog
app.post('/api/blogs/:id/publish', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blogIndex = blogs.findIndex(blog => blog.id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const updatedBlog = {
      ...blogs[blogIndex],
      title: req.body.title !== undefined ? req.body.title : blogs[blogIndex].title,
      content: req.body.content !== undefined ? req.body.content : blogs[blogIndex].content,
      tags: req.body.tags !== undefined ? req.body.tags : blogs[blogIndex].tags,
      status: 'published',
      updated_at: new Date().toISOString()
    };
    
    blogs[blogIndex] = updatedBlog;
    await saveBlogs(blogs);
    
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({ message: 'Failed to publish blog' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});