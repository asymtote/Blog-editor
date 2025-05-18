import { Blog } from '../types';

// Mock API URLs - replace with real API endpoints
const API_URL = 'http://localhost:3001/api';

// Helper function for handling fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Fetch all blogs (both published and drafts)
export const fetchAllBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await fetch(`${API_URL}/blogs`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // For demo purposes, return mock data if API fails
    return getMockBlogs();
  }
};

// Fetch a single blog by ID
export const fetchBlogById = async (id: string): Promise<Blog> => {
  try {
    const response = await fetch(`${API_URL}/blogs/${id}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching blog:', error);
    // For demo purposes, find mock blog if API fails
    const mockBlogs = getMockBlogs();
    const blog = mockBlogs.find(blog => blog.id === id);
    if (blog) return blog;
    throw new Error('Blog not found');
  }
};

// Save a blog as a draft
export const saveBlogDraft = async (blog: Partial<Blog>): Promise<Blog> => {
  const url = blog.id 
    ? `${API_URL}/blogs/${blog.id}/save-draft` 
    : `${API_URL}/blogs/save-draft`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving draft:', error);
    // For demo purposes, create a mock blog if API fails
    return createOrUpdateMockBlog({ ...blog, status: 'draft' });
  }
};

// Publish a blog
export const publishBlog = async (blog: Partial<Blog>): Promise<Blog> => {
  const url = blog.id 
    ? `${API_URL}/blogs/${blog.id}/publish` 
    : `${API_URL}/blogs/publish`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error publishing blog:', error);
    // For demo purposes, create a mock blog if API fails
    return createOrUpdateMockBlog({ ...blog, status: 'published' });
  }
};

// Mock data functions for demo purposes
// These functions simulate backend storage using localStorage

const STORAGE_KEY = 'blog_editor_mock_data';

const getMockBlogs = (): Blog[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    const initialData = [
      {
        id: '1',
        title: 'Getting Started with React and TypeScript',
        content: '<p>This is a sample blog post about React and TypeScript. TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.</p><h2>Why TypeScript?</h2><p>TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor. Catch errors early in your editor.</p><h2>React with TypeScript</h2><p>React and TypeScript make a powerful combination. When used together, they help catch many bugs early in development.</p>',
        tags: ['React', 'TypeScript', 'Frontend'],
        status: 'published',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Introduction to TailwindCSS',
        content: '<p>TailwindCSS is a utility-first CSS framework that can be composed to build any design, directly in your markup.</p><h2>Why Tailwind?</h2><p>Tailwind provides low-level utility classes that let you build completely custom designs without ever leaving your HTML.</p><h2>Getting Started</h2><p>To get started with Tailwind, you can install it via npm or yarn and then configure it to your needs.</p>',
        tags: ['CSS', 'TailwindCSS', 'Frontend'],
        status: 'published',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'My Thoughts on Next.js',
        content: '<p>This is a draft blog post about Next.js, the React framework for production.</p>',
        tags: ['React', 'Next.js'],
        status: 'draft',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(storedData);
};

const createOrUpdateMockBlog = (blogData: Partial<Blog>): Blog => {
  const blogs = getMockBlogs();
  const now = new Date().toISOString();
  
  // If blog has an ID, update it
  if (blogData.id) {
    const index = blogs.findIndex(blog => blog.id === blogData.id);
    if (index !== -1) {
      const updatedBlog = {
        ...blogs[index],
        ...blogData,
        updated_at: now
      };
      blogs[index] = updatedBlog as Blog;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
      return updatedBlog as Blog;
    }
  }
  
  // Otherwise create a new blog
  const newBlog: Blog = {
    id: Date.now().toString(),
    title: blogData.title || 'Untitled Blog',
    content: blogData.content || '',
    tags: blogData.tags || [],
    status: blogData.status || 'draft',
    created_at: now,
    updated_at: now
  };
  
  blogs.push(newBlog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  return newBlog;
};