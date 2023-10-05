const express = require('express');
const fetch = require('node-fetch');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

const blogApiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

// Cache for storing the results
const cache = {
  blogData: null,
  blogStats: null,
};

// Middleware to fetch blog data from the provided API
const fetchBlogData = async () => {
  try {
    if (cache.blogData) {
      return cache.blogData; // Return cached data if available
    }

    const response = await fetch(blogApiUrl, {
      method: 'GET',
      headers: {
        'x-hasura-admin-secret': adminSecret,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog data');
    }

    const blogData = await response.json();
    cache.blogData = blogData; // Cache the data
    return blogData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Middleware to calculate blog statistics
const calculateBlogStats = async () => {
  try {
    if (cache.blogStats) {
      return cache.blogStats; // Return cached data if available
    }

    const blogData = await fetchBlogData();

    if (!Array.isArray(blogData.blogs)) {
      throw new Error('Invalid data structure');
    }

    const totalBlogs = blogData.blogs.length;
    const longestBlog = _.maxBy(blogData.blogs, 'title.length');
    const blogsWithPrivacy = blogData.blogs.filter(blog =>
      blog.title && blog.title.toLowerCase().includes('privacy')
    );
    const uniqueTitles = _.uniqBy(blogData.blogs, 'title');

    const blogStats = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : '',
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles: uniqueTitles.map(blog => blog.title),
    };

    cache.blogStats = blogStats; // Cache the data
    return blogStats;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Data Retrieval Route
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogStats = await calculateBlogStats();
    res.json(blogStats);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Blog Search Endpoint
app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "query" is required' });
  }

  try {
    const blogData = await fetchBlogData();

    if (!Array.isArray(blogData.blogs)) {
      return res.status(500).json({ error: 'Invalid data structure' });
    }

    // Custom search implementation
    const matchingBlogs = blogData.blogs.filter(blog =>
      blog.title && blog.title.toLowerCase().includes(query.toLowerCase())
    );

    // Return a JSON response with the search results
    const response = {
      count: matchingBlogs.length,
      blogs: matchingBlogs,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
