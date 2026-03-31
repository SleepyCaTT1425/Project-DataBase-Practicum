import pytest
from unittest.mock import patch, MagicMock
from werkzeug.security import generate_password_hash


# Mock database connections before importing the app
@pytest.fixture(autouse=True)
def mock_databases(monkeypatch):
    """Mock MySQL pool and MongoDB before app import."""
    monkeypatch.setenv("DB_HOST", "localhost")
    monkeypatch.setenv("DB_USER", "test")
    monkeypatch.setenv("DB_PASSWORD", "test")
    monkeypatch.setenv("DB_NAME", "kasetfair")
    monkeypatch.setenv("MONGO_URI", "mongodb://localhost:27017/")
    monkeypatch.setenv("PAYMENT_TIMEOUT_MINUTES", "10")
    monkeypatch.setenv("PROMPTPAY_PHONE", "0800000000")


@pytest.fixture
def mock_mysql_pool():
    """Create a mock MySQL connection pool."""
    mock_pool = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_pool.get_connection.return_value = mock_conn
    return mock_pool, mock_conn, mock_cursor


@pytest.fixture
def mock_mongo():
    """Create mock MongoDB collections."""
    mock_vendors = MagicMock()
    mock_slips = MagicMock()
    return mock_vendors, mock_slips


@pytest.fixture
def app(mock_mysql_pool, mock_mongo):
    """Create Flask test app with mocked databases."""
    mock_pool, mock_conn, mock_cursor = mock_mysql_pool
    mock_vendors, mock_slips = mock_mongo

    # Mock cleanup query (before_request)
    mock_cursor.fetchall.return_value = []

    with patch("mysql.connector.pooling.MySQLConnectionPool", return_value=mock_pool):
        with patch("pymongo.MongoClient") as mock_mongo_client:
            mock_db = MagicMock()
            mock_db.__getitem__ = lambda self, key: (
                mock_vendors if key == "Vendor_Details" else mock_slips
            )
            mock_mongo_client.return_value.__getitem__ = lambda self, key: mock_db

            # Patch subprocess to avoid starting MySQL service
            with patch("subprocess.run"):
                import importlib
                import main

                importlib.reload(main)

                main.mysql_pool = mock_pool
                main.vendors_collection = mock_vendors
                main.slips_collection = mock_slips

                main.app.config["TESTING"] = True
                yield main.app, mock_pool, mock_conn, mock_cursor, mock_vendors, mock_slips


@pytest.fixture
def client(app):
    """Create Flask test client."""
    flask_app, *mocks = app
    with flask_app.test_client() as client:
        yield client, *mocks


# ==========================================
# Test 1: GET /api/booths - List all booths
# ==========================================
class TestGetBooths:
    def test_get_booths_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.side_effect = [
            [],  # before_request cleanup
            [
                {"id": 1, "booth_code": "E001", "size_sqm": 9, "price": 3000, "status": "available", "payment_status": None},
                {"id": 2, "booth_code": "E002", "size_sqm": 9, "price": 3000, "status": "booked", "payment_status": "paid"},
            ],
        ]

        response = test_client.get("/api/booths")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert data[0]["booth_code"] == "E001"
        assert data[1]["status"] == "booked"


# ==========================================
# Test 2: POST /api/register - User registration
# ==========================================
class TestRegister:
    def test_register_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.return_value = []  # before_request cleanup

        response = test_client.post("/api/register", json={
            "fullName": "Test User",
            "username": "test@example.com",
            "password": "password123",
            "phoneNumber": "0812345678",
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "ลงทะเบียนสำเร็จ"
        mock_cursor.execute.assert_called()
        mock_conn.commit.assert_called()

    def test_register_duplicate_username(self, client):
        import mysql.connector
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.return_value = []
        mock_cursor.execute.side_effect = [
            None,  # before_request cleanup fetchall
            mysql.connector.IntegrityError("Duplicate entry"),
        ]

        response = test_client.post("/api/register", json={
            "fullName": "Test User",
            "username": "existing@example.com",
            "password": "password123",
            "phoneNumber": "0812345678",
        })
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data


# ==========================================
# Test 3: POST /api/login - User login
# ==========================================
class TestLogin:
    def test_login_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        hashed = generate_password_hash("password123")
        mock_cursor.fetchall.return_value = []  # before_request
        mock_cursor.fetchone.return_value = {
            "id": 1,
            "name": "Test User",
            "password_hash": hashed,
            "role": "vendor",
        }

        response = test_client.post("/api/login", json={
            "username": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["user_id"] == 1
        assert data["role"] == "vendor"

    def test_login_wrong_password(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        hashed = generate_password_hash("correctpassword")
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = {
            "id": 1,
            "name": "Test User",
            "password_hash": hashed,
            "role": "vendor",
        }

        response = test_client.post("/api/login", json={
            "username": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_login_user_not_found(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = None

        response = test_client.post("/api/login", json={
            "username": "nobody@example.com",
            "password": "password123",
        })
        assert response.status_code == 401


# ==========================================
# Test 4: POST /api/reservations - Create reservation
# ==========================================
class TestReservations:
    def test_create_reservation_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.return_value = []

        response = test_client.post("/api/reservations", json={
            "user_id": 1,
            "booth_id": 5,
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "สำเร็จ" in data["message"]
        mock_conn.commit.assert_called()


# ==========================================
# Test 5: POST /api/vendors - Create vendor
# ==========================================
class TestVendors:
    def test_create_vendor_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, mock_vendors, _ = client
        mock_cursor.fetchall.return_value = []

        vendor_data = {
            "stallId": "E001",
            "shopName": "Test Shop",
            "shopType": "food",
            "description": "A test shop",
        }
        response = test_client.post("/api/vendors", json=vendor_data)
        assert response.status_code == 201
        mock_vendors.insert_one.assert_called_once()

    def test_get_vendors_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, mock_vendors, _ = client

        mock_vendors.find.return_value = [
            {"stallId": "E001", "shopName": "Shop A", "status": "active"},
        ]
        mock_cursor.fetchall.side_effect = [
            [],  # before_request cleanup
            [{"booth_code": "E001", "payment_status": "paid"}],  # reservations query
        ]

        response = test_client.get("/api/vendors")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["shopName"] == "Shop A"
        assert data[0]["paymentStatus"] == "paid"


# ==========================================
# Test 6: PUT /api/payments/upload - Upload payment slip
# ==========================================
class TestPayments:
    def test_upload_slip_success(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, mock_slips = client
        mock_cursor.fetchall.return_value = []

        response = test_client.put("/api/payments/upload/1", json={
            "slip_image": "data:image/png;base64,iVBOR...",
        })
        assert response.status_code == 200
        mock_slips.update_one.assert_called_once()
        mock_conn.commit.assert_called()

    def test_upload_slip_no_image(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.return_value = []

        response = test_client.put("/api/payments/upload/1", json={})
        assert response.status_code == 400


# ==========================================
# Test 7: GET /api/admin/users - List vendor users
# ==========================================
class TestAdminUsers:
    def test_get_all_vendors(self, client):
        test_client, mock_pool, mock_conn, mock_cursor, _, _ = client
        mock_cursor.fetchall.side_effect = [
            [],  # before_request cleanup
            [
                {"id": 1, "name": "Vendor A", "email": "a@test.com", "phone": "0800000001"},
                {"id": 2, "name": "Vendor B", "email": "b@test.com", "phone": "0800000002"},
            ],
        ]

        response = test_client.get("/api/admin/users")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert data[0]["name"] == "Vendor A"
