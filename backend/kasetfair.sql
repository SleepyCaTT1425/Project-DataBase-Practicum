
drop database if exists kasetfair;
Create database kasetfair;

use kasetfair;

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

INSERT INTO Users (name, email, password_hash, phone, role) VALUES
('Admin Kaset', 'admin@kasetfair.com', 'hashed_123', '0801112222', 'admin'),
('Vendor CP', 'cpfood@gmail.com', 'hashed_456', '0812223333', 'vendor'),
('Guest John', 'john@gmail.com', 'hashed_789', '0823334444', 'guest');

INSERT INTO Reservations (user_id, booth_id, status) VALUES
(2, 1, 'active');

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