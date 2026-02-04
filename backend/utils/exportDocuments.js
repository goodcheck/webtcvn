const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');
const fs = require('fs').promises;
const path = require('path');

// Ensure exports directory exists
const EXPORTS_DIR = path.join(__dirname, '..', 'exports');

async function ensureExportsDir() {
    try {
        await fs.access(EXPORTS_DIR);
    } catch {
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
    }
}

/**
 * Generate TCCS (Tiêu chuẩn cơ sở) document
 */
async function generateTCCS(product, format, user) {
    await ensureExportsDir();

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: 'TIÊU CHUẨN CƠ SỞ',
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: product.name.toUpperCase(),
                    heading: 'Heading2',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 }
                }),
                new Paragraph({
                    text: '1. PHẠM VI ÁP DỤNG',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Tiêu chuẩn này áp dụng cho sản phẩm ${product.name} do ${user.company || '[Tên công ty]'} sản xuất.`,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '2. CHỈ TIÊU CẢM QUAN',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Màu sắc: ${product.sensoryIndicators?.color || 'Đặc trưng của sản phẩm'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Mùi: ${product.sensoryIndicators?.smell || 'Tự nhiên, không mùi lạ'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Vị: ${product.sensoryIndicators?.taste || 'Đặc trưng của sản phẩm'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Trạng thái: ${product.sensoryIndicators?.texture || 'Đồng đều'}`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3. CHỈ TIÊU LÝ HÓA',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                ...generatePhysicalChemicalSection(product),
                new Paragraph({
                    text: '4. CHỈ TIÊU VI SINH',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                ...generateMicrobiologicalSection(product),
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `TCCS_${product.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, buffer);

    return { filename, filepath };
}

function generatePhysicalChemicalSection(product) {
    if (!product.physicalChemical || product.physicalChemical.length === 0) {
        return [new Paragraph({ text: 'Theo quy định của tiêu chuẩn liên quan', spacing: { after: 200 } })];
    }

    return product.physicalChemical.map(item =>
        new Paragraph({
            text: `${item.indicator}: ${item.value} (${item.method})`,
            spacing: { after: 100 }
        })
    );
}

function generateMicrobiologicalSection(product) {
    if (!product.microbiological || product.microbiological.length === 0) {
        return [new Paragraph({ text: 'Theo QCVN 8-3:2012/BYT', spacing: { after: 200 } })];
    }

    return product.microbiological.map(item =>
        new Paragraph({
            text: `${item.indicator}: ${item.limit} (${item.method})`,
            spacing: { after: 100 }
        })
    );
}

/**
 * Generate Testing Form
 */
async function generateTestingForm(product, format) {
    await ensureExportsDir();

    // For simplicity, create a JSON file (in production, use xlsx library)
    const testingData = {
        productName: product.name,
        productCode: product.code,
        requirements: product.testingRequirements || [],
        totalCost: product.testingRequirements?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0
    };

    const filename = `PhieuKN_${product.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(testingData, null, 2));

    return { filename, filepath };
}

/**
 * Generate Declaration Form
 */
async function generateDeclaration(product, format, user) {
    await ensureExportsDir();

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: 'ĐƠN CÔNG BỐ SẢN PHẨM',
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'THÔNG TIN DOANH NGHIỆP',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Tên doanh nghiệp: ${user.company || '[Tên công ty]'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Người đại diện: ${user.name}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Email: ${user.email}`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'THÔNG TIN SẢN PHẨM',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Tên sản phẩm: ${product.name}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Mã HS: ${product.code}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Danh mục: ${product.category}`,
                    spacing: { after: 400 }
                }),
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `CongBo_${product.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, buffer);

    return { filename, filepath };
}

/**
 * Generate Label Template
 */
async function generateLabel(product, format) {
    await ensureExportsDir();

    // For simplicity, create a text file (in production, use canvas or PDF)
    const labelContent = `
===========================================
        ${product.name.toUpperCase()}
===========================================

Mã sản phẩm: ${product.code}
Danh mục: ${product.category}

Thành phần: [Nhập thành phần]
Khối lượng tịnh: [Nhập khối lượng]

NSX: DD/MM/YYYY
HSD: DD/MM/YYYY

Bảo quản: Nơi khô ráo, tránh ánh nắng

[Tên công ty]
[Địa chỉ]
[Số điện thoại]
===========================================
  `;

    const filename = `Nhan_${product.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, labelContent);

    return { filename, filepath };
}

/**
 * Generate all documents as ZIP
 */
async function generateAllDocuments(product, user) {
    await ensureExportsDir();

    // Generate all documents
    const tccs = await generateTCCS(product, 'docx', user);
    const testing = await generateTestingForm(product, 'json');
    const declaration = await generateDeclaration(product, 'docx', user);
    const label = await generateLabel(product, 'txt');

    // In production, use archiver to create ZIP
    // For now, return a manifest
    const manifest = {
        files: [tccs.filename, testing.filename, declaration.filename, label.filename],
        product: product.name,
        generatedAt: new Date().toISOString()
    };

    const filename = `ToanBo_${product.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(manifest, null, 2));

    return { filename, filepath };
}

module.exports = {
    generateTCCS,
    generateTestingForm,
    generateDeclaration,
    generateLabel,
    generateAllDocuments
};
