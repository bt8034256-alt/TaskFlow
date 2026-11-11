
import { supabase } from './supabase.js';

const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const submitBtn = document.getElementById('submit-btn');
const toggleBtn = document.getElementById('toggle-btn');
const toggleMessage = document.getElementById('toggle-message');
const message = document.getElementById('message');

let isSignup = false;

// Switch between Login and Signup
toggleBtn.addEventListener('click', () => {

    isSignup = !isSignup;

    message.textContent = '';

    if (isSignup) {
        formTitle.textContent = 'Create Account';
        formSubtitle.textContent = 'Sign up to manage your personal tasks.';
        submitBtn.textContent = 'Sign Up';
        toggleMessage.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Login';
    } else {
        formTitle.textContent = 'Welcome Back';
        formSubtitle.textContent = 'Login to access your personal dashboard.';
        submitBtn.textContent = 'Login';
        toggleMessage.textContent = "Don't have an account?";
        toggleBtn.textContent = 'Sign Up';
    }
});

// Signup and Login
authForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';

    message.textContent = '';

    try {

        let result;

        if (isSignup) {

            result = await supabase.auth.signUp({
                email: email,
                password: password
            });

        } else {

            result = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

        }

        if (result.error) {
            throw result.error;
        }

        if (isSignup) {

            if (result.data.session) {
                message.style.color = 'green';
                message.textContent = 'Account created successfully!';

                window.location.href = 'dashboard.html';

            } else {
                message.style.color = 'green';
                message.textContent =
                    'Account created! Please verify your email before login.';
            }

        } else {

            message.style.color = 'green';
            message.textContent = 'Login successful!';

            window.location.href = 'dashboard.html';

        }

    } catch (error) {

        message.style.color = 'red';
        message.textContent = error.message;

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? 'Sign Up' : 'Login';

    }

});
