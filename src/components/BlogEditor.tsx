import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import { saveBlogDraft, publishBlog, fetchBlogById } from '../services/blogService';
import { Blog } from '../types';

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Partial<Blog>>({
    title: '',
    content: '',
    tags: [],
    status: 'draft'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load blog if editing an existing one
  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await fetchBlogById(id);
          setBlog(data);
        } catch (error) {
          console.error('Failed to fetch blog:', error);
          toast.error('Failed to load blog');
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };

    loadBlog();
  }, [id, navigate]);

  // Auto-save function
  const debouncedSave = useCallback(
    async (blogData: Partial<Blog>) => {
      if (!blogData.title && !blogData.content) return;

      setSaving(true);
      try {
        const updatedBlog = await saveBlogDraft(blogData);
        setBlog(prevBlog => {
          if (prevBlog.id === updatedBlog.id) return prevBlog;
          return { ...prevBlog, id: updatedBlog.id };
        });
        setLastSaved(new Date());
        toast.success('Draft saved automatically');

        if (!id && updatedBlog.id) {
          window.history.replaceState(null, '', `/editor/${updatedBlog.id}`);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Failed to auto-save draft');
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  // Set up debounce on blog changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (blog.title || blog.content) {
      timerRef.current = setTimeout(() => {
        debouncedSave(blog);
        timerRef.current = null;
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [blog.title, blog.content, debouncedSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlog(prev => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (content: string) => {
    setBlog(prev => ({ ...prev, content }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!blog.tags?.includes(newTag)) {
        setBlog(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveDraft = async () => {
    if (!blog.title && !blog.content) {
      toast.warning('Please add a title or content before saving');
      return;
    }

    setSaving(true);
    try {
      const updatedBlog = await saveBlogDraft(blog);
      setBlog(prev => ({ ...prev, id: updatedBlog.id }));
      setLastSaved(new Date());
      toast.success('Draft saved successfully');

      if (!id && updatedBlog.id) {
        navigate(`/editor/${updatedBlog.id}`);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!blog.title) {
      toast.warning('Please add a title before publishing');
      return;
    }

    if (!blog.content || blog.content.length < 50) {
      toast.warning('Please add more content before publishing');
      return;
    }

    setSaving(true);
    try {
      await publishBlog(blog);
      toast.success('Blog published successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to publish blog:', error);
      toast.error('Failed to publish blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Blogs
        </button>

        <div className="flex items-center space-x-2">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saving && (
            <span className="flex items-center text-sm text-gray-500">
              <Loader2 className="animate-spin h-4 w-4 mr-1" />
              Saving...
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={blog.title}
          onChange={handleTitleChange}
          className="w-full text-3xl font-bold text-gray-800 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 pb-2 mb-4"
        />

        <div className="mb-6">
          <Editor
            apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
            value={blog.content}
            onEditorChange={handleContentChange}
            init={{
              height: 400,
              menubar: false,
              readonly: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar:
                'undo redo | formatselect | bold italic forecolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | removeformat | help',
              content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px }',
              branding: false,
              promotion: false
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {blog.tags?.map((tag, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 text-sm rounded-full px-3 py-1 flex items-center">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="w-full border-0 focus:ring-0 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {saving ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;