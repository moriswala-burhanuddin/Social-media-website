from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden ,HttpResponse
from .forms import SignupForm, LoginForm, PostForm, ProfileForm, CommentForm
from .models import Post, Profile, Like, Comment, FriendRequest, Notification, Message 
from django.db.models import Q
from django.db.models import Max
from django.template import loader


# Automatically create a Profile object for every new user
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'profile'):  # Check if the user already has a profile
        Profile.objects.create(user=instance)

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()  # This will create the user
            login(request, user)  # Log the user in immediately after signup
            return redirect('create_profile')  # Redirect to profile creation page
    else:
        form = SignupForm()
    return render(request, 'app/signup.html', {'form': form})




def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index')  # Redirect to profile page after login
    else:
        form = LoginForm() 
    return render(request, 'app/login.html', {'form': form})

@login_required
def create_profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)  # Profile will only be created once

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')  # Redirect to the user profile page after saving
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'app/create_profile.html', {'form': form, 'profile': profile})



def home(request):
    if not request.user.is_authenticated:
        return render(request, 'app/inpage.html')  # Show the introduction page for unauthenticated users

    # Existing logic for logged-in users
    posts = Post.objects.all().order_by('-created_at')
    profile = Profile.objects.get(user=request.user)

    messages = (
        Message.objects.filter(receiver=profile)
        .values('sender')
        .annotate(latest_message=Max('timestamp'))
        .order_by('-latest_message')
    )

    latest_messages = Message.objects.filter(
        timestamp__in=[m['latest_message'] for m in messages]
    ).select_related('sender__user', 'sender')

    for post in posts:
        post.is_liked = post.is_liked_by_user(request.user)

    friend_requests = FriendRequest.objects.filter(receiver=request.user, accepted=False)
    notifications = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')

    return render(request, 'app/index.html', {
        'posts': posts,
        'profile': profile,
        'notifications': notifications,
        'friend_requests': friend_requests,
        'messages': latest_messages,
    })

def index(request):
    if not request.user.is_authenticated:
        return render(request, 'app/inpage.html')  # Show the introduction page for unauthenticated users

    # Existing logic for logged-in users
    posts = Post.objects.all().order_by('-created_at')
    profile = Profile.objects.get(user=request.user)

    messages = (
        Message.objects.filter(receiver=profile)
        .values('sender')
        .annotate(latest_message=Max('timestamp'))
        .order_by('-latest_message')
    )

    latest_messages = Message.objects.filter(
        timestamp__in=[m['latest_message'] for m in messages]
    ).select_related('sender__user', 'sender')

    for post in posts:
        post.is_liked = post.is_liked_by_user(request.user)

    friend_requests = FriendRequest.objects.filter(receiver=request.user, accepted=False)
    notifications = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')

    return render(request, 'app/index.html', {
        'posts': posts,
        'profile': profile,
        'notifications': notifications,
        'friend_requests': friend_requests,
        'messages': latest_messages,
    })


@login_required
def create_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        
        if form.is_valid():
            # Create a new post object but don't save it yet
            post = form.save(commit=False)
            
            # Attach the user to the post
            post.user = request.user
            
            # If YouTube URL is provided, save the YouTube video ID
            if form.cleaned_data.get('youtube_url'):
                post.youtube_video_id = form.cleaned_data['youtube_url']
            else:
                # No YouTube URL, so save the media files (image or video)
                if not post.image and not post.video:
                    form.add_error(None, "Please upload a media file or provide a YouTube URL.")
                    return render(request, 'app/create_post.html', {'form': form})
            
            # Save the post to the database
            post.save()
            
            # Redirect to the home page after successful post creation
            return redirect('home')
        else:
            print(form.errors)  # Debugging: print form errors to the console

    else:
        form = PostForm()

    return render(request, 'app/create_post.html', {'form': form})


def user_logout(request):
    logout(request)
    return redirect('login')  # Redirect to login page


@login_required
def user_profile(request):
    # Get the user's profile
    profile = get_object_or_404(Profile, user=request.user)
    
    # Fetch only the posts that belong to the logged-in user
    posts = Post.objects.filter(user=request.user).order_by('-created_at')  # Order by most recent posts

    # Get the friends of the logged-in user
    friends = profile.friends.all()  # This fetches the friends (Many-to-Many field)

    return render(request, 'app/profile.html', {
        'profile': profile,
        'posts': posts,
        'friends': friends  # Pass the friends to the template
    })

@login_required
@login_required
def like_post(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:  # If the like already exists, delete it
            like.delete()
            liked = False
        else:
            liked = True
            # Optionally create a notification
            if post.user != request.user:
                Notification.objects.create(
                    user=post.user,
                    post=post,
                    notification_type='like',
                    message=f"{request.user.username} liked your post."
                )

        # Get the updated like count
        likes_count = post.like_set.count()

        return JsonResponse({'likes_count': likes_count, 'liked': liked})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)



@login_required
def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    if request.method == 'POST':
        text = request.POST.get('text')
        comment = Comment.objects.create(user=request.user, post=post, text=text)

        # Create a notification for the post owner if not the commenter
        if post.user != request.user:
            Notification.objects.create(
                user=post.user,
                post=post,
                notification_type='comment',
                message=f"{request.user.username} commented on your post: '{text[:20]}...'"
            )

        comment_html = f'<p><b>{comment.user.username}:</b> {comment.text}</p>'
        return JsonResponse({'comment_html': comment_html})

    return redirect('home')


@login_required
def update_views(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    post.views += 1
    post.save()
    return JsonResponse({'views': post.views})


# @login_required
# def index(request):
#     posts = Post.objects.all().order_by('-created_at')  # Fetch all posts, ordered by creation date
#     profile = Profile.objects.get(user=request.user)   # Get the profile of the logged-in user
    
#     # Fetch unread notifications for the logged-in user
#     notifications = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')

#     # Fetch friend requests dynamically (this seems to fetch all other profiles - adjust if needed)
#     friend_requests = Profile.objects.exclude(user=request.user)  # Exclude the logged-in user's profile
    
#     return render(request, 'app/index.html', {
#         'posts': posts,
#         'profile': profile,
#         'notifications': notifications,  # Include notifications in the context
#         'friend_requests': friend_requests,  # Pass friend requests to the template
#     })


def chat(request):
    return render(request, 'app/chat.html')

def chatbox(request):
    return render(request, 'app/chatbox.html')


def search_profiles(request):
    query = request.GET.get('query', '').strip()  # Get the search query
    profiles = Profile.objects.filter(user__username__icontains=query) if query else []  # Search profiles by username
    return render(request, 'app/search_results.html', {'profiles': profiles, 'query': query})




@login_required
def post_detail(request, post_id):
    profile = get_object_or_404(Profile, user=request.user)
    post = get_object_or_404(Post, id=post_id)

    # Increment the views count
    post.views += 1
    post.save()

    # Check if the user has liked the post
    post.is_liked = post.like_set.filter(user=request.user).exists()

    comments = Comment.objects.filter(post=post).order_by('-created_at')  # Get all comments for this post
    other_posts = Post.objects.exclude(id=post_id).order_by('-created_at')  # Exclude the current post
    
    return render(request, 'app/post_detail.html', {
        'profile': profile,
        'post': post,
        'comments': comments,
        'other_posts': other_posts,
    })



# Settings page
def settings(request):
    profile = get_object_or_404(Profile, user=request.user)  # Replace Profile with your model name
    context = {'profile': profile}
    return render(request, 'app/settings.html', context)

# Delete post page
def delete_post(request):
    profile = get_object_or_404(Profile, user=request.user)  # Fetch the user's profile
    posts = Post.objects.filter(user=request.user)  # Fetch all posts by the logged-in user
    return render(request, 'app/delete_post.html', {'posts': posts, 'profile': profile})

# Handle post deletion
def delete_post_action(request, post_id):
    post = get_object_or_404(Post, id=post_id, user=request.user)  # Ensure the user owns the post
    post.delete()
    return redirect('delete_post')

@login_required
def user_comments(request):
    user_comments = Comment.objects.filter(user=request.user)
    profile = get_object_or_404(Profile, user=request.user)
    context = {
        'user_comments': user_comments,
        'profile': profile,

    }
    return render(request, 'app/comments.html', context)

# View to display all posts the user has liked
@login_required
def user_likes(request):
    # Get all posts liked by the user
    profile = get_object_or_404(Profile, user=request.user)
    liked_posts = Like.objects.filter(user=request.user).values_list('post', flat=True)
    liked_posts = Post.objects.filter(id__in=liked_posts)
    context = {
        'liked_posts': liked_posts,
        'profile': profile,
    }
    return render(request, 'app/likes.html', context)

def all_posts(request):
    profile = None
    if request.user.is_authenticated:
        profile = get_object_or_404(Profile, user=request.user)  # Fetch the user's profile if logged in

    posts = Post.objects.all().order_by('-created_at')  # Fetch all posts, ordered by creation date
    return render(request, 'app/all_posts.html', {'posts': posts, 'profile': profile})

@login_required
def fetch_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]  # Fetch the 10 most recent notifications
    return render(request, 'app/notifications.html', {'notifications': notifications})

@login_required
def send_friend_request(request, user_id):
    # Get the profile of the user to whom the request is being sent
    receiver = get_object_or_404(User, id=user_id)
    
    if receiver != request.user:  # Ensure a user cannot send a request to themselves
        # Check if a friend request already exists
        existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, accepted=False)
        
        if not existing_request.exists():
            # Create a new FriendRequest if none exists
            FriendRequest.objects.create(sender=request.user, receiver=receiver)

    return redirect('view_profile', user_id=user_id)
    
@login_required
def accept_friend_request(request, request_id):
    # Get the friend request
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver=request.user)

    # Accept the friend request and add both users as friends
    friend_request.accepted = True
    friend_request.save()

    # Add both users as friends (bi-directional relationship)
    friend_request.sender.profile.friends.add(friend_request.receiver.profile)
    friend_request.receiver.profile.friends.add(friend_request.sender.profile)

    # Now the users are friends, redirect to the profile of the user who sent the request
    return redirect('view_profile', user_id=friend_request.sender.id)



@login_required
def decline_friend_request(request, request_id):
    # Get the friend request
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver=request.user)

    # Decline the request by deleting it
    friend_request.decline_request()

    # Redirect to the friend requests page (or profile page)
    return redirect('friend_requests')

@login_required
def remove_friend(request, friend_id):
    # Get the profile of the logged-in user
    profile = request.user.profile
    
    # Get the friend's profile
    friend_profile = get_object_or_404(Profile, id=friend_id)
    
    # Remove the friend from the user's friend list
    profile.friends.remove(friend_profile)
    
    # Optionally, remove the user from the friend's friend list as well (bi-directional removal)
    friend_profile.friends.remove(profile)
    
    # Redirect back to the friend list page
    return redirect('friends_list')

@login_required
def view_profile(request, user_id):
    profile = get_object_or_404(Profile, user__id=user_id)  # Fetch profile by user ID
    posts = Post.objects.filter(user=profile.user)  # Fetch posts by this user

    # Check if the current user has already sent a request and if it's pending
    sent_request = FriendRequest.objects.filter(sender=request.user, receiver=profile.user, accepted=False).first()

    # Check if the current user is already friends with the profile user
    is_friend = request.user.profile.friends.filter(id=profile.user.id).exists()

    # Check if the current user has received a friend request from this user
    received_request = FriendRequest.objects.filter(sender=profile.user, receiver=request.user, accepted=False).first()

    # Determine if the user should see the 'Decline Friend' button
    is_friend_request_pending = FriendRequest.objects.filter(sender=profile.user, receiver=request.user, accepted=False).exists()

    return render(request, 'app/other_profile.html', {
        'profile': profile,
        'posts': posts,
        'sent_request': sent_request,
        'received_request': received_request,
        'is_friend': is_friend,
        'is_friend_request_pending': is_friend_request_pending
    })


@login_required
def friend_requests(request):
    # Fetch all friend requests where the logged-in user is the receiver and the request is not accepted
    requests = FriendRequest.objects.filter(receiver=request.user, accepted=False)

    return render(request, 'app/friend_requests.html', {'requests': requests})



@login_required
def friends_list(request):
    # Get the profile of the logged-in user
    profile = request.user.profile
    
    # Fetch all friends of the logged-in user
    friends = profile.friends.all()  # This will return a QuerySet of friends

    return render(request, 'app/friends_list.html', {'friends': friends})

def base_view(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]
    return render(request, 'app/base.html', {
        'notifications': notifications,
    })


@login_required
def messages(request):
    # Get the current user's profile
    user_profile = request.user.profile

    # Get the friends of the user
    friends = user_profile.friends.all()

    # Pass the friends list to the template
    return render(request, 'app/messages.html', {
        'friends': friends,
    })


@login_required
def chat_detail(request, pk):
    # Fetch the friend's profile using the provided `pk`
    friend_profile = get_object_or_404(Profile, id=pk)
    user_profile = request.user.profile  # Get the current user's profile

    # Query messages between the user and the friend
    messages = Message.objects.filter(
        (Q(sender=user_profile) & Q(receiver=friend_profile)) |
        (Q(sender=friend_profile) & Q(receiver=user_profile))
    ).order_by('timestamp')

    # Handle sending a message
    if request.method == 'POST':
        content = request.POST.get('content')
        if content:
            Message.objects.create(
                sender=user_profile,
                receiver=friend_profile,
                content=content
            )
            return redirect('chat_detail', pk=friend_profile.id)

    # Render the chat page
    return render(request, 'app/chat_detail.html', {
        'friend': friend_profile,
        'messages': messages,
    })


@login_required
def share_post(request, post_id):
    if request.method == "POST":
        # Get the post and selected friend
        post = get_object_or_404(Post, id=post_id)
        friend_id = request.POST.get('friend_id')
        friend_profile = get_object_or_404(Profile, id=friend_id)

        # Ensure the selected friend is valid
        if not request.user.profile.friends.filter(id=friend_id).exists():
            return HttpResponseForbidden("You are not friends with this user.")

        # Create a shared message (including media)
        shared_message = f"Check out this post by {post.user.username}: {post.caption}"
        
        # Create a new message with the post content, image/video if available
        new_message = Message.objects.create(
            sender=request.user.profile,
            receiver=friend_profile,
            content=shared_message
        )

        # Attach media (image or video) to the message
        if post.image:
            new_message.image = post.image
        if post.video:
            new_message.video = post.video
        
        # Save the message with the media attached
        new_message.save()

        return redirect('chat_detail', pk=friend_profile.id)

    return HttpResponseForbidden("Invalid request method.")


def Theme(request):
    return render(request, 'app/theme.html')