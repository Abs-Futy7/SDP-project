from database import DatabaseConnection


def main() -> None:
    first_connection = DatabaseConnection()
    second_connection = DatabaseConnection()

    print("First object id :", id(first_connection))
    print("Second object id:", id(second_connection))
    print("Same instance   :", first_connection is second_connection)

    if first_connection.ping():
        database = first_connection.get_database()
        print(f"Connected to MongoDB Atlas database: {database.name}")
    else:
        print("Could not connect to MongoDB Atlas. Check your URI, username/password, and network access.")


if __name__ == "__main__":
    main()
