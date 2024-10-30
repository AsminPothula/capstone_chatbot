// Element References
const chatButton = document.getElementById('chat-button');
const chatBox = document.getElementById('chat-box');
const toggleSizeBtn = document.getElementById('toggle-size-btn');
const collapseBtn = document.getElementById('collapse-btn');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Get profile picture URLs from data attributes
const chatContent = document.getElementById('chat-content');
const userPicUrl = chatContent.getAttribute('data-user-pic');
const botPicUrl = chatContent.getAttribute('data-bot-pic');

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
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', sender);

    // Create profile picture element
    const profilePic = document.createElement('img');
    profilePic.classList.add('profile-pic-small');
    profilePic.src = sender === 'user' ? userPicUrl : botPicUrl; // Use the URLs from data attributes

    // Create message bubble element
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message', sender);

    // Add message content, linkifying URLs if the sender is bot
    if (sender === 'bot') {
        const linkedText = linkify(text); // Convert URLs in bot text to clickable links
        messageBubble.innerHTML = linkedText;
    } else {
        messageBubble.textContent = text;
    }

    // Append profile picture and message bubble based on sender
    if (sender === 'user') {
        messageRow.appendChild(messageBubble);
        messageRow.appendChild(profilePic); // User profile on the right
    } else {
        messageRow.appendChild(profilePic); // Bot profile on the left
        messageRow.appendChild(messageBubble);
    }

    // Add the message row to the messages container
    messagesDiv.appendChild(messageRow);

    // Scroll to the bottom of the chat
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

//done - add thin black circle around the user and ot profile pi
//don't - add blaze and pixel rigth above messages 
//chnage the banner to remove P and say chat with PIXEL (logo style)
//add the chat with pixel attraction thing for the webiste - or ask dowbts 
//done - add shadow to typing area and banner
//add the wave thing with - cse senior deisg help 

//future work:
// when inetregated into tje porject management tool, the chatbot shows that specific user's name with ther user query and that will be stored in memomry/databse for that sepcific user so the chatbot has context of the user's work/project/doubts/issues.
//database to store all the user queries and reponses and train model on that again - continuous 
//was this reponsse hlpful or not option tp improve the reposne (store seperately in database and train acc)

