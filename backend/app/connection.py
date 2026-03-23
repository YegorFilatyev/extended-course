from database import db


class Connection:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def init_connections(self):
        if not self._initialized:
            try:
                db.connect()
                self._initialized = True

            except Exception as e:
                raise

    def close_connections(self):
        if self._initialized:

            db.close()
            self._initialized = False


connection = Connection()
