import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { trigger, transition, style, animate } from '@angular/animations';
import * as anime from 'animejs';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('formFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('cardFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('messageFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('dropdownFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('errorFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('modalFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('200ms', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('notificationFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('200ms', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  isLogin: boolean = true;
  showForgotPassword: boolean = false;
  showResetPassword: boolean = false;
  showProfileModal: boolean = false;
  loginModel: { email: string; password: string } = { email: '', password: '' };
  signupModel: { email: string; username: string; password: string; bio: string } = { email: '', username: '', password: '', bio: '' };
  forgotPasswordModel: { email: string } = { email: '' };
  resetPasswordModel: { email: string; token: string; newPassword: string } = { email: '', token: '', newPassword: '' };
  profileModel: { username: string; bio: string } = { username: '', bio: '' };
  userId: string | null = null;
  chats: any[] = [];
  selectedChatId: string  = "";
  messages: any[] = [];
  newMessage: string = '';
chatColors: string[] = [
  '#6412a7ff', // pink-100
  '#e8d823ff', // yellow-100
  '#19e861ff', // green-100
  '#287ff0ff', // blue-100
  '#5a39eeff', // purple-100
  '#2cb2ecff', // red-100
  '#567bf5ff', // indigo-100
  '#f29a27ff', // orange-100
  '#a9e82cff'  // lime-100
];


  users: any[] = [];
  showNewChatDropdown: boolean = false;
  selectedNewChatUserId: string | null = null;
  loginError: string | null = null;
  signupError: string | null = null;
  forgotPasswordError: string | null = null;
  forgotPasswordMessage: string | null = null;
  resetPasswordError: string | null = null;
  profileError: string | null = null;
  notificationMessage: string | null = null;
  private notificationSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private chatService: ChatService) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userId = this.authService.getUserId();
    if (this.isAuthenticated) {
      this.profileModel.username = this.authService.getUsername() ?? '';
      this.profileModel.bio = this.authService.getBio() ?? '';
      this.loadUsers();
      this.loadChats();
      // Simulate incoming messages for notifications
      this.notificationSubscription = interval(10000).subscribe(() => {
        if (this.chats.length > 0 && this.isAuthenticated) {
          const randomChat = this.chats[Math.floor(Math.random() * this.chats.length)];
          this.addMockMessage(randomChat.id, randomChat.username);
        }
      });
    }
    // Parse query parameters for reset password
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? '';
    const email = params.get('email') ?? '';
    if (token && email) {
      this.showResetPassword = true;
      this.isLogin = false;
      this.showForgotPassword = false;
      this.resetPasswordModel.email = email;
      this.resetPasswordModel.token = token;
    }
    this.initializeGoogleSignIn();
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  loadUsers() {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter((u: any) => u.id !== this.userId);
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  loadChats() {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.chats = users
          .filter((u: any) => u.id !== this.userId)
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            lastMessage: '',
            unreadMessages: 0
          }));
      },
      error: (err) => console.error('Error fetching chats:', err)
    });
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
    if (this.showProfileModal) {
      anime({
        targets: '.fixed.inset-0',
        opacity: [0, 1],
        scale: [0.8, 1],
        easing: 'easeOutQuad',
        duration: 300
      });
    }
  }

  toggleNewChatDropdown() {
    this.showNewChatDropdown = !this.showNewChatDropdown;
    if (this.showNewChatDropdown) {
      anime({
        targets: '.relative',
        translateY: [10, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 200
      });
    }
  }

  startNewChat() {
    if (this.selectedNewChatUserId) {
      this.selectChat(this.selectedNewChatUserId);
      this.showNewChatDropdown = false;
      this.selectedNewChatUserId = null;
    }
  }

  selectChat(id: string) {
    this.selectedChatId = id;
    this.chatService.getMessages(id).subscribe({
      next: (messages) => {
        this.messages = messages.map((msg: any) => ({
          ...msg,
          senderUsername: this.getUsernameById(msg.senderId)
        }));
        const chat = this.chats.find(c => c.id === id);
        if (chat) {
          chat.unreadMessages = 0; // Clear unread messages
        }
      },
      error: (err) => console.error('Error fetching messages:', err)
    });
  }

  login() {
    this.clearErrors();
    if (!this.loginModel.email || !this.loginModel.password) {
      this.loginError = 'Email and password are required.';
      return;
    }
    if (!this.loginModel.email.includes('@')) {
      this.loginError = 'Please enter a valid email address.';
      return;
    }
    if (this.loginModel.password.length <4) {
      this.loginError = 'Password must be at least 4 characters long.';
      return;
    }
    this.loginModel.email = this.loginModel.email.toLowerCase().trim();

    this.authService.login(this.loginModel).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.userId = this.authService.getUserId();
        this.profileModel.username = this.authService.getUsername() ?? '';
        this.profileModel.bio = this.authService.getBio() ?? '';
        this.loadUsers();
        this.loadChats();
      },
      error: (err) => {
        this.loginError = err.error || 'Login failed. Please try again.';
        console.error('Login error:', err);
      }
    });
  }

  signup() {
    this.clearErrors();
    if (!this.signupModel.email || !this.signupModel.username || !this.signupModel.password) {
      this.signupError = 'Email, username, and password are required.';
      return;
    }
    if (!this.signupModel.email.includes('@')) {
      this.signupError = 'Please enter a valid email address.';
      return;
    }
    if (this.signupModel.password.length < 4) {
      this.signupError = 'Password must be at least 4 characters long.';
      return;
    }
    this.signupModel.email = this.signupModel.email.toLowerCase().trim();

    this.authService.signup(this.signupModel).subscribe({
      next: () => {
        this.isLogin = true;
        this.signupError = null;
      },
      error: (err) => {
        this.signupError = err.error || 'Signup failed. Please try again.';
        console.error('Signup error:', err);
      }
    });
  }

  googleLogin() {
    // Handled by Google Sign-In button
  }

  initializeGoogleSignIn() {
    (window as any).google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: (response: any) => this.handleGoogleSignIn(response)
    });
    (window as any).google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large', width: 400 }
    );
  }

  handleGoogleSignIn(response: any) {
    this.clearErrors();
    this.authService.googleLogin(response.credential).subscribe({
      next: (res) => {
        this.isAuthenticated = true;
        this.userId = this.authService.getUserId();
        this.profileModel.username = this.authService.getUsername() ?? '';
        this.profileModel.bio = this.authService.getBio() ?? '';
        this.loadUsers();
        this.loadChats();
      },
      error: (err) => {
        this.loginError = err.error || 'Google login failed. Please try again.';
        console.error('Google login error:', err);
      }
    });
  }

  requestPasswordReset() {
    this.clearErrors();
    this.authService.requestPasswordReset(this.forgotPasswordModel).subscribe({
      next: () => {
        this.forgotPasswordMessage = 'Password reset link sent to your email.';
        this.forgotPasswordError = null;
      },
      error: (err) => {
        this.forgotPasswordError = err.error || 'Failed to send reset link. Please try again.';
        console.error('Forgot password error:', err);
      }
    });
  }

  resetPassword() {
    this.clearErrors();
    this.authService.resetPassword(this.resetPasswordModel).subscribe({
      next: () => {
        this.showResetPassword = false;
        this.isLogin = true;
        this.clearErrors();
      },
      error: (err) => {
        this.resetPasswordError = err.error || 'Failed to reset password. Please try again.';
        console.error('Reset password error:', err);
      }
    });
  }

  updateProfile() {
    this.clearErrors();
    this.authService.updateProfile(this.profileModel).subscribe({
      next: () => {
        localStorage.setItem('username', this.profileModel.username ?? '');
        localStorage.setItem('bio', this.profileModel.bio ?? '');
        this.showProfileModal = false;
      },
      error: (err) => {
        this.profileError = err.error || 'Failed to update profile. Please try again.';
        console.error('Profile update error:', err);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChatId) {
      const message = {
        receiverId: this.selectedChatId,
        content: this.newMessage
      };
      this.chatService.sendMessage(message).subscribe({
        next: () => {
          this.messages.push({
            senderId: this.userId,
            receiverId: this.selectedChatId,
            content: this.newMessage,
            timestamp: new Date(),
            senderUsername: this.profileModel.username
          });
          this.updateChatLastMessage(this.selectedChatId, this.newMessage);
          this.newMessage = '';
        },
        error: (err) => console.error('Send message error:', err)
      });
    }
  }

  addMockMessage(chatId: string, senderUsername: string) {
    if (chatId !== this.selectedChatId) {
      const chat = this.chats.find(c => c.id === chatId);
      if (chat) {
        chat.unreadMessages = (chat.unreadMessages || 0) + 1;
        this.notificationMessage = `New message from ${senderUsername}`;
        setTimeout(() => this.clearNotification(), 3000);
      }
    }
  }

  clearNotification() {
    this.notificationMessage = null;
  }

  getUsernameById(userId: string): string {
    if (userId === this.userId) return this.profileModel.username;
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  }

  updateChatLastMessage(chatId: string, message: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = message;
    }
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.userId = null;
    this.chats = [];
    this.selectedChatId = "";
    this.messages = [];
    this.clearErrors();
    this.clearNotification();
  }

  clearErrors() {
    this.loginError = null;
    this.signupError = null;
    this.forgotPasswordError = null;
    this.forgotPasswordMessage = null;
    this.resetPasswordError = null;
    this.profileError = null;
  }
}