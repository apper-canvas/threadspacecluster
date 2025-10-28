import usersData from "@/services/mockData/users.json";

let users = [...usersData];
let nextId = Math.max(...users.map(u => u.Id), 0) + 1;

// Helper to calculate karma from posts and comments
const calculateUserKarma = (username) => {
  // Import here to avoid circular dependency
  const { PostService } = require('@/services/api/postService');
  const { CommentService } = require('@/services/api/commentService');
  
  try {
    const commentService = new CommentService();
    const userComments = commentService.comments.filter(c => c.author === username);
    const commentKarma = userComments.reduce((sum, c) => sum + (c.score || 0), 0);
    
    const allPosts = PostService.posts || [];
    const userPosts = allPosts.filter(p => p.author === username);
    const postKarma = userPosts.reduce((sum, p) => sum + (p.score || 0), 0);
    
    return postKarma + commentKarma;
  } catch (error) {
    return 0;
  }
};

export const UserService = {
  getAll() {
    return users.map(user => ({
      ...user,
      karma: calculateUserKarma(user.username)
    }));
  },

  getById(id) {
    if (!Number.isInteger(id)) {
      throw new Error('User ID must be an integer');
    }
    const user = users.find(u => u.Id === id);
    if (!user) {
      return null;
    }
    return {
      ...user,
      karma: calculateUserKarma(user.username)
    };
  },

  getByUsername(username) {
    if (!username || typeof username !== 'string') {
      return null;
    }
    const user = users.find(u => u.username === username);
    if (!user) {
      return null;
    }
    return {
      ...user,
      karma: calculateUserKarma(user.username)
    };
  },

  getUserActivity(username) {
    const { PostService } = require('@/services/api/postService');
    const { CommentService } = require('@/services/api/commentService');
    
    try {
      const commentService = new CommentService();
      const allPosts = PostService.posts || [];
      const userPosts = allPosts.filter(p => p.author === username);
      const userComments = commentService.comments.filter(c => c.author === username);
      
      return {
        posts: userPosts,
        comments: userComments,
        totalActivity: userPosts.length + userComments.length
      };
    } catch (error) {
      return { posts: [], comments: [], totalActivity: 0 };
    }
  },

  getCommentsByUser(username) {
    const { CommentService } = require('@/services/api/commentService');
    try {
      const commentService = new CommentService();
      return commentService.comments.filter(c => c.author === username);
    } catch (error) {
      return [];
    }
  },

  getVotesByUser(username) {
    // In a real app, this would fetch vote history from backend
    // For now, return empty array as votes are stored per-post/comment
    return [];
  },

  create(userData) {
    const newUser = {
      ...userData,
      Id: nextId++,
      joinDate: new Date().toISOString(),
      karma: 0
    };
    delete newUser.Id;
    newUser.Id = nextId - 1;
    users.push(newUser);
    return { ...newUser };
  },

  update(id, userData) {
    if (!Number.isInteger(id)) {
      throw new Error('User ID must be an integer');
    }
    const index = users.findIndex(u => u.Id === id);
    if (index === -1) {
      return null;
    }
    users[index] = {
      ...users[index],
      ...userData,
      Id: users[index].Id,
      joinDate: users[index].joinDate
    };
    return { ...users[index] };
  },

  delete(id) {
    if (!Number.isInteger(id)) {
      throw new Error('User ID must be an integer');
    }
    const index = users.findIndex(u => u.Id === id);
    if (index === -1) {
      return false;
    }
    users.splice(index, 1);
    return true;
  }
};