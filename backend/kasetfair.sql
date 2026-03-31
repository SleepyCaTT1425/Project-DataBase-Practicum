
-- use pannawit_chak_db1;


CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('guest', 'vendor', 'admin') DEFAULT 'guest'
);

CREATE TABLE Booths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booth_code VARCHAR(20) UNIQUE NOT NULL,
    size_sqm DECIMAL(5,2),
    price DECIMAL(10,2),
    status ENUM('available', 'pending', 'booked') DEFAULT 'available'
);

CREATE TABLE Reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    booth_id INT,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (booth_id) REFERENCES Booths(id)
);

INSERT INTO Booths (booth_code, size_sqm, price, status)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 136
)
SELECT 
    CONCAT('E', LPAD(n, 3, '0')) AS booth_code,
    9.00 AS size_sqm,
    3000.00 AS price,
    'available' AS status
FROM numbers;

ALTER TABLE Reservations ADD COLUMN payment_status ENUM('unpaid', 'checking', 'paid') DEFAULT 'unpaid';
ALTER TABLE Reservations ADD COLUMN slip_image LONGTEXT;
ALTER TABLE Reservations MODIFY COLUMN slip_image LONGTEXT;

INSERT INTO Users (name, email, password_hash, phone, role) 
VALUES (
    'admin', 
    'admin@gmail.com', 
    'scrypt:32768:8:1$ii4lyxBzwU4HpcTz$6625d1b55b8a28f06f6235ce957d2a22420eb25b67ad42fbf8d4b615755ad76423439acb3d119a4131e289890c4d48b6f1fcb0b7be3762d65374e259e937b3e0', -- Hash รหัสผ่าน 'admin' สร้างโดย werkzeug.security
    '0861234567', 
    'admin'
);