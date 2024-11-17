// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Get button elements
    const bobButton = document.querySelector('.login-btn.bob');
    const aliceButton = document.querySelector('.login-btn.alice');

    // Add click handlers
    bobButton.addEventListener('click', () => login('bob'));
    aliceButton.addEventListener('click', () => login('alice'));

    // Check for previous login
    const previousUser = localStorage.getItem('currentUser');
    if (previousUser) {
        login(previousUser);
    }

    // Chat elements
    const sendButton = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    // Get initial question from the agent
    try {
        const response = await fetch('http://localhost:8000/v1/agent');
        const initialQuestion = await response.text();
        appendMessage(initialQuestion, 'ai');
    } catch (error) {
        console.error('Error getting initial question:', error);
    }

    // Send message handler
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Display user message
        appendMessage(message, 'user');
        userInput.value = '';

        try {
            const response = await fetch('http://localhost:8000/v1/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            const aiResponse = await response.text();
            appendMessage(aiResponse, 'ai');
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('Sorry, there was an error processing your message.', 'ai');
        }
    }

    function appendMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

async function login(username) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        
        // Update UI
        const userInfo = document.getElementById('userInfo');
        const usernameElement = document.getElementById('username');
        
        userInfo.style.display = 'block';
        usernameElement.textContent = username.charAt(0).toUpperCase() + username.slice(1);
        
        // Store the user in localStorage
        localStorage.setItem('currentUser', username);

        console.log(data.message); // Log success message
        
    } catch (error) {
        console.error('Error during login:', error);
        // You might want to show an error message to the user here
    }
}
