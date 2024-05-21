const express = require('express');
const multer = require('multer');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

require('./db/mongoose');

const app = express();
const port = process.env.PORT;
app.get('/', (req, res) => {
  res.send('app is running');
});

const upload = multer({
  dest: 'images', // dest => destination
});

app.post('/upload', upload.single('upload'), (req, res) => {
  res.send();
});

app.use(express.json()); // Parse incoming json request into object and can access the req.body
app.use(userRouter);
app.use(taskRouter);

// const myFunction = async () => {
//   const password = 'Samiul1234';
//   const hashedPassword = await bcrypt.hash(password, 8);
//   console.log(password);
//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare('samiul1234', hashedPassword);
//   console.log(isMatch);
// };

// const myFunction = async () => {
//   const token = jwt.sign({ id: 'abcd123' }, 'thisIsJsonwebtoken');
//   console.log(token);
// };
// const myFunction = async () => {
//   // const task = await Task.findById('664613e8029f458a4bb62f38');
//   // await task.populate('owner');
//   // console.log(task.owner);

//   const user = await User.findById('66460bf416fc7d5448c52d6d');
//   await user.populate('tasks');
//   console.log(user.tasks);
// };
// myFunction();

app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
