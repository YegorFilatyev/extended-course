import psycopg2
from psycopg2.extras import RealDictCursor, CompositeCaster, register_composite
import psycopg2.extensions as ext
import os
from dotenv import load_dotenv
load_dotenv()


class Database:
    def __init__(self):
        self.connection = None

    def connect(self):
        try:
            self.connection = psycopg2.connect(
                host=os.getenv('DB_HOST'),
                port=os.getenv('DB_PORT'),
                database=os.getenv('DB_NAME'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD')
            )
        except Exception as e:
            print(str(e))
            raise

    def close(self):
        if self.connection:
            self.connection.close()

    def execute_query(self, query, params=None, fetch_one=False, fetch_all=False):
        cursor = None
        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)

            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                if cursor.description:
                    return cursor.fetchone()
                return True

        except Exception as e:
            raise
        finally:
            if cursor:
                cursor.close()

    def register_product_quantity(self):
        try:
            register_composite('product_quantity', self.connection, globally=True)
        except:
            pass


db = Database()
