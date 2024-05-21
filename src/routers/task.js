const express = require('express');
const Task = require('../model/task');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
  const { description, completed } = req.body;
  const createTask = new Task({ description, completed, owner: req.user });
  try {
    const createTaskSave = await createTask.save();
    res.status(201).send(createTaskSave);
  } catch (error) {
    res.status(400).send(error);
  }
  // createTask
  //   .save()
  //   .then((res2) => {
  //     res.status(201).send(res2);
  //   })
  //   .catch((error) => {
  //     res.status(400).send(error);
  //   });
});

// GET /tasks?completed=true
// GET .tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    // const allTasks = await Task.find({});

    // const filteredTask = allTasks.filter(
    //   (task) => task.owner.toString() === req.user.id,
    // );
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit, 10),
        skip: parseInt(req.query.skip, 10),
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.statusCode(500).send(error);
  }

  // Task.find({})
  //   .then((tasks) => {
  //     res.status(200).send(tasks);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });
});
router.get('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  // console.log(
  //   `id: ${req.params.id} or ${id} and user/owner id: ${req.user.id}`,
  // );
  try {
    // const task = await Task.findById(id);
    const task = await Task.findOne({ _id: id, owner: req.user.id });

    if (!task) {
      return res.status(404).send('No task found!');
    }
    return res.status(200).send(task);
  } catch (error) {
    return res.status(500).send(error);
  }
  // Task.findById(id)
  //   .then((task) => {
  //     if (!task) {
  //       res.status(404).send();
  //     }
  //     res.status(200).send(task);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  const allowedUpdates = ['description', 'completed'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperation) {
    return res
      .status(400)
      .send('request body is invalid with unacceptable key');
  }

  try {
    const updatedTask = await Task.findOne({ _id: id, owner: req.user.id });

    // const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    if (!updatedTask) {
      return res.status(404).send('no task found');
    }
    updates.forEach((update) => {
      updatedTask[update] = req.body[update];
    });
    await updatedTask.save();

    return res.status(200).send(updatedTask);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });
    if (!deletedTask) {
      return res.status(400).send('No task found for delete');
    }
    return res.status(400).send(deletedTask);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
