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
 * Apply modified data from UI to the product object
 */
function applyModifiedData(product, modifiedData = {}) {
    if (!modifiedData || Object.keys(modifiedData).length === 0) return product;

    const updatedProduct = JSON.parse(JSON.stringify(product));

    Object.entries(modifiedData).forEach(([path, value]) => {
        const parts = path.split('.');
        if (parts[0] === 'sensory') {
            updatedProduct.sensoryIndicators[parts[1]] = value;
        } else if (parts[0] === 'physical') {
            const index = parseInt(parts[1]);
            if (updatedProduct.physicalChemical[index]) {
                updatedProduct.physicalChemical[index].value = value;
            }
        } else if (parts[0] === 'micro') {
            const index = parseInt(parts[1]);
            if (updatedProduct.microbiological[index]) {
                updatedProduct.microbiological[index].limit = value;
            }
        } else if (parts[0] === 'heavy') {
            const index = parseInt(parts[1]);
            if (updatedProduct.heavyMetals[index]) {
                updatedProduct.heavyMetals[index].limit = value;
            }
        }
    });

    return updatedProduct;
}

/**
 * Generate TCCS (Tiêu chuẩn cơ sở) document
 */
async function generateTCCS(product, format, user, modifiedData) {
    await ensureExportsDir();
    const p = applyModifiedData(product, modifiedData);

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: (user.company || '[Tên công ty]').toUpperCase(),
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: `Địa chỉ: ${user.address || '[Địa chỉ công ty]'}`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '-------------------------------------------',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'TIÊU CHUẨN CƠ SỞ',
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: p.name.toUpperCase(),
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
                    text: `Tiêu chuẩn này áp dụng cho sản phẩm ${p.name} do ${user.company || '[Tên công ty]'} sản xuất và kinh doanh.`,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '2. CHỈ TIÊU CẢM QUAN',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Màu sắc: ${p.sensoryIndicators?.color}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Mùi: ${p.sensoryIndicators?.smell}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Vị: ${p.sensoryIndicators?.taste}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Trạng thái: ${p.sensoryIndicators?.texture}`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3. CHỈ TIÊU LÝ HÓA',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                ...generatePhysicalChemicalSection(p),
                new Paragraph({
                    text: '4. CHỈ TIÊU VI SINH',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                ...generateMicrobiologicalSection(p),
                new Paragraph({
                    text: '\n\n',
                    spacing: { before: 800 }
                }),
                new Paragraph({
                    text: `Đại diện doanh nghiệp: ${user.name}`,
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 400 }
                }),
                new Paragraph({
                    text: `Chức vụ: ${user.representativeRole || 'Giám đốc'}`,
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 100 }
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `TCCS_${p.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
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
async function generateTestingForm(product, format, user, modifiedData) {
    await ensureExportsDir();
    const p = applyModifiedData(product, modifiedData);

    const testingData = {
        company: user.company,
        address: user.address,
        phone: user.phone,
        productName: p.name,
        productCode: p.code,
        requirements: p.testingRequirements || [],
        totalCost: p.testingRequirements?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0
    };

    const filename = `PhieuKN_${p.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(testingData, null, 2));

    return { filename, filepath };
}

/**
 * Generate Declaration Form
 */
async function generateDeclaration(product, format, user, modifiedData) {
    await ensureExportsDir();
    const p = applyModifiedData(product, modifiedData);

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    alignment: AlignmentType.CENTER,
                    heading: 'Heading1'
                }),
                new Paragraph({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'BẢN TỰ CÔNG BỐ SẢN PHẨM',
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'I. Thông tin về tổ chức, cá nhân tự công bố sản phẩm',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `Tên tổ chức, cá nhân: ${user.company || '[Tên công ty]'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Địa chỉ: ${user.address || '[Địa chỉ]'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Điện thoại: ${user.phone || '[Điện thoại]'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `Mã số doanh nghiệp: ${user.taxCode || '[Mã số thuế]'}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: 'II. Thông tin về sản phẩm',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `1. Tên sản phẩm: ${p.name}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `2. Mã HS: ${p.code}`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: `3. Thành phần: [Như đã liệt kê trong hồ sơ kỹ thuật]`,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    text: 'III. Mẫu nhãn sản phẩm',
                    heading: 'Heading3',
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: '(Đính kèm mẫu nhãn dự kiến)',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: 'Chúng tôi xin cam đoan thực hiện đúng quy định của pháp luật!',
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 600 }
                }),
                new Paragraph({
                    text: `${user.name}`,
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 800 }
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `CongBo_${p.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, buffer);

    return { filename, filepath };
}

/**
 * Generate Label Template
 */
async function generateLabel(product, format, user, modifiedData) {
    await ensureExportsDir();
    const p = applyModifiedData(product, modifiedData);

    const labelContent = `
===========================================
        ${p.name.toUpperCase()}
===========================================

Mã sản phẩm: ${p.code}
Thành phần: ${p.labelingRequirements?.find(r => r.requirement === 'Thành phần')?.detail || '[X]'}

NSX: DD/MM/YYYY
HSD: DD/MM/YYYY

Sản xuất tại:
${user.company}
Địa chỉ: ${user.address}
Điện thoại: ${user.phone}
MST: ${user.taxCode}

Hướng dẫn: ${p.labelingRequirements?.find(r => r.requirement === 'Hướng dẫn bảo quản')?.detail || 'Nơi khô ráo'}
===========================================
  `;

    const filename = `Nhan_${p.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await fs.writeFile(filepath, labelContent);

    return { filename, filepath };
}

/**
 * Generate all documents as ZIP
 */
async function generateAllDocuments(product, user, modifiedData) {
    await ensureExportsDir();

    const tccs = await generateTCCS(product, 'docx', user, modifiedData);
    const testing = await generateTestingForm(product, 'json', user, modifiedData);
    const declaration = await generateDeclaration(product, 'docx', user, modifiedData);
    const label = await generateLabel(product, 'txt', user, modifiedData);

    const manifest = {
        files: [tccs.filename, testing.filename, declaration.filename, label.filename],
        company: user.company,
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
