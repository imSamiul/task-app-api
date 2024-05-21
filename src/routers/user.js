const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mkdirp = require('mkdirp');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { sendMail, sendCancellationMail } = require('../emails/account');

const router = express.Router();

// CREATE user
router.post('/users', async (req, res) => {
  const { name, email, password, age } = req.body;

  const createUser = new User({
    name,
    email,
    age,
    password,
  });

  try {
    const createUserSave = await createUser.save();
    if (createUser) {
      const token = await createUser.generateAuthToken();
      const sendMailRes = await sendMail(name, email);
      res.status(201).send({ createUserSave, token, sendMailRes });
    } else {
      res.status(401).send('Invalid signup credentials'); // Handle failed signUp
    }
  } catch (error) {
    res.status(400).send(error);
  }

  // createUser
  //   .save()
  //   .then((res2) => {
  //     res.status(201).send(res2);
  //   })
  //   .catch((error) => {
  //     res.status(400).send(error);
  //   });
});

// READ all users
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);

  // User.find({})
  //   .then((users) => {
  //     res.status(200).send(users);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });
});
// READ specific user by using id
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }

  // User.findById(id)
  //   .then((user) => {
  //     if (!user) {
  //       res.status(404).send();
  //     }
  //     res.status(200).send(user);
  //   })
  //   .catch((error) => {
  //     res.status(400).send(error);
  //   });
});
// UPDATE user
router.patch('/users/me', auth, async (req, res) => {
  const allowedUpdates = ['name', 'age', 'password', 'email'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperation) {
    return res
      .status(400)
      .send('request body is invalid with unacceptable key');
  }
  // new:true => it will create new user after updating the existing user.
  // runValidators : true => it will validate my update. For example if i try to update anything that doesn't exist in database then it will throw error.
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    if (!req.user) {
      return res.status(404).send('nothing to update');
    }
    return res.status(200).send(req.user);
  } catch (error) {
    return res.status(400).send(error);
  }
});
// DELETE user
router.delete('/users/me', auth, async (req, res) => {
  try {
    const deletedUser = await User.deleteByIdAndDeleteTasks(req.user.id);

    if (!deletedUser) {
      return res.status(404).send({ error: 'User not found' });
    }
    const result = await sendCancellationMail(
      deletedUser.name,
      deletedUser.email,
    );

    return res.status(200).send({ deletedUser, result });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Login User
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const loginSuccessfulUser = await User.findByCredentials(email, password);
    if (loginSuccessfulUser) {
      // Check if login was successful
      const token = await loginSuccessfulUser.generateAuthToken(); // Call the function on the user object
      res.send({ loginSuccessfulUser, token }); // Include the generated token in the response
    } else {
      res.status(401).send('Invalid login credentials'); // Handle failed login
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Logout User from current device
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token,
    );
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// Logout User from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

const storage = multer.memoryStorage();
const avatar = multer({
  storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    // cb ==> callback
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    return cb(undefined, true);
    // cb(new Error('File must be a PDF'));
    // cb(undefined, true);
    // cb(undefined, false);
  },
});
router.post(
  '/users/me/avatar',
  auth,
  avatar.single('avatar'),
  async (req, res) => {
    console.log('Uploaded file:', req.file.buffer);
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  },
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
