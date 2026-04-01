const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const registerUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  userModel.findUserByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      userModel.createUser(full_name, email, hashedPassword, 'user', (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Registration failed', error: err });
        }

        return res.status(201).json({ message: 'User registered successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  userModel.findUserByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.user_id,
          name: user.full_name,
          email: user.email,
        },
      });

    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  });
};

module.exports = {
  registerUser,
  loginUser
};