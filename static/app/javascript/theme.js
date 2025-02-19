document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const body = document.querySelector('body'); // Add this line

    // Function to handle toggle
    function handleToggle() {
        if (window.innerWidth < 1200) {
            sidebar.classList.toggle('active');
        }
    }

    // Function to close sidebar if clicked outside
    function handleClickOutside(event) {
        if (window.innerWidth < 1200) {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    }

    // Initial setup
    if (window.innerWidth < 1200) {
        toggleButton.style.display = 'block'; // Ensure toggle button is visible
        toggleButton.addEventListener('click', handleToggle);
        document.addEventListener('click', handleClickOutside); // Add event listener for clicks
    }

    // Handle window resize events to adjust visibility
    window.addEventListener('resize', function () {
        if (window.innerWidth < 1200) {
            toggleButton.style.display = 'block';
            document.addEventListener('click', handleClickOutside); // Ensure event listener is added on resize
        } else {
            toggleButton.style.display = 'none';
            sidebar.classList.remove('active'); // Hide sidebar if larger than 1200px
            document.removeEventListener('click', handleClickOutside); // Remove event listener if not needed
        }
    });
});

    document.querySelectorAll('.like-icon').forEach(icon => {
        const postId = icon.dataset.postId;
    
        // Check localStorage for liked status on page load
        if (localStorage.getItem(`liked-${postId}`) === 'true') {
            icon.classList.add('liked');
            icon.classList.remove('unliked');
        } else {
            icon.classList.add('unliked');
            icon.classList.remove('liked');
        }
    
        icon.addEventListener('click', function() {
            fetch(`/like/${postId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': '{{ csrf_token }}'
                }
            })
            .then(response => response.json())
            .then(data => {
                // Toggle the classes to change the color
                if (data.liked) {
                    this.classList.remove('unliked');
                    this.classList.add('liked');
                    // Store the liked status in localStorage
                    localStorage.setItem(`liked-${postId}`, 'true');
                } else {
                    this.classList.remove('liked');
                    this.classList.add('unliked');
                    // Store the unliked status in localStorage
                    localStorage.setItem(`liked-${postId}`, 'false');
                }
                
                // Update the like count
                document.getElementById(`like-count-${postId}`).innerText = `${data.likes_count} Likes`;
            });
        });
    });
    
    
    
    document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();  // Prevent the default form submission
                const postId = this.dataset.postId;
                const formData = new FormData(this);
    
                fetch(`/comment/${postId}/`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Insert the new comment into the comment section
                    const commentSection = this.closest('.comments');
                    commentSection.insertAdjacentHTML('beforeend', data.comment_html);
                    this.reset();  // Reset the form
                });
            });
        });
    
        document.addEventListener('DOMContentLoaded', () => {
        // Get all video elements
        const videos = document.querySelectorAll('video');
    
        // Create an IntersectionObserver to track visibility of videos
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
    
                // Check if the video is in view
                if (entry.isIntersecting) {
                    video.play(); // Autoplay the video when it's in view
                    video.muted = true; // Optional: mute the video by default
                } else {
                    video.pause(); // Pause the video when it's out of view
                }
            });
        }, {
            threshold: 0.5 // Trigger when 50% of the video is visible
        });
    
        // Observe each video
        videos.forEach(video => observer.observe(video));
    });
    
    function toggleMute(postId) {
        // Get the video and button elements
        var video = document.getElementById('post-video-' + postId);
        var muteButton = document.getElementById('mute-btn-' + postId);
    
        // Check if the video exists
        if (video) {
            // Toggle the muted property
            if (video.muted) {
                video.muted = false;
                muteButton.innerText = 'Mute';
            } else {
                video.muted = true;
                muteButton.innerText = 'Unmute';
            }
        } else {
            console.error("Video not found for post ID:", postId);
        }
    }
    function toggleComments(button) {
    const postId = button.getAttribute('data-post-id'); // Fetch post.id from the button's data attribute
    const commentList = document.getElementById(`comments-${postId}`);
    
    // Toggle visibility of the comments list
    if (commentList.style.display === "none" || commentList.style.display === "") {
        commentList.style.display = "block";
        button.textContent = "Hide Comments";
    } else {
        commentList.style.display = "none";
        button.textContent = "Show Comments";
    }
}

 // Apply stored theme settings when the page is loaded
const applyStoredTheme = () => {
const root = document.documentElement; // Root element to apply CSS variables

// Apply stored font size
const fontSize = localStorage.getItem('font-size');
if (fontSize) {
    document.querySelector('html').style.fontSize = fontSize;
}

// Apply stored primary color
const primaryColor = localStorage.getItem('primary-color');
if (primaryColor) {
    root.style.setProperty('--color-primary', primaryColor);
}

// Apply stored background colors
const backgroundColors = JSON.parse(localStorage.getItem('background-colors'));
if (backgroundColors) {
    Object.keys(backgroundColors).forEach(key => {
        root.style.setProperty(key, backgroundColors[key]);
    });
}
};

// Call the function to apply stored theme settings
applyStoredTheme();

// Theme selection logic
document.addEventListener('DOMContentLoaded', () => {
const theme = document.querySelector('#theme');
const themeModal = document.querySelector('.customize-theme');
const fontSizes = document.querySelectorAll('.choose-size span'); // Font size elements
const colorSpans = document.querySelectorAll('.choose-color span'); // Color elements
const backgroundDivs = document.querySelectorAll('.choose-bg > div'); // Background elements
const root = document.documentElement; // Root element to apply CSS variables

// Open theme modal function
const openThemeModal = () => {
    themeModal.style.display = 'grid';
};

// Close theme modal function
const closeThemeModal = (e) => {
    if (e.target.classList.contains('customize-theme')) {
        themeModal.style.display = 'none';
    }
};

// Event listeners for opening and closing the modal
themeModal.addEventListener('click', closeThemeModal);
theme.addEventListener('click', openThemeModal);

// Handle font size change
const removesizeselector = () => {
    fontSizes.forEach(size => {
        size.classList.remove('active');
    });
};

fontSizes.forEach(size => {
    size.addEventListener('click', () => {
        let fontSize;
        removesizeselector();
        size.classList.toggle('active');

        // Set font size based on the clicked element
        if (size.classList.contains('font-size-1')) {
            fontSize = "10px";
            root.style.setProperty('--sticky-top-left', '5.4rem');
            root.style.setProperty('--sticky-top-right', '5.4rem');
        } else if (size.classList.contains('font-size-2')) {
            fontSize = "13px";
            root.style.setProperty('--sticky-top-left', '5.4rem');
            root.style.setProperty('--sticky-top-right', '-7rem');
        } else if (size.classList.contains('font-size-3')) {
            fontSize = "16px";
            root.style.setProperty('--sticky-top-left', '-2rem');
            root.style.setProperty('--sticky-top-right', '-17rem');
        } else if (size.classList.contains('font-size-4')) {
            fontSize = "19px";
            root.style.setProperty('--sticky-top-left', '-5rem');
            root.style.setProperty('--sticky-top-right', '-25rem');
        } else if (size.classList.contains('font-size-5')) {
            fontSize = "22px";
            root.style.setProperty('--sticky-top-left', '-10rem');
            root.style.setProperty('--sticky-top-right', '-33rem');
        }

        // Apply font size to root HTML and store in localStorage
        document.querySelector('html').style.fontSize = fontSize;
        localStorage.setItem('font-size', fontSize);
    });
});

// Function to remove 'active' class from all elements in a NodeList
function removeActiveClass(elements) {
    elements.forEach(element => element.classList.remove('active'));
}

// Function to set the primary color and store it in localStorage
function setPrimaryColor(color) {
    root.style.setProperty('--color-primary', color);
    localStorage.setItem('primary-color', color);
}

// Function to set background colors and store them in localStorage
function setBackgroundColors(colors) {
    Object.keys(colors).forEach(key => {
        root.style.setProperty(key, colors[key]);
    });
    localStorage.setItem('background-colors', JSON.stringify(colors));
}

// Add click event listeners for color spans
colorSpans.forEach((span, index) => {
    span.addEventListener('click', () => {
        removeActiveClass(colorSpans);
        span.classList.add('active');

        // Set primary color based on the clicked color span
        switch (index) {
            case 0:
                setPrimaryColor('hsl(252, 75%, 60%)');
                break;
            case 1:
                setPrimaryColor('hsl(52, 75%, 60%)');
                break;
            case 2:
                setPrimaryColor('hsl(352, 75%, 60%)');
                break;
            case 3:
                setPrimaryColor('hsl(152, 75%, 60%)');
                break;
            case 4:
                setPrimaryColor('hsl(202, 75%, 60%)');
                break;
            default:
                break;
        }
    });
});

// Add click event listeners for background divs
backgroundDivs.forEach((div, index) => {
    div.addEventListener('click', () => {
        removeActiveClass(backgroundDivs);
        div.classList.add('active');

        // Set background colors based on the clicked background div
        switch (index) {
            case 0:
                setBackgroundColors({
                    '--color-white': 'hsl(252, 30%, 100%)',
                    '--color-light': 'hsl(252, 30%, 95%)',
                    '--color-dark': 'hsl(252, 30%, 17%)',
                    '--color-black': 'hsl(252, 30%, 10%)'
                });
                break;
            case 1:
                setBackgroundColors({
                    '--color-white': 'hsl(252, 30%, 17%)',
                    '--color-light': 'hsl(252, 30%, 10%)',
                    '--color-dark': 'hsl(252, 30%, 95%)',
                    '--color-black': 'hsl(252, 30%, 100%)'
                });
                break;
            case 2:
                setBackgroundColors({
                    '--color-white': 'hsl(252, 30%, 10%)',
                    '--color-light': 'hsl(252, 30%, 5%)',
                    '--color-dark': 'hsl(252, 30%, 90%)',
                    '--color-black': 'hsl(252, 30%, 100%)'
                });
                break;
            default:
                break;
        }
    });
});
});

 $(document).ready(function () {
            // Scroll to the bottom when the page loads
            const chatMessages = $('.chat-messages1');
            chatMessages.scrollTop(chatMessages[0].scrollHeight);

            // Handle infinite scrolling (load older messages when user scrolls up)
            chatMessages.on('scroll', function () {
                if (chatMessages.scrollTop() === 0) {
                    loadOlderMessages();
                }
            });

            // Function to load older messages
            function loadOlderMessages() {
                const firstMessageId = $('.message1').first().data('message-id');
                $.ajax({
                    url: "{% url 'load_older_messages' pk=friend.id %}",
                    data: { 'first_message_id': firstMessageId },
                    success: function (data) {
                        // Prepend older messages to the chat container
                        chatMessages.prepend(data.html);
                    }
                });
            }
        });