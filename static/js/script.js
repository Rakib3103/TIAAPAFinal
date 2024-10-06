const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const refreshButton = document.querySelector("#refresh-btn");
const microphoneButton = document.querySelector("#microphone-btn");

let recognition;
let isRecognizing = false;

// Initialize the SpeechRecognition object
const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    // recognition.lang = 'bn-BD', 'en-US'; 
    recognition.lang = 'en-US'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isRecognizing = true;
        microphoneButton.classList.add('active');
    };

    recognition.onend = () => {
        isRecognizing = false;
        microphoneButton.classList.remove('active');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript; // Insert the transcribed text into the chat input
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        recognition.stop();
    };
};

// Start and stop speech recognition
const toggleSpeechRecognition = () => {
    if (isRecognizing) {
        recognition.stop();
    } else {
        recognition.start();
    }
};

// Initialize the speech recognition when the page loads
initializeSpeechRecognition();

// Add event listener for the microphone button
microphoneButton.addEventListener("click", toggleSpeechRecognition);

// Load previous chats from localStorage
const loadDataFromLocalStorage = () => {
    const savedChats = localStorage.getItem("all-chats");

    if (savedChats) {
        chatContainer.innerHTML = savedChats;
    }

    // Always show the default text
    showDefaultText();
};

// Show default text if no chat history is found
const showDefaultText = () => {
    const defaultText = `<div class="default-text">
                            <h1>টিয়া আপা</h1>
                            <p>আপাকে জিজ্ঞেস করুন।<br> আপনার চ্যাট এখানে প্রদর্শিত হবে।</p>
                        </div>`;
    if (!chatContainer.innerHTML.trim()) {
        chatContainer.innerHTML = defaultText;
    }
};

// Create a chat element (for both user and assistant messages)
const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Function to send the message to the Flask backend and display the response
const sendMessage = async () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Display user's question
    const userChat = createChatElement(`<div class="chat-content">
                                            <div class="chat-details">
                                                <img src="/static/images/user.jpg" alt="user-img">
                                                <p>${userText}</p>
                                            </div>
                                        </div>`, "outgoing");
    chatContainer.appendChild(userChat);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Clear the input field
    chatInput.value = "";

    // Send request to the server
    const response = await fetch('/ask', {  // Use the correct endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userText }),  // Simplified to match your example
    });

    if (!response.ok) {
        console.error("Error while sending message:", response.statusText);
        return;
    }

    const data = await response.json();
    // Display assistant's response
    const botChat = createChatElement(`<div class="chat-content">
                                            <div class="chat-details">
                                                <img src="/static/images/FixedPinwheel.png" alt="assistant-img">
                                                <p>${data.response}</p>
                                            </div>
                                        </div>`, "incoming");
    chatContainer.appendChild(botChat);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Store the conversation in localStorage
    localStorage.setItem("all-chats", chatContainer.innerHTML);
};

// Refresh chat history (reset chats)
const refreshChats = () => {
    // Clear the chat container and show the default text
    chatContainer.innerHTML = "";
    showDefaultText();
};

// Event listeners for sending messages and handling chat actions
sendButton.addEventListener("click", sendMessage);
refreshButton.addEventListener("click", refreshChats);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Load previous chats from localStorage
loadDataFromLocalStorage();
