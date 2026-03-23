import os
import re
from dotenv import load_dotenv
load_dotenv()


class Validator:
    @staticmethod
    def validate_email(email: str):
        if not email:
            return False, "Login cannot be empty"

        min_length = int(os.getenv("MIN_EMAIL_LENGTH"))
        if len(email) < min_length:
            return False, f"Email must be at least {min_length} characters"

        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$', email):
            return False, "Invalid email format"

        return True, "OK"

    @staticmethod
    def validate_password(password: str):
        if not password:
            return False, "Password cannot be empty"

        min_length = int(os.getenv("MIN_PASSWORD_LENGTH"))
        if len(password) < min_length:
            return False, f"Password must be at least {min_length} characters"

        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"

        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"

        if not re.search(r'\d', password):
            return False, "Password must contain at least one digit"

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain at least one special character"

        return True, "OK"

    @staticmethod
    def validate_name(name: str):
        if not name:
            return False, "Name cannot be empty"

        if len(name) < 2:
            return False, "Name must be at least 2 characters"

        if len(name) > 70:
            return False, "Name must not exceed 70 characters"

        if not re.match(r'^[a-zA-Zа-яА-Я\s\-]+$', name):
            return False, "Name can only contain letters, spaces and hyphens"

        return True, ""

    @staticmethod
    def validate_user_data(email: str, password: str, name: str):
        email_valid, email_error = Validator.validate_email(email)
        if not email_valid:
            return False, email_error

        password_valid, password_error = Validator.validate_password(password)
        if not password_valid:
            return False, password_error

        name_valid, name_error = Validator.validate_name(name)
        if not name_valid:
            return False, name_error

        return True, "OK"
