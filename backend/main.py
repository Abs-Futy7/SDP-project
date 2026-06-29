import os

from backend.database import DatabaseConnection
from backend.user_factory import UserRegistrationService


def demonstrate_abstract_factory(database=None, save_to_database: bool = False) -> None:
    registration_service = UserRegistrationService(database)

    registrations = [
        (
            "student",
            {
                "name": "Rahim Uddin",
                "email": "rahim@student.example.com",
                "password": "student123",
                "student_id": "S-2026-001",
                "department": "CSE",
                "semester": "3-2",
            },
        ),
        (
            "teacher",
            {
                "name": "Nusrat Jahan",
                "email": "nusrat@teacher.example.com",
                "password": "teacher123",
                "teacher_id": "T-102",
                "department": "CSE",
                "designation": "Lecturer",
            },
        ),
        (
            "staff",
            {
                "name": "Kamal Hossain",
                "email": "kamal@staff.example.com",
                "password": "staff123",
                "staff_id": "ST-17",
                "office": "Registrar Office",
                "shift": "Morning",
            },
        ),
    ]

    print("\n=== Abstract Factory: User Registration ===")
    for user_type, data in registrations:
        result = registration_service.register(user_type, data, save_to_database=save_to_database)
        print(result.welcome_message)
        print(f"Saved collection: {result.collection_name}")
        if result.inserted_id:
            print(f"MongoDB inserted id: {result.inserted_id}")


def main() -> None:
    first_connection = DatabaseConnection()
    second_connection = DatabaseConnection()

    print("First object id :", id(first_connection))
    print("Second object id:", id(second_connection))
    print("Same instance   :", first_connection is second_connection)

    if first_connection.ping():
        database = first_connection.get_database()
        print(f"Connected to MongoDB Atlas database: {database.name}")
        save_samples = os.getenv("SAVE_SAMPLE_USERS", "false").lower() == "true"
        demonstrate_abstract_factory(database, save_to_database=save_samples)
    else:
        print("Could not connect to MongoDB Atlas. Check your URI, username/password, and network access.")
        demonstrate_abstract_factory()


if __name__ == "__main__":
    main()
