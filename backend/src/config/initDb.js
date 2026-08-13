const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const initDb = async () => {
  const connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "manager"
  };

  let connection;
  try {
    // 1. Connect to MySQL server without database
    connection = await mysql.createConnection(connectionConfig);
    console.log("Connected to MySQL server. Checking/creating database...");

    const dbName = process.env.DB_NAME || "snacko";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" verified or created.`);
    await connection.end();

    // 2. Connect to the specific database
    connection = await mysql.createConnection({
      ...connectionConfig,
      database: dbName,
      multipleStatements: true // Enable for executing migration script
    });

    // Check if tables already exist by checking if 'users' table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log("Core tables do not exist. Running db.sql to initialize schema...");
      const dbSqlPath = path.join(__dirname, "..", "..", "db.sql");
      if (fs.existsSync(dbSqlPath)) {
        const sql = fs.readFileSync(dbSqlPath, "utf8");
        await connection.query(sql);
        console.log("Core schema initialized from db.sql.");
      } else {
        console.warn("db.sql not found! Cannot initialize core schema automatically.");
      }
    } else {
      console.log("Core tables already exist.");
    }

    // 3. Create Warehouse Tables if they do not exist
    console.log("Verifying warehouse tables...");
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        warehouse_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        delivery_start_time TIME NOT NULL DEFAULT '06:00:00',
        delivery_end_time TIME NOT NULL DEFAULT '23:00:00',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS warehouse_pincodes (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        warehouse_id INT NOT NULL,
        pincode VARCHAR(20) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_warehouse_pincodes_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS warehouse_products (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        warehouse_id INT NOT NULL,
        product_id INT NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_warehouse_products_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_warehouse_products_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT uk_warehouse_product UNIQUE (warehouse_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("Warehouse tables verified/created.");

    // Verify / alter warehouses table to include delivery_start_time and delivery_end_time
    const [whStartCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'warehouses' 
        AND COLUMN_NAME = 'delivery_start_time'
    `);
    if (whStartCols.length === 0) {
      console.log("Adding delivery_start_time column to warehouses table...");
      await connection.query(`
        ALTER TABLE warehouses 
        ADD COLUMN delivery_start_time TIME NOT NULL DEFAULT '06:00:00'
      `);
      console.log("delivery_start_time column added successfully.");
    }

    const [whEndCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'warehouses' 
        AND COLUMN_NAME = 'delivery_end_time'
    `);
    if (whEndCols.length === 0) {
      console.log("Adding delivery_end_time column to warehouses table...");
      await connection.query(`
        ALTER TABLE warehouses 
        ADD COLUMN delivery_end_time TIME NOT NULL DEFAULT '23:00:00'
      `);
      console.log("delivery_end_time column added successfully.");
    }

    // Verify / alter warehouses table to include is_active
    const [whActiveCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'warehouses' 
        AND COLUMN_NAME = 'is_active'
    `);
    if (whActiveCols.length === 0) {
      console.log("Adding is_active column to warehouses table...");
      await connection.query(`
        ALTER TABLE warehouses 
        ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1
      `);
      console.log("is_active column added successfully.");
    }

    // Verify / alter users table to include warehouse_id
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'warehouse_id'
    `);
    if (cols.length === 0) {
      console.log("Adding warehouse_id column to users table...");
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN warehouse_id INT NULL, 
        ADD CONSTRAINT fk_users_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("warehouse_id column added to users table successfully.");
    }

    // Verify / alter products table to include warehouse_id
    const [prodCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'warehouse_id'
    `);
    if (prodCols.length === 0) {
      console.log("Adding warehouse_id column to products table...");
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN warehouse_id INT NULL, 
        ADD CONSTRAINT fk_products_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("warehouse_id column added to products table successfully.");
    }

    // Verify / alter categories table to include warehouse_id
    const [catCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'categories' 
        AND COLUMN_NAME = 'warehouse_id'
    `);
    if (catCols.length === 0) {
      console.log("Adding warehouse_id column to categories table...");
      await connection.query(`
        ALTER TABLE categories 
        ADD COLUMN warehouse_id INT NULL, 
        ADD CONSTRAINT fk_categories_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("warehouse_id column added to categories table successfully.");
    }

    // 3b. Create Reviews Table if it does not exist
    console.log("Verifying reviews table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY uk_user_product (user_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Reviews table verified/created.");

    // 3c. Create Coupons Table if it does not exist
    console.log("Verifying coupons table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        expiry_date DATETIME NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Coupons table verified/created.");

    // Verify / alter coupons table to include missing columns if the table already existed
    const [couponsCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'coupons'
    `);
    const colNames = couponsCols.map(c => c.COLUMN_NAME.toLowerCase());
    
    if (!colNames.includes('discount_type')) {
      console.log("Adding discount_type column to coupons table...");
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage'
      `);
    }
    if (!colNames.includes('discount_value')) {
      console.log("Adding discount_value column to coupons table...");
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
    }
    if (!colNames.includes('min_order_amount')) {
      console.log("Adding min_order_amount column to coupons table...");
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
    }
    if (!colNames.includes('expiry_date')) {
      console.log("Adding expiry_date column to coupons table...");
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN expiry_date DATETIME NULL
      `);
    }
    if (!colNames.includes('is_active')) {
      console.log("Adding is_active column to coupons table...");
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1
      `);
    }

    // Verify / alter products table to include discount_price
    const [discountCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'discount_price'
    `);
    if (discountCols.length === 0) {
      console.log("Adding discount_price column to products table...");
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN discount_price DECIMAL(10,2) NULL DEFAULT NULL
      `);
      console.log("discount_price column added successfully.");
    }

    // Verify / alter orders table to include coupon_code and discount_amount
    const [couponCodeCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'coupon_code'
    `);
    if (couponCodeCols.length === 0) {
      console.log("Adding coupon_code column to orders table...");
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN coupon_code VARCHAR(50) NULL DEFAULT NULL,
        ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
      console.log("coupon_code and discount_amount columns added to orders successfully.");
    }

    // Verify / alter orders table to include delivery partner columns
    const [deliveryCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'delivery_partner_name'
    `);
    if (deliveryCols.length === 0) {
      console.log("Adding delivery partner columns to orders table...");
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN delivery_partner_name VARCHAR(255) NULL DEFAULT NULL,
        ADD COLUMN delivery_partner_phone VARCHAR(20) NULL DEFAULT NULL,
        ADD COLUMN estimated_delivery_minutes INT NULL DEFAULT NULL
      `);
      console.log("Delivery partner columns added to orders successfully.");
    }


    // 4. Seed initial data if empty
    // Check if users table is empty and seed an admin and a customer
    const [users] = await connection.query("SELECT id FROM users LIMIT 1");
    if (users.length === 0) {
      console.log("Seeding default users...");
      const bcrypt = require("bcryptjs");
      const adminPassword = await bcrypt.hash("admin123", 10);
      const customerPassword = await bcrypt.hash("user123", 10);

      await connection.query(`
        INSERT INTO users (name, email, password, mobile, role) VALUES
        ('System Admin', 'admin@snacko.com', ?, '9876543210', 'admin'),
        ('John Doe', 'john@gmail.com', ?, '9876543211', 'customer')
      `, [adminPassword, customerPassword]);
      console.log("Seeded admin (admin@snacko.com / admin123) and customer (john@gmail.com / user123).");
    }

    // Check if addresses table is empty and seed
    const [addresses] = await connection.query("SELECT id FROM addresses LIMIT 1");
    if (addresses.length === 0) {
      console.log("Seeding default address...");
      const [john] = await connection.query("SELECT id FROM users WHERE email = 'john@gmail.com'");
      if (john.length > 0) {
        const johnId = john[0].id;
        await connection.query(`
          INSERT INTO addresses (id, user_id, address_line1, address_line2, city, state, pincode, country, is_default)
          VALUES (1, ?, 'Flat 402, Sunshine Apts', 'Sector 45', 'Gurugram', 'Haryana', '122003', 'India', 1)
        `, [johnId]);
        console.log("Seeded default address for John Doe.");
      }
    }

    // Check if categories are empty and seed
    const [categories] = await connection.query("SELECT category_id FROM categories LIMIT 1");
    let seededCategories = [];
    if (categories.length === 0) {
      console.log("Seeding categories...");
      await connection.query(`
        INSERT INTO categories (category_name, category_description, category_image, is_active) VALUES
        ('Beverages', 'Refreshing drinks, juices, and soda', 'beverages.png', 1),
        ('Snacks & Chips', 'Crispy chips, nachos, and local snacks', 'snacks.png', 1),
        ('Dairy & Bread', 'Fresh milk, cheese, butter, and bread', 'dairy.png', 1)
      `);
      console.log("Seeded basic categories.");
    }
    const [allCats] = await connection.query("SELECT category_id, category_name FROM categories");
    seededCategories = allCats;

    // Check if products are empty and seed
    const [products] = await connection.query("SELECT product_id FROM products LIMIT 1");
    let seededProducts = [];
    if (products.length === 0) {
      console.log("Seeding products...");
      const bevCat = seededCategories.find(c => c.category_name === "Beverages")?.category_id || 1;
      const snackCat = seededCategories.find(c => c.category_name === "Snacks & Chips")?.category_id || 2;
      const dairyCat = seededCategories.find(c => c.category_name === "Dairy & Bread")?.category_id || 3;

      await connection.query(`
        INSERT INTO products (category_id, product_name, product_description, price, stock_quantity, product_image, is_available) VALUES
        (?, 'Coca Cola 250ml', 'Chilled carbonated soft drink', 20.00, 100, 'cocacola.png', 1),
        (?, 'Orange Juice 1L', '100% pure squeezed orange juice', 99.00, 50, 'orange_juice.png', 1),
        (?, 'Potato Chips Classic Salted', 'Crispy and salted potato wafers', 30.00, 150, 'chips.png', 1),
        (?, 'Chocolate Cookies', 'Freshly baked chocolate chip cookies', 60.00, 80, 'cookies.png', 1),
        (?, 'Organic Whole Milk 1L', 'Fresh pasteurized whole milk', 75.00, 60, 'milk.png', 1),
        (?, 'Sourdough Bread 400g', 'Freshly baked artisanal bread', 90.00, 40, 'bread.png', 1)
      `, [bevCat, bevCat, snackCat, snackCat, dairyCat, dairyCat]);
      console.log("Seeded basic products.");
    }
    const [allProds] = await connection.query("SELECT product_id, product_name FROM products");
    seededProducts = allProds;

    // Check if warehouses are empty and seed
    const [warehouses] = await connection.query("SELECT warehouse_id FROM warehouses LIMIT 1");
    if (warehouses.length === 0) {
      console.log("Seeding warehouses and mapping pincodes...");
      
      // Warehouse 1: Gurugram Hub
      const [wh1Result] = await connection.query(
        "INSERT INTO warehouses (name, address) VALUES ('Gurugram Central Hub', 'Sector 45, Gurugram, Haryana')"
      );
      const wh1Id = wh1Result.insertId;

      // Warehouse 2: Delhi South Hub
      const [wh2Result] = await connection.query(
        "INSERT INTO warehouses (name, address) VALUES ('South Delhi Hub', 'Saket, New Delhi')"
      );
      const wh2Id = wh2Result.insertId;

      // Warehouse 3: Pune Hub
      const [wh3Result] = await connection.query(
        "INSERT INTO warehouses (name, address) VALUES ('Pune Hub (411115)', 'Kharadi, Pune, Maharashtra')"
      );
      const wh3Id = wh3Result.insertId;

      // Map pincodes
      await connection.query(`
        INSERT INTO warehouse_pincodes (warehouse_id, pincode) VALUES
        (?, '122003'),
        (?, '122001'),
        (?, '110017'),
        (?, '110001'),
        (?, '411115')
      `, [wh1Id, wh1Id, wh2Id, wh2Id, wh3Id]);

      // Seed warehouse product stock (inventory)
      // Wh1 has Coca Cola (50), Chips (80), Milk (30)
      // Wh2 has Orange Juice (40), Cookies (45), Bread (25)
      // Wh3 has all products stocked at 100 units
      const cokeId = seededProducts.find(p => p.product_name.includes("Coca Cola"))?.product_id;
      const juiceId = seededProducts.find(p => p.product_name.includes("Orange Juice"))?.product_id;
      const chipsId = seededProducts.find(p => p.product_name.includes("Potato Chips"))?.product_id;
      const cookiesId = seededProducts.find(p => p.product_name.includes("Chocolate Cookies"))?.product_id;
      const milkId = seededProducts.find(p => p.product_name.includes("Milk"))?.product_id;
      const breadId = seededProducts.find(p => p.product_name.includes("Bread"))?.product_id;

      const inventoryQueries = [];
      if (cokeId) inventoryQueries.push([wh1Id, cokeId, 50], [wh2Id, cokeId, 10], [wh3Id, cokeId, 100]);
      if (juiceId) inventoryQueries.push([wh1Id, juiceId, 5], [wh2Id, juiceId, 40], [wh3Id, juiceId, 100]);
      if (chipsId) inventoryQueries.push([wh1Id, chipsId, 80], [wh2Id, chipsId, 20], [wh3Id, chipsId, 100]);
      if (cookiesId) inventoryQueries.push([wh1Id, cookiesId, 15], [wh2Id, cookiesId, 45], [wh3Id, cookiesId, 100]);
      if (milkId) inventoryQueries.push([wh1Id, milkId, 30], [wh2Id, milkId, 5], [wh3Id, milkId, 100]);
      if (breadId) inventoryQueries.push([wh1Id, breadId, 2], [wh2Id, breadId, 25], [wh3Id, breadId, 100]);

      for (const [whId, prodId, stock] of inventoryQueries) {
        await connection.query(
          "INSERT INTO warehouse_products (warehouse_id, product_id, stock_quantity) VALUES (?, ?, ?)",
          [whId, prodId, stock]
        );
      }
      console.log("Seeded warehouses, pincodes, and warehouse inventory stock.");
    }

    // Check if reviews table is empty and seed
    const [reviewsCount] = await connection.query("SELECT id FROM reviews LIMIT 1");
    if (reviewsCount.length === 0) {
      console.log("Seeding default reviews...");
      const [john] = await connection.query("SELECT id FROM users WHERE email = 'john@gmail.com'");
      const [admin] = await connection.query("SELECT id FROM users WHERE email = 'admin@snacko.com'");
      
      if (john.length > 0) {
        const johnId = john[0].id;
        const adminId = admin.length > 0 ? admin[0].id : 1;
        
        // Find product ids
        const [coke] = await connection.query("SELECT product_id FROM products WHERE product_name LIKE '%Coca Cola%'");
        const [chips] = await connection.query("SELECT product_id FROM products WHERE product_name LIKE '%Chips%'");
        const [cookies] = await connection.query("SELECT product_id FROM products WHERE product_name LIKE '%Cookies%'");
        const [milk] = await connection.query("SELECT product_id FROM products WHERE product_name LIKE '%Milk%'");

        const cokeId = coke.length > 0 ? coke[0].product_id : 1;
        const chipsId = chips.length > 0 ? chips[0].product_id : 3;
        const cookiesId = cookies.length > 0 ? cookies[0].product_id : 4;
        const milkId = milk.length > 0 ? milk[0].product_id : 5;

        await connection.query(`
          INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
          (?, ?, 5, 'Chilled and refreshing, perfect for hot days!'),
          (?, ?, 4, 'Crispy and salted perfectly. Goes well with drinks.'),
          (?, ?, 5, 'So soft and chocolatey, absolutely love them!'),
          (?, ?, 4, 'Fresh, pasteurized and very creamy.')
        `, [cokeId, johnId, chipsId, johnId, cookiesId, johnId, milkId, johnId]);

        // Add one from admin
        await connection.query(`
          INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
          (?, ?, 5, 'High quality packaging, highly recommended.')
        `, [chipsId, adminId]);

        console.log("Seeded basic ratings/reviews.");
      }
    }

    // Seed Warehouse Manager user mapping to Gurugram Central Hub (warehouse_id = 1)
    const [whMgr] = await connection.query("SELECT id FROM users WHERE email = 'warehouse@snacko.com'");
    if (whMgr.length === 0) {
      console.log("Seeding Gurugram Warehouse Manager user...");
      const bcrypt = require("bcryptjs");
      const mgrPassword = await bcrypt.hash("admin123", 10);
      await connection.query(`
        INSERT INTO users (name, email, password, mobile, role, warehouse_id)
        VALUES ('Gurugram Warehouse Manager', 'warehouse@snacko.com', ?, '9876543212', 'admin', 1)
      `, [mgrPassword]);
      console.log("Seeded Gurugram Warehouse Manager (warehouse@snacko.com / admin123) mapped to warehouse 1.");
    }

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = initDb;
