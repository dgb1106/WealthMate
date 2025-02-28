import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthViewController {
  constructor(private jwtService: JwtService) {}

  @Get('login-view')
  loginView(@Req() req: Request, @Res() res: Response) {
    res.send(`
      <html>
        <head>
          <title>Login</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { margin-top: 0; color: #333; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #45a049; }
            .error { color: red; margin-bottom: 15px; }
            .success { color: green; margin-bottom: 15px; }
            .logged-in { background-color: #e9ffe9; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
            .nav { margin-bottom: 20px; }
            .nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="nav">
              <a href="/auth/login-view">Login</a>
              <a href="/auth/register-view">Register</a>
              <a href="/auth/profile-view">Profile (Protected)</a>
            </div>
            
            <h1>Login</h1>
            
            <div id="loginStatus"></div>
            
            <form id="loginForm" method="POST" action="/auth/login">
              <label>Email:</label>
              <input type="email" name="email" required />
              
              <label>Password:</label>
              <input type="password" name="password" required />
              
              <button type="submit">Login</button>
            </form>
            
            <script>
              // Check if user is already logged in
              fetch('/auth/check', { 
                method: 'GET',
                credentials: 'include'
              })
              .then(response => response.json())
              .then(data => {
                if (data.isAuthenticated) {
                  // User is already logged in
                  document.getElementById('loginStatus').innerHTML = 
                    '<div class="logged-in">' +
                    '<strong>You are already logged in!</strong><br>' +
                    'Email: ' + data.user.email + '<br>' +
                    'User ID: ' + data.user.userId + '<br><br>' +
                    '<form action="/auth/logout" method="POST">' +
                    '<button type="submit">Logout</button>' +
                    '</form>' +
                    '</div>';
                  
                  // Hide the login form
                  document.getElementById('loginForm').style.display = 'none';
                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
              
              // Handle form submission
              document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                  email: formData.get('email'),
                  password: formData.get('password')
                };
                
                fetch('/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                  credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                  if (data.message === 'Login successful') {
                    document.getElementById('loginStatus').innerHTML = 
                      '<div class="success">Login successful! Redirecting...</div>';
                    setTimeout(() => {
                      window.location.href = '/auth/profile-view';
                    }, 1500);
                  }
                })
                .catch(error => {
                  document.getElementById('loginStatus').innerHTML = 
                    '<div class="error">Login failed. Please try again.</div>';
                });
              });
            </script>
          </div>
        </body>
      </html>
    `);
  }

  @Get('register-view')
  registerView(@Res() res: Response) {
    res.send(`
      <html>
        <head>
          <title>Register</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { margin-top: 0; color: #333; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #45a049; }
            .error { color: red; margin-bottom: 15px; }
            .success { color: green; margin-bottom: 15px; }
            .logged-in { background-color: #e9ffe9; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
            .nav { margin-bottom: 20px; }
            .nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="nav">
              <a href="/auth/login-view">Login</a>
              <a href="/auth/register-view">Register</a>
              <a href="/auth/profile-view">Profile (Protected)</a>
            </div>
            
            <h1>Register</h1>
            
            <div id="registerStatus"></div>
            
            <form id="registerForm" method="POST" action="/auth/register">
              <label>Name:</label>
              <input type="text" name="name" required />
              
              <label>Email:</label>
              <input type="email" name="email" required />
              
              <label>Password:</label>
              <input type="password" name="password" required />
              
              <label>Phone:</label>
              <input type="text" name="phone" required />
              
              <label>City:</label>
              <input type="text" name="city" required />
              
              <label>District:</label>
              <input type="text" name="district" required />
              
              <label>Job:</label>
              <input type="text" name="job" required />
              
              <label>Preferred Mood:</label>
              <select name="preferred_mood">
                <option value="IRRITATION">IRRITATION</option>
                <option value="ENCOURAGEMENT">ENCOURAGEMENT</option>
              </select>
              
              <label>Preferred Goal:</label>
              <select name="preferred_goal">
                <option value="SAVING">SAVING</option>
                <option value="INVESTMENT">INVESTMENT</option>
              </select>
              
              <button type="submit">Register</button>
            </form>
            
            <script>
              // Check if user is already logged in
              fetch('/auth/check', { 
                method: 'GET',
                credentials: 'include'
              })
              .then(response => response.json())
              .then(data => {
                if (data.isAuthenticated) {
                  // User is already logged in
                  document.getElementById('registerStatus').innerHTML = 
                    '<div class="logged-in">' +
                    '<strong>You are already registered and logged in!</strong><br>' +
                    'Email: ' + data.user.email + '<br>' +
                    'User ID: ' + data.user.userId + '<br><br>' +
                    '<form action="/auth/logout" method="POST">' +
                    '<button type="submit">Logout</button>' +
                    '</form>' +
                    '</div>';
                  
                  // Hide the register form
                  document.getElementById('registerForm').style.display = 'none';
                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
              
              // Handle form submission
              document.getElementById('registerForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  phone: formData.get('phone'),
                  city: formData.get('city'),
                  district: formData.get('district'),
                  job: formData.get('job'),
                  preferred_mood: formData.get('preferred_mood'),
                  preferred_goal: formData.get('preferred_goal')
                };
                
                fetch('/auth/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                  credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                  if (data.message === 'Registration successful') {
                    document.getElementById('registerStatus').innerHTML = 
                      '<div class="success">Registration successful! Redirecting...</div>';
                    setTimeout(() => {
                      window.location.href = '/auth/profile-view';
                    }, 1500);
                  }
                })
                .catch(error => {
                  document.getElementById('registerStatus').innerHTML = 
                    '<div class="error">Registration failed. Please try again.</div>';
                });
              });
            </script>
          </div>
        </body>
      </html>
    `);
  }

  @Get('profile-view')
  profileView(@Req() req: Request, @Res() res: Response) {
    res.send(`
      <html>
        <head>
          <title>Protected Profile</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { margin-top: 0; color: #333; }
            .user-info { background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
            .auth-error { background-color: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 15px; color: #c62828; }
            button { background: #f44336; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #d32f2f; }
            .nav { margin-bottom: 20px; }
            .nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="nav">
              <a href="/auth/login-view">Login</a>
              <a href="/auth/register-view">Register</a>
              <a href="/auth/profile-view">Profile (Protected)</a>
            </div>
            
            <h1>Protected Profile Page</h1>
            
            <div id="profileContent">Loading...</div>
            
            <script>
              // Check if user is authenticated
              fetch('/auth/check', { 
                method: 'GET',
                credentials: 'include'
              })
              .then(response => response.json())
              .then(data => {
                if (data.isAuthenticated) {
                  // User is authenticated
                  document.getElementById('profileContent').innerHTML = 
                    '<div class="user-info">' +
                    '<h2>User Profile</h2>' +
                    '<p><strong>Email:</strong> ' + data.user.email + '</p>' +
                    '<p><strong>User ID:</strong> ' + data.user.userId + '</p>' +
                    '<p><strong>Authentication:</strong> <span style="color: green;">✓ Successful</span></p>' +
                    '<p>You are viewing this protected page because you are authenticated via cookie.</p>' +
                    '</div>' +
                    '<form action="/auth/logout" method="POST" id="logoutForm">' +
                    '<button type="submit">Logout</button>' +
                    '</form>';
                    
                  // Add event listener for logout form
                  setTimeout(() => {
                    document.getElementById('logoutForm').addEventListener('submit', function(e) {
                      e.preventDefault();
                      
                      fetch('/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                      })
                      .then(response => response.json())
                      .then(data => {
                        if (data.message === 'Logged out successfully') {
                          window.location.href = '/auth/login-view';
                        }
                      });
                    });
                  }, 100);
                } else {
                  // Not authenticated
                  document.getElementById('profileContent').innerHTML = 
                    '<div class="auth-error">' +
                    '<h2>Authentication Required</h2>' +
                    '<p>You must be logged in to view this page.</p>' +
                    '<p><a href="/auth/login-view">Go to Login</a></p>' +
                    '</div>';
                }
              })
              .catch(error => {
                console.error('Error:', error);
                document.getElementById('profileContent').innerHTML = 
                  '<div class="auth-error">' +
                  '<h2>Error</h2>' +
                  '<p>An error occurred while checking authentication status.</p>' +
                  '<p><a href="/auth/login-view">Go to Login</a></p>' +
                  '</div>';
              });
            </script>
          </div>
        </body>
      </html>
    `);
  }
}