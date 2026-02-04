const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Sample products data from the demo
const sampleProducts = [
    {
        name: 'Cà phê bột - Rang xay nguyên chất',
        code: '0901.21.20',
        category: 'Chương 09 > 0901 > Cà phê đã rang, chưa khử caffeine > Đã xay',
        path: 'VNTR > BIỂU THUẾ > CHƯƠNG 09 > 0901',
        sensoryIndicators: {
            color: 'Nâu đậm đặc trưng của cà phê rang',
            smell: 'Mùi cà phê rang tự nhiên, thơm nồng, không mùi lạ',
            taste: 'Đắng dịu đặc trưng, hậu vị ngọt, không chất bảo quản',
            texture: 'Bột mịn, tơi xốp, không vón cục'
        },
        physicalChemical: [
            { indicator: 'Độ ẩm', value: '≤ 5.0%', method: 'TCVN 6722-1:2000' },
            { indicator: 'Hàm lượng Caffeine', value: '1.0 – 2.5%', method: 'AOAC 976.13' },
            { indicator: 'Tro tổng số', value: '≤ 5.0%', method: 'TCVN 6722-2:2000' },
            { indicator: 'Tro không tan trong HCl', value: '≤ 0.5%', method: 'TCVN 6722-3:2000' },
            { indicator: 'Chất hòa tan', value: '≥ 25%', method: 'TCVN 7538:2005' },
            { indicator: 'Tạp chất (Hạt đen, vỡ)', value: 'Không phát hiện', method: 'Kiểm tra cảm quan' }
        ],
        microbiological: [
            { indicator: 'Tổng số vi khuẩn hiếu khí', limit: '≤ 10⁵ CFU/g', method: 'TCVN 4884:2005' },
            { indicator: 'Coliforms', limit: '≤ 10² CFU/g', method: 'TCVN 6846:2008' },
            { indicator: 'E.coli', limit: 'Không phát hiện trong 1g', method: 'TCVN 6846:2008' },
            { indicator: 'Salmonella', limit: 'Không phát hiện/25g', method: 'TCVN 4829:2005' },
            { indicator: 'Nấm men, nấm mốc', limit: '≤ 10² CFU/g', method: 'TCVN 8275:2010' }
        ],
        heavyMetals: [
            { indicator: 'Chì (Pb)', limit: '≤ 0.2 mg/kg', method: 'AOAC 999.10' },
            { indicator: 'Cadimi (Cd)', limit: '≤ 0.1 mg/kg', method: 'AOAC 999.10' },
            { indicator: 'Asen (As)', limit: '≤ 0.2 mg/kg', method: 'AOAC 986.15' }
        ],
        mycotoxins: [
            { indicator: 'Ochratoxin A', limit: '≤ 5 µg/kg', method: 'EN 14132:2003' }
        ],
        testingRequirements: [
            { stt: 1, indicator: 'Chỉ tiêu Cảm quan (4 chỉ tiêu)', method: 'TCVN 5251:2007', cost: 400000, category: 'CHẤT LƯỢNG' },
            { stt: 2, indicator: 'Độ ẩm', method: 'TCVN 6722-1:2000', cost: 200000, category: 'CHẤT LƯỢNG' },
            { stt: 3, indicator: 'Hàm lượng Caffeine', method: 'AOAC 976.13', cost: 600000, category: 'CHẤT LƯỢNG' },
            { stt: 4, indicator: 'Tổng số vi khuẩn hiếu khí', method: 'TCVN 4884:2005', cost: 300000, category: 'VI SINH' },
            { stt: 5, indicator: 'E.coli & Salmonella', method: 'TCVN ISO', cost: 1100000, category: 'VI SINH' },
            { stt: 6, indicator: 'Kim loại nặng (Pb, Cd, As)', method: 'ICP-MS', cost: 1500000, category: 'KIM LOẠI NẶNG' }
        ],
        packagingRequirements: {
            packageType: 'Túi màng nhôm composite, van một chiều bảo quản hương vị',
            standard: 'QCVN 12-1:2011/BYT (Bao bì nhựa tiếp xúc trực tiếp)',
            features: 'Ngăn oxy, độ ẩm, tia UV, giữ hương thơm cà phê lâu dài'
        },
        labelingRequirements: [
            { requirement: 'Tên hàng hóa', detail: 'CÀ PHÊ BỘT RANG XAY' },
            { requirement: 'Thành phần', detail: 'Cà phê Robusta (80%), Arabica (20%)' },
            { requirement: 'Trọng lượng', detail: 'Net Weight: 500g / 1.1 lbs' },
            { requirement: 'Thông tin cảnh báo', detail: 'Không dùng sản phẩm quá hạn sử dụng' },
            { requirement: 'Xuất xứ', detail: 'Made in Vietnam (Buôn Ma Thuột)' },
            { requirement: 'NSX & HSD', detail: 'In trên bao bì (Sử dụng tốt nhất trong 12 tháng)' }
        ]
    },
    {
        name: 'Nước mắm truyền thống',
        code: '2103.90.12',
        category: 'Chương 21 > 2103 > Nước xốt và các chế phẩm làm nước xốt > Nước mắm',
        path: 'VNTR > BIỂU THUẾ > CHƯƠNG 21 > 2103',
        sensoryIndicators: {
            color: 'Nâu đỏ cánh gián, trong suốt, không lắng cặn',
            smell: 'Mùi thơm đặc trưng của cá ngâm muối lâu ngày',
            taste: 'Mặn đầu lưỡi, ngọt hậu thanh, vị đạm tự nhiên',
            texture: 'Lỏng, sánh đặc trưng của nước mắm cốt'
        },
        physicalChemical: [
            { indicator: 'Hàm lượng Nitơ tổng số (Độ đạm)', value: '≥ 40 g/l', method: 'TCVN 3705:1990' },
            { indicator: 'Hàm lượng Nitơ axit amin', value: '≥ 50% nitơ tổng số', method: 'TCVN 3708:1990' },
            { indicator: 'Hàm lượng Muối (NaCl)', value: '245 - 280 g/l', method: 'TCVN 3701:2009' }
        ],
        microbiological: [
            { indicator: 'Clostridium perfringens', limit: '0 CFU/g', method: 'TCVN 4991:2005' },
            { indicator: 'S. aureus', limit: '0 CFU/g', method: 'TCVN 4830:2005' }
        ],
        testingRequirements: [
            { stt: 1, indicator: 'Độ đạm tổng số', method: 'TCVN 3705', cost: 350000, category: 'CHẤT LƯỢNG' },
            { stt: 2, indicator: 'Nitơ axit amin', method: 'TCVN 3708', cost: 400000, category: 'CHẤT LƯỢNG' },
            { stt: 3, indicator: 'Vi sinh ATTP', method: 'TCVN ISO', cost: 1200000, category: 'VI SINH' }
        ],
        packagingRequirements: {
            packageType: 'Chai thủy tinh trung tính hoặc nhựa PET thực phẩm',
            standard: 'QCVN 12-1:2011/BYT & QCVN 12-4:2015/BYT',
            features: 'Chịu mặn, ngăn ánh sáng làm biến màu nước mắm'
        }
    },
    {
        name: 'Bánh quy ngọt không chứa ca cao',
        code: '1905.31.20',
        category: 'Chương 19 > 1905 > Bánh quy ngọt > Loại khác',
        path: 'VNTR > BIỂU THUẾ > CHƯƠNG 19 > 1905',
        sensoryIndicators: {
            color: 'Vàng đều, không cháy sém',
            smell: 'Thơm mùi bơ sữa và vanilla',
            taste: 'Ngọt thanh, béo ngậy, không vị lạ',
            texture: 'Giòn tan, không mềm ỉu'
        },
        testingRequirements: [
            { stt: 1, indicator: 'Độ ẩm & Tro', method: 'TCVN', cost: 300000, category: 'CHẤT LƯỢNG' },
            { stt: 2, indicator: 'Đường tổng số', method: 'TCVN', cost: 350000, category: 'CHẤT LƯỢNG' },
            { stt: 3, indicator: 'Kim loại nặng', method: 'TCVN', cost: 1200000, category: 'AN TOÀN' }
        ]
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

const seedDatabase = async (exitAfter = true) => {
    try {
        // Add same connection options as server.js
        const mongooseOptions = {
            family: 4
        };

        // Connect to MongoDB only if not already connected
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tcvn-system', mongooseOptions);
            console.log('✅ MongoDB connected via seeder');
        }

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

        if (exitAfter) process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        if (exitAfter) process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
