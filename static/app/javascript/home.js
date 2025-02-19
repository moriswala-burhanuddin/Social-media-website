// Sidebar Menu Items
const menuitems = document.querySelectorAll('.menu-item-2');

// Messages
const messagesnotification = document.querySelector('#messages-notifications');
const messages = document.querySelector('.messages');
const message = document.querySelectorAll('.message');
const messagesearch = document.querySelector('#message-search');

// Theme
const theme = document.querySelector('#theme');
const themeModal = document.querySelector('.customize-theme');
const fontSizes = document.querySelectorAll('.choose-size span');
const colorSpans = document.querySelectorAll('.choose-color span');
const backgroundDivs = document.querySelectorAll('.choose-bg > div');

// Remove Active Class for Sidebar
const changeActiveItem = () => {
    menuitems.forEach(item => {
        item.classList.remove('active');
    });
};

menuitems.forEach(item => {
    item.addEventListener('click', () => {
        changeActiveItem();
        item.classList.add('active');
        if (item.id !== 'Notifications') {
            document.querySelector('.notifications-popup').style.display = 'none';
        } else {
            document.querySelector('.notifications-popup').style.display = 'block';
            document.querySelector('#Notifications .Notification-count').style.display = 'none';
        }
    });
});

// Small Screen Notification Logic
const smallNotificationsIcon = document.getElementById("SmallNotifications");
const smallNotificationsPopup = document.querySelector(".notifications-popup-small");

// Toggle notifications popup visibility on click
smallNotificationsIcon.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    if (smallNotificationsPopup.style.display === "block") {
        smallNotificationsPopup.style.display = "none";
    } else {
        smallNotificationsPopup.style.display = "block";
    }
    const notificationCount = smallNotificationsIcon.querySelector(".notification-count");
    if (notificationCount) {
        notificationCount.style.display = 'none'; // Clear the notification count
    }
});

// Messages Notification
messagesnotification.addEventListener('click', () => {
    messages.style.boxShadow = '0 0 1rem var(--color-primary)';
    messagesnotification.querySelector('.Notification-count').style.display = 'none';
    setTimeout(() => {
        messages.style.boxShadow = 'none';
    }, 2000);
});

// Search Messages
const searchMessage = () => {
    const val = messagesearch.value.toLowerCase();
    message.forEach(chat => {
        const h5Elements = chat.querySelectorAll('h5');
        let isMatch = false;
        h5Elements.forEach(h5 => {
            const name = h5.textContent.toLowerCase();
            if (name.includes(val)) {
                isMatch = true;
            }
        });
        chat.style.display = isMatch ? 'flex' : 'none';
    });
};

messagesearch.addEventListener('keyup', searchMessage);

// Apply Stored Theme
const applyStoredTheme = () => {
    const root = document.documentElement;
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
        document.querySelector('html').style.fontSize = fontSize;
    }

    const primaryColor = localStorage.getItem('primary-color');
    if (primaryColor) {
        root.style.setProperty('--color-primary', primaryColor);
    }

    const backgroundColors = JSON.parse(localStorage.getItem('background-colors'));
    if (backgroundColors) {
        Object.keys(backgroundColors).forEach(key => {
            root.style.setProperty(key, backgroundColors[key]);
        });
    }
};

// Call the function to apply stored theme settings
applyStoredTheme();

// Theme Modal Logic
document.addEventListener('DOMContentLoaded', function () {
    const themeButtonLarge = document.querySelector('#theme');  // Theme button in large sidebar
    const themeButtonSmall = document.querySelector('#theme2'); // Theme button in small sidebar
    const themeModal = document.querySelector('.customize-theme');
    const closeThemeModalButton = document.querySelector('.close-theme-modal');
    const root = document.documentElement;

    // Function to open the theme modal
    const openThemeModal = () => {
        themeModal.style.display = 'grid'; // Show the theme modal
    };

    // Event listener for the "Theme" button in large sidebar
    themeButtonLarge.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the default behavior
        openThemeModal(); // Open the theme modal
    });

    // Event listener for the "Theme" button in small sidebar
    themeButtonSmall.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the default behavior
        openThemeModal(); // Open the theme modal
    });

    // Function to close the theme modal when clicked outside of it
    const closeThemeModal = (e) => {
        if (e.target.classList.contains('customize-theme') || e.target.classList.contains('close-theme-modal')) {
            themeModal.style.display = 'none';
        }
    };

    // Event listener to close modal when clicked outside of it
    themeModal.addEventListener('click', closeThemeModal);
    closeThemeModalButton.addEventListener('click', () => {
        themeModal.style.display = 'none'; // Close modal when 'X' is clicked
    });
});

fontSizes.forEach(size => {
    size.addEventListener('click', () => {
        let fontSize;
        removesizeselector();
        size.classList.toggle('active');

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

        document.querySelector('html').style.fontSize = fontSize;
        localStorage.setItem('font-size', fontSize);
    });
});

// Function to remove 'active' class from all elements in a NodeList
function removeActiveClass(elements) {
    elements.forEach(element => element.classList.remove('active'));
}

// Function to set primary color and store it in localStorage
function setPrimaryColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', color);
    localStorage.setItem('primary-color', color);
}

// Function to set background colors and store them in localStorage
function setBackgroundColors(colors) {
    const root = document.documentElement;
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


// Sidebar Toggle Logic
document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const body = document.querySelector('body'); 

    // Toggle Sidebar
    function handleToggle() {
        if (window.innerWidth < 1200) {
            sidebar.classList.toggle('active');
            themeModal.style.display = 'none';  // Close theme modal when sidebar is toggled
        }
    }

    // Close Sidebar on Click Outside
    function handleClickOutside(event) {
        if (window.innerWidth < 1200) {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
                sidebar.classList.remove('active');
                themeModal.style.display = 'none';  // Close theme modal if clicking outside
            }
        }
    }

    if (window.innerWidth < 1200) {
        toggleButton.style.display = 'block'; 
        toggleButton.addEventListener('click', handleToggle);
        document.addEventListener('click', handleClickOutside);
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth < 1200) {
            toggleButton.style.display = 'block';
            document.addEventListener('click', handleClickOutside);
        } else {
            toggleButton.style.display = 'none';
            sidebar.classList.remove('active');
            themeModal.style.display = 'none'; // Ensure the theme modal is closed on larger screens
            document.removeEventListener('click', handleClickOutside);
        }
    });
});

// Comment Form Submission Logic
document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const postId = this.dataset.postId;

        // Prevent duplicate form submissions
        if (this.classList.contains('submitting')) {
            return;
        }

        this.classList.add('submitting');
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
            const commentSection = this.closest('.comments');
            commentSection.insertAdjacentHTML('beforeend', data.comment_html);
            this.reset();
            this.classList.remove('submitting');
        })
        .catch(error => {
            console.error('Error posting comment:', error);
            this.classList.remove('submitting');
        });
    });
});

// Toggle Comments
function toggleComments(button) {
    const postId = button.getAttribute('data-post-id');
    const commentList = document.getElementById(`comments-${postId}`);
    
    if (commentList.style.display === "none" || commentList.style.display === "") {
        commentList.style.display = "block";
        button.textContent = "Hide Comments";
    } else {
        commentList.style.display = "none";
        button.textContent = "Show Comments";
    }
}

// Autoplay Videos When Visible
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play();
                video.muted = true;
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5
    });

    videos.forEach(video => {
        observer.observe(video);
    });
});


