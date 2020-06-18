const router = require('express').Router();
const Todo = require('../models/todo')
const verify_token = require('../validators/token_verification/verify_token');
const Auth = require('../models/auth');
const incrementAPIUsage = require('../routes/log_usage');

// get all todos
router.get('/', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        //const auth = await Auth.findOne({ email: req.user.email });
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ status: 'failed', message: 'Invalid user' });
        }

        const todos = await Todo.find({ user_id: auth._id, removed: false }, { removed: 0 }).sort([
            ['createdAt', 'descending']
        ]);


        return res.status(200).json({ status: 'success', message: 'Fetched all todos', todos: todos });
    } catch (err) {
        console.log('unable to fetch a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

// create a todo
router.post('/', verify_token, incrementAPIUsage, async(req, res) => {

    try {
        //        const auth = await Auth.findOne({ email: req.user.email });
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ status: 'failed', message: 'User details not found' });
        }
        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ status: 'failed', message: 'Required params - title and description cannot be null' })
        }
        const todo = Todo({
            user_id: auth._id,
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            due_on: req.body.due_on,
        });

        await todo.save();
        //        incrementAPIUsage(auth._id);
        return res.status(201).json({ status: 'success', message: 'Created todo', todo: todo });
    } catch (err) {
        console.log('unable to create a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }

})

// update a todo
router.patch('/', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todo_id) {
            return res.status(400).json({ status: 'failed', message: 'Required params cannot be null' });
        }
        const todo = await Todo.findById(req.body.todo_id);
        if (!todo) {
            return res.status(404).json({ status: 'failed', message: 'Invalid todo id or todo not found' });
        }

        // update things
        if (req.body.title) {
            todo.title = req.body.title;
        }
        if (req.body.description) {
            todo.description = req.body.description;
        }
        if (req.body.image) {
            todo.image = req.body.image;
        }
        if (req.body.due_on) {
            todo.due_on = req.body.due_on;
        }

        await todo.save();
        return res.status(200).json({ status: 'success', message: 'Todo updated', todo: todo });
    } catch (err) {
        console.log('unable to update a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

// fetch all pending todos
router.get('/pending', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        //const auth = await Auth.findOne({ email: req.user.email });
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ status: 'failed', message: 'Invalid user' });
        }

        const todos = await Todo.find({
            user_id: auth._id,
            removed: false,
            status: "Pending"
        }, { removed: 0 }).sort([
            ['createdAt', 'descending']
        ]);

        return res.status(200).json({ status: 'success', message: 'Fetched all pending todos', todos: todos });
    } catch (err) {
        console.log('unable to fetch all pending todos');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

// get all completed todos
router.get('/completed', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        //const auth = await Auth.findOne({ email: req.user.email });
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ status: 'failed', message: 'Invalid user' });
        }

        const todos = await Todo.find({
            user_id: auth._id,
            removed: false,
            status: "Completed"
        }, { removed: 0 }).sort([
            ['createdAt', 'descending']
        ]);


        return res.status(200).json({ status: 'success', message: 'Fetched all completed todos', todos: todos });
    } catch (err) {
        console.log('unable to fetch all completed todos');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

// mark as completed
router.patch('/complete', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todo_id) {
            return res.status(400).json({ status: 'failed', message: 'Required params cannot be null' });
        }
        const todo = await Todo.findById(req.body.todo_id);
        if (!todo) {
            return res.status(404).json({ status: 'failed', message: 'Invalid todo id or todo not found' });
        }

        todo.status = "Completed";
        const date = new Date();
        todo.completed_on = date;

        //        incrementAPIUsage(todo.user_id);

        await todo.save();
        return res.status(200).json({ status: 'success', message: 'Todo marked as completed', todo: todo });
    } catch (err) {
        console.log('unable to mark a todo as completed');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

// remove a todo
router.post('/remove', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todo_id) {
            return res.status(400).json({ status: 'failed', message: 'Required params cannot be null' });
        }
        const todo = await Todo.findById(req.body.todo_id);
        if (!todo) {
            return res.status(404).json({ status: 'failed', message: 'Invalid todo id or todo not found' });
        }

        todo.removed = true;

        await todo.save();
        return res.status(200).json({ status: 'success', message: 'Todo removed' });
    } catch (err) {
        console.log('unable to remove a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})


// create multiple todos at once
router.post('/many', verify_token, incrementAPIUsage, async(req, res) => {

    try {
        // const auth = await Auth.findOne({ email: req.user.email });
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ status: 'failed', message: 'User details not found' });
        }
        if (!req.body.todos) {
            return res.status(400).json({ 
                status: 'failed',
                message: 'Todos array cannot be null' })
        }

        const insertTodos = Array();
        req.body.todos.forEach(element => {
            insertTodos.push(Todo({
                user_id: auth._id,
                title: element.title,
                description: element.description,
                image: element.image,
                due_on: element.due_on                
            }));
        });
        await Todo.insertMany(insertTodos);

        return res.status(201).json({ status: 'success', message: 'Created todos', todo: todo });
    } catch (err) {
        console.log('unable to create a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }

})


// update multiple todos at once
router.patch('/many', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todo_id) {
            return res.status(400).json({ 
                status: 'failed', 
                message: 'Required params cannot be null' });
        }

        const todo = await Todo.findById(req.body.todo_id);
        if (!todo) {
            return res.status(404).json({ 
                status: 'failed', 
                message: 'Invalid todo id or todo not found' });
        }

        // update things
        if (req.body.title) {
            todo.title = req.body.title;
        }
        if (req.body.description) {
            todo.description = req.body.description;
        }
        if (req.body.image) {
            todo.image = req.body.image;
        }
        if (req.body.due_on) {
            todo.due_on = req.body.due_on;
        }

        await todo.save();
        return res.status(200).json({ status: 'success', message: 'Todo updated', todo: todo });
    } catch (err) {
        console.log('unable to update a todo');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})


// delete multiple todos at once
router.post('/remove/many', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todos) {
            return res.status(400).json({
                 status: 'failed', 
                 message: 'todo ids cannot be null' });
        }

        const reqIds = req.body.todos;
        if(typeof(reqIds) === Array){
            await Todo.updateMany({ "_id": { $in: reqIds } }, { $set: { removed: true } });
        }else{
            return res.status(400).json({ status: 'failed', message: 'Invalid todo ids array' });
        }

        return res.status(200).json({ status: 'success', message: 'Todos removed' });
    } catch (err) {
        console.log('unable to remove todos');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})


// mark multiple todos as completed at once
router.patch('/complete/many', verify_token, incrementAPIUsage, async(req, res) => {
    try {
        if (!req.body.todos) {
            return res.status(400).json({ status: 'failed', message: 'Todo ids cannot be null' });
        }

        const date = new Date();

        const reqIds = req.body.todos;
        if(typeof(reqIds) === Array){
            await Todo.updateMany({ "_id": { $in: reqIds } }, { $set: { status: "Completed", completed_on: date } });
        }else{
            return res.status(400).json({ status: 'failed', message: 'Invalid todo ids array' });
        }

        return res.status(200).json({ status: 'success', message: 'Todos marked as completed', todo: todo });
    } catch (err) {
        console.log('unable to mark todos as completed');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err })
    }
})

module.exports = router;