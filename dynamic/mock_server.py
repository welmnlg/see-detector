from flask import Flask, render_template_string, request, make_response
import logging

# Disable default Flask logging to avoid polluting sandbox output
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)

LOGIN_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ platform_name }} Sign In</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1a73e8; text-align: center; }
        h1 { font-size: 20px; text-align: center; margin-bottom: 30px; font-weight: normal; }
        .input-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-size: 14px; color: #5f6368; }
        input[type="email"], input[type="text"], input[type="password"] { width: 100%; padding: 12px 14px; border: 1px solid #dadce0; border-radius: 4px; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 12px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
        button:hover { background-color: #1557b0; }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo">{{ platform_name }}</div>
        <h1>Sign in to continue</h1>
        <form action="/dashboard/finance" method="POST" id="login-form">
            <div class="input-group">
                <label for="email">Email or phone</label>
                <input type="email" id="email" name="email" placeholder="Email" required autocomplete="username">
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Password" required autocomplete="current-password">
            </div>
            <button type="submit" id="submit-btn">Next</button>
        </form>
    </div>
</body>
</html>
"""

DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background-color: #f8f9fa; }
        .header { background-color: #1a73e8; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { padding: 40px; max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        h1 { margin: 0; }
        .balance { font-size: 36px; font-weight: bold; color: #34a853; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Finance Portal</h1>
        <div>Welcome, <span id="user-display">{{ email }}</span></div>
    </div>
    <div class="container">
        <div class="card">
            <h2>Available Balance</h2>
            <div class="balance">$24,500.00</div>
            <p>Account ending in 4321</p>
        </div>
        <div class="card">
            <h2>Recent Transactions</h2>
            <ul>
                <li>Amazon.com - $120.50</li>
                <li>Starbucks - $5.40</li>
                <li>Salary Deposit - $4,200.00</li>
            </ul>
        </div>
        <div class="card" style="height: 1000px;">
            <h2>Scroll area to simulate UProf behavior</h2>
            <p>Content for scrolling...</p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return "Honeypot Server is running."

@app.route('/login/<platform>')
def login(platform):
    platforms = {
        'google': 'Google',
        'microsoft': 'Microsoft',
        'paypal': 'PayPal'
    }
    platform_name = platforms.get(platform.lower(), 'Service')
    resp = make_response(render_template_string(LOGIN_TEMPLATE, platform_name=platform_name))
    resp.set_cookie('session_id', f'mock_session_{platform}', httponly=True)
    return resp

@app.route('/dashboard/finance', methods=['GET', 'POST'])
def dashboard():
    email = "User"
    if request.method == 'POST':
        email = request.form.get('email', 'User')
    
    resp = make_response(render_template_string(DASHBOARD_TEMPLATE, email=email))
    resp.set_cookie('auth_token', 'mock_auth_token_12345', httponly=True)
    return resp

if __name__ == '__main__':
    # Run on 0.0.0.0 so it's accessible via 127.0.0.1
    app.run(host='127.0.0.1', port=5050, debug=False)
