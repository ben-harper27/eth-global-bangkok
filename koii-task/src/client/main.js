// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
