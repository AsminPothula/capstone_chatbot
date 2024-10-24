// Element References
const chatButton = document.getElementById('chat-button');
const chatBox = document.getElementById('chat-box');
const toggleSizeBtn = document.getElementById('toggle-size-btn');
const collapseBtn = document.getElementById('collapse-btn');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Chat Box State
let chatState = 'collapsed'; // 'collapsed', 'normal', 'maximized'

// Event Listeners
chatButton.addEventListener('click', () => {
    chatBox.classList.remove('collapsed', 'maximized');
    chatBox.classList.add('normal');
    chatState = 'normal';
    updateToggleSizeBtn();
});

collapseBtn.addEventListener('click', () => {
    chatBox.classList.remove('normal', 'maximized');
    chatBox.classList.add('collapsed');
    chatState = 'collapsed';
});

toggleSizeBtn.addEventListener('click', () => {
    if (chatState === 'normal') {
        // Maximize the chatbox
        chatBox.classList.remove('normal');
        chatBox.classList.add('maximized');
        chatState = 'maximized';
    } else if (chatState === 'maximized') {
        // Minimize the chatbox back to normal size
        chatBox.classList.remove('maximized');
        chatBox.classList.add('normal');
        chatState = 'normal';
    }
    updateToggleSizeBtn();
});

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Functions
function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    // Display User Message
    displayMessage(messageText, 'user');
    userInput.value = '';

    // Send Message to Backend
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
    })
    .then(response => response.json())
    .then(data => {
        // Display Bot Response
        displayMessage(data.reply, 'bot');
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Sorry, something went wrong.', 'bot');
    });
}

function displayMessage(text, sender) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message', sender);

    if (sender === 'bot') {
        // Convert URLs in the text to clickable links
        const linkedText = linkify(text);
        messageBubble.innerHTML = linkedText;
    } else {
        messageBubble.textContent = text;
    }

    messagesDiv.appendChild(messageBubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to convert URLs to clickable links
function linkify(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
}

function updateToggleSizeBtn() {
    if (chatState === 'normal') {
        // Show maximize icon
        toggleSizeBtn.textContent = '▭';
    } else if (chatState === 'maximized') {
        // Show minimize icon
        toggleSizeBtn.textContent = '▢';
    }
}
