
import { supabase } from './supabase.js';

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const taskMessage = document.getElementById('task-message');
const addTaskBtn = document.getElementById('add-task-btn');

let currentUser = null;
let allTasks = [];
let currentFilter = 'all';

async function initialize() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = data.user;

    const email = currentUser.email || 'User';
    document.getElementById('sidebar-email').textContent = email;
    document.getElementById('top-email').textContent = email;
    document.getElementById('user-avatar').textContent =
        email.charAt(0).toUpperCase();

    await loadTasks();
}

async function loadTasks() {
    taskList.textContent = 'Loading your tasks...';

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        taskMessage.textContent = error.message;
        taskList.textContent = 'Unable to load tasks.';
        return;
    }

    allTasks = data || [];
    updateStats();
    renderTasks();
}

function updateStats() {
    const total = allTasks.length;
    const completed = allTasks.filter(task => task.is_completed).length;
    const pending = total - completed;

    document.getElementById('total-count').textContent = total;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('completed-count').textContent = completed;
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = allTasks.filter(task => {
        if (currentFilter === 'pending') return !task.is_completed;
        if (currentFilter === 'completed') return task.is_completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'tf-empty';
        empty.textContent = currentFilter === 'all'
            ? 'No tasks yet. Add your first task above!'
            : 'No tasks found in this section.';
        taskList.appendChild(empty);
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('article');
        card.className = 'tf-task-card';

        if (task.is_completed) {
            card.classList.add('is-completed');
        }

        const content = document.createElement('div');
        content.className = 'tf-task-content';

        const title = document.createElement('h3');
        title.textContent = task.title;

        const description = document.createElement('p');
        description.textContent = task.description || 'No description added.';

        const status = document.createElement('span');
        status.className = task.is_completed
            ? 'tf-status done'
            : 'tf-status';
        status.textContent = task.is_completed ? 'Completed' : 'Pending';

        const date = document.createElement('small');
        date.textContent = task.created_at
            ? new Date(task.created_at).toLocaleString()
            : '';

        content.append(title, description, status, date);

        const actions = document.createElement('div');
        actions.className = 'tf-task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.is_completed
            ? 'Mark Pending'
            : '✓ Complete';
        completeBtn.addEventListener('click', () => {
            updateTask(task.id, !task.is_completed);
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tf-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actions.append(completeBtn, editBtn, deleteBtn);
        card.append(content, actions);
        taskList.appendChild(card);
    });
}

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentUser) return;

    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        taskMessage.textContent = 'Please enter a task title.';
        return;
    }

    addTaskBtn.disabled = true;
    addTaskBtn.textContent = 'Adding...';
    taskMessage.textContent = '';

    const { error } = await supabase.from('tasks').insert({
        user_id: currentUser.id,
        title,
        description
    });

    if (error) {
        taskMessage.textContent = error.message;
    } else {
        taskForm.reset();
        currentFilter = 'all';
        updateActiveNavigation();
        await loadTasks();
    }

    addTaskBtn.disabled = false;
    addTaskBtn.textContent = '＋ Add Task';
});

async function updateTask(id, completed) {
    const { error } = await supabase
        .from('tasks')
        .update({ is_completed: completed })
        .eq('id', id);

    if (error) {
        taskMessage.textContent = error.message;
    } else {
        await loadTasks();
    }
}

async function editTask(task) {
    const newTitle = prompt('Edit task title:', task.title);

    if (newTitle === null || !newTitle.trim()) return;

    const newDescription = prompt(
        'Edit task description:',
        task.description || ''
    );

    if (newDescription === null) return;

    const { error } = await supabase
        .from('tasks')
        .update({
            title: newTitle.trim(),
            description: newDescription.trim()
        })
        .eq('id', task.id);

    if (error) {
        taskMessage.textContent = error.message;
    } else {
        await loadTasks();
    }
}

async function deleteTask(id) {
    const confirmed = confirm('Do you want to delete this task?');

    if (!confirmed) return;

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        taskMessage.textContent = error.message;
    } else {
        await loadTasks();
    }
}

function updateActiveNavigation() {
    document.querySelectorAll('.tf-nav-item').forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.filter === currentFilter
        );
    });

    const heading = {
        all: 'Dashboard',
        pending: 'Pending Tasks',
        completed: 'Completed Tasks'
    };

    document.getElementById('page-heading').textContent =
        heading[currentFilter];

    document.getElementById('task-section-title').textContent =
        currentFilter === 'all' ? 'My Tasks' : heading[currentFilter];
}

document.querySelectorAll('.tf-nav-item').forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        updateActiveNavigation();
        renderTasks();
    });
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        taskMessage.textContent = error.message;
        return;
    }

    window.location.href = 'index.html';
});

initialize();
