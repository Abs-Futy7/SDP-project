import os
import threading
from typing import Optional

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class DatabaseConnection:
    """
    Thread-safe Singleton class for MongoDB Atlas connection.

    No matter how many times DatabaseConnection() is called, the application
    receives the same object and the same MongoDB client instance.
    """

    _instance: Optional["DatabaseConnection"] = None
    _lock = threading.Lock()

    def __new__(cls) -> "DatabaseConnection":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(DatabaseConnection, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return

        load_dotenv()

        self._mongodb_uri = os.getenv("MONGODB_URI")
        self._database_name = os.getenv("DATABASE_NAME", "school_management")

        if not self._mongodb_uri:
            raise ValueError(
                "MONGODB_URI is missing. Create a .env file and add your MongoDB Atlas connection string."
            )

        self._client = MongoClient(self._mongodb_uri, serverSelectionTimeoutMS=5000)
        self._database = self._client[self._database_name]
        self._initialized = True

    def get_client(self) -> MongoClient:
        return self._client

    def get_database(self) -> Database:
        return self._database

    def ping(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError):
            return False

    def close_connection(self) -> None:
        self._client.close()
        self._initialized = False
        type(self)._instance = None
