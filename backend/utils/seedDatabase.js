const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Sample products data from the demo
const sampleProducts = [
    {
        name: 'Cà phê bột',
        code: '09011210',
        category: 'Chương 9 > 0901 > Cà phê, đã rang',
        path: 'CÀ PHÊ, CHÈ, CHÈ PARAGOAY VÀ CÁC LOẠI GIA VỊ',
        sensoryIndicators: {
            color: 'Nâu đậm đặc trưng của cà phê rang',
            smell: 'Mùi cà phê rang tự nhiên, không mùi lạ',
            taste: 'Đắng dịu đặc trưng, không mốc, không khét',
            texture: 'Bột mịn hoặc hạt đồng đều, không vón cục'
        },
        physicalChemical: [
            { indicator: 'Độ ẩm', value: '≤ 5%', method: 'TCVN 6722-1:2000' },
            { indicator: 'Hàm lượng Caffeine', value: '1.0 – 2.5%', method: 'AOAC 976.13' },
            { indicator: 'Tro tổng số', value: '≤ 5%', method: 'TCVN 6722-2:2000' },
            { indicator: 'Tro không tan trong HCl', value: '≤ 0.5%', method: 'TCVN 6722-3:2000' },
            { indicator: 'Chất hòa tan', value: '≥ 20%', method: 'TCVN 7538:2005' }
        ],
        microbiological: [
            { indicator: 'Tổng số vi khuẩn hiếu khí', limit: '≤ 10⁵ CFU/g', method: 'TCVN 4884:2005' },
            { indicator: 'Coliforms', limit: '≤ 10² CFU/g', method: 'TCVN 6846:2008' },
            { indicator: 'E.coli', limit: 'Không phát hiện trong 1g', method: 'TCVN 6846:2008' },
            { indicator: 'Salmonella', limit: 'Không phát hiện/25g', method: 'TCVN 4829:2005' }
        ],
        heavyMetals: [
            { indicator: 'Chì (Pb)', limit: '≤ 0.2 mg/kg', method: 'AOAC 999.10' },
            { indicator: 'Cadimi (Cd)', limit: '≤ 0.1 mg/kg', method: 'AOAC 999.10' },
            { indicator: 'Asen (As)', limit: '≤ 0.2 mg/kg', method: 'AOAC 986.15' }
        ],
        mycotoxins: [
            { indicator: 'Ochratoxin A', limit: '≤ 5 µg/kg', method: 'EN 14132:2003' },
            { indicator: 'Aflatoxin B1', limit: '≤ 5 µg/kg', method: 'AOAC 2005.08' }
        ],
        testingRequirements: [
            { stt: 1, indicator: 'Độ ẩm', method: 'TCVN 6722-1:2000', cost: 200000, category: 'CHẤT LƯỢNG' },
            { stt: 2, indicator: 'Caffeine', method: 'AOAC 976.13', cost: 500000, category: 'CHẤT LƯỢNG' },
            { stt: 3, indicator: 'Tro tổng số', method: 'TCVN 6722-2:2000', cost: 200000, category: 'CHẤT LƯỢNG' },
            { stt: 4, indicator: 'Tổng số vi khuẩn hiếu khí', method: 'TCVN 4884:2005', cost: 300000, category: 'VI SINH' },
            { stt: 5, indicator: 'E.coli', method: 'TCVN 6846:2008', cost: 350000, category: 'VI SINH' },
            { stt: 6, indicator: 'Salmonella', method: 'TCVN 4829:2005', cost: 800000, category: 'VI SINH' },
            { stt: 7, indicator: 'Chì (Pb)', method: 'AOAC 999.10', cost: 600000, category: 'KIM LOẠI NẶNG' },
            { stt: 8, indicator: 'Cadimi (Cd)', method: 'AOAC 999.10', cost: 600000, category: 'KIM LOẠI NẶNG' }
        ],
        packagingRequirements: {
            type: 'Túi composite, hộp kim loại đảm bảo tiếp xúc thực phẩm',
            standard: 'QCVN 12-1:2011/BYT',
            features: 'Kín khí, chống ẩm, không thấm mùi'
        },
        labelingRequirements: [
            { requirement: 'Tên sản phẩm', detail: 'CÀ PHÊ BỘT' },
            { requirement: 'Thành phần', detail: '100% hạt cà phê Robusta rang xay' },
            { requirement: 'Khối lượng tịnh', detail: '500g' },
            { requirement: 'Ngày sản xuất / HSD', detail: 'DD/MM/YYYY - 24 tháng từ NSX' },
            { requirement: 'Hướng dẫn bảo quản', detail: 'Nơi khô ráo, tránh ánh nắng trực tiếp' },
            { requirement: 'Tên & địa chỉ cơ sở SX', detail: '[Tên công ty - Địa chỉ - ĐT]' }
        ]
    },
    {
        name: 'Nước tinh khiết',
        code: '220190',
        category: 'Chương 22 > 2201 > Nước đóng chai',
        path: 'ĐỒ UỐNG, RƯỢU VÀ GIẤM',
        sensoryIndicators: {
            color: 'Trong suốt, không màu',
            smell: 'Không mùi',
            taste: 'Không vị lạ',
            texture: 'Lỏng, trong suốt'
        },
        physicalChemical: [
            { indicator: 'pH', value: '6.5 - 8.5', method: 'TCVN 6492:1999' },
            { indicator: 'Độ dẫn điện', value: '≤ 10 µS/cm', method: 'TCVN 6194:1996' }
        ],
        microbiological: [
            { indicator: 'Tổng số vi khuẩn hiếu khí', limit: '≤ 100 CFU/ml', method: 'TCVN 6189:2010' },
            { indicator: 'Coliforms', limit: 'Không phát hiện/100ml', method: 'TCVN 6187:2010' }
        ],
        testingRequirements: [
            { stt: 1, indicator: 'pH', method: 'TCVN 6492:1999', cost: 150000, category: 'CHẤT LƯỢNG' },
            { stt: 2, indicator: 'Tổng số vi khuẩn', method: 'TCVN 6189:2010', cost: 250000, category: 'VI SINH' }
        ],
        packagingRequirements: {
            type: 'Chai PET, bình PC đảm bảo tiếp xúc thực phẩm',
            standard: 'QCVN 12-1:2011/BYT',
            features: 'Kín, không thấm khí'
        }
    },
    {
        name: 'Bánh quy',
        code: '1905',
        category: 'Chương 19 > Bánh, bánh quy',
        path: 'CHẾ PHẨM TỪ NGŨ CỐC, BỘT, TINH BỘT',
        sensoryIndicators: {
            color: 'Vàng đồng đều',
            smell: 'Thơm đặc trưng',
            taste: 'Ngọt, giòn',
            texture: 'Giòn, không ẩm'
        }
    },
    {
        name: 'Gạo trắng',
        code: '1006',
        category: 'Chương 10 > Gạo',
        path: 'NGŨ CỐC',
        sensoryIndicators: {
            color: 'Trắng tự nhiên',
            smell: 'Mùi thơm tự nhiên',
            taste: 'Ngọt tự nhiên',
            texture: 'Hạt đồng đều'
        }
    },
    {
        name: 'Nước mắm',
        code: '2103',
        category: 'Chương 21 > Nước sốt, gia vị',
        path: 'CHẾ PHẨM THỰC PHẨM KHÁC',
        sensoryIndicators: {
            color: 'Nâu đỏ trong',
            smell: 'Mùi đặc trưng',
            taste: 'Mặn, umami',
            texture: 'Lỏng, trong'
        }
    },
    {
        name: 'Sữa tươi tiệt trùng',
        code: '0401',
        category: 'Chương 4 > Sữa và kem',
        path: 'SẢN PHẨM CỦA CÔNG NGHIỆP THỰC PHẨM',
        sensoryIndicators: {
            color: 'Trắng đồng đều',
            smell: 'Mùi sữa tự nhiên',
            taste: 'Ngọt nhẹ',
            texture: 'Lỏng đồng nhất'
        }
    }
];

// Sample admin user
const sampleAdmin = {
    name: 'Admin',
    email: 'admin@tcvn.vn',
    password: 'admin123',
    company: 'Hệ thống TCVN',
    role: 'admin'
};

const seedDatabase = async () => {
    try {
        // Add same connection options as server.js
        const mongooseOptions = {
            family: 4
        };

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tcvn-system', mongooseOptions);
        console.log('✅ MongoDB connected');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert products
        await Product.insertMany(sampleProducts);
        console.log(`✅ Inserted ${sampleProducts.length} products`);

        // Insert admin user
        await User.create(sampleAdmin);
        console.log('✅ Created admin user');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Admin credentials:');
        console.log('   Email: admin@tcvn.vn');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
