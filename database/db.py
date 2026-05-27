import mysql.connector

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",   # XAMPP default is empty
        database="job_portal"
    )
    return conn