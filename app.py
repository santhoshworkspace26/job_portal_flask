from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import get_db_connection

app = Flask(__name__)
app.secret_key = "jobportal_secret"


# ---------------- HOME ----------------
@app.route('/')
def home():
    return render_template('index.html')


# ---------------- LOGIN ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email    = request.form['email']
        password = request.form['password']

        try:
            conn   = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
            user = cursor.fetchone()
            conn.close()

            if not user:
                return render_template('login.html', error="No account found with this email")

            # user[3] is the password column — adjust index if your columns differ
            if not check_password_hash(user[3], password):
                return render_template('login.html', error="Incorrect password")

            # Save user info in session
            session['user_id']   = user[0]
            session['user_name'] = user[1]
            session['user_email']= user[2]

            return redirect(url_for('dashboard'))

        except Exception as e:
            return render_template('login.html', error=f"Database error: {str(e)}")

    return render_template('login.html')


# ---------------- REGISTER ----------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name  = request.form['last_name']
        email      = request.form['email']
        role       = request.form['role']
        password   = request.form['password']
        confirm    = request.form['confirm_password']

        # Validation
        if not first_name or not last_name or not email or not password:
            return render_template('register.html', error="Please fill in all required fields")

        if password != confirm:
            return render_template('register.html', error="Passwords do not match")

        if len(password) < 8:
            return render_template('register.html', error="Password must be at least 8 characters")

        try:
            conn   = get_db_connection()
            cursor = conn.cursor()

            # Check if email already exists
            cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
            if cursor.fetchone():
                conn.close()
                return render_template('register.html', error="An account with this email already exists")

            # Hash password before storing
            hashed = generate_password_hash(password)

            cursor.execute("""
                INSERT INTO users (name, email, password, skills)
                VALUES (%s, %s, %s, %s)
            """, (first_name + " " + last_name, email, hashed, role))

            conn.commit()
            conn.close()

            # Redirect to login after successful registration
            return redirect(url_for('login'))

        except Exception as e:
            return render_template('register.html', error=f"Database error: {str(e)}")

    return render_template('register.html')


# ---------------- LOGOUT ----------------
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))


# ---------------- JOBS ----------------
@app.route('/jobs')
def jobs():
    return render_template('jobs.html')


# ---------------- DASHBOARD ----------------
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', user_name=session.get('user_name'))


# ---------------- APPLY ----------------
@app.route('/apply')
def apply():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('apply.html')


# ---------------- CONTACT ----------------
@app.route('/contact')
def contact():
    return render_template('contact.html')


# ---------------- TEST DB ----------------
@app.route('/test-db')
def test_db():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 'Database Connected Successfully'")
        result = cursor.fetchone()
        conn.close()
        return result[0]
    except Exception as e:
        return f"Database Error: {str(e)}"


# ---------------- RUN APP ----------------
if __name__ == '__main__':
    app.run(debug=True)