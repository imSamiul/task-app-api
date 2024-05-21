const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

// const me = new Users({
//   name: 'Prodhan',
//   age: 24,
//   email: 'prodhan@prodhan.com',
//   password: 'Pro hassword',
// });

// const task1 = new Tasks({ description: 'Code 6 hours', completed: true });

// task1
//   .save()
//   .then((res) => console.log(res))
//   .catch((error) => console.log('Error:', error));
