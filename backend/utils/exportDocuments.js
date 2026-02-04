const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const fs = require('fs').promises;
const fsSync = require('fs');
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
    const timestamp = Date.now();

    if (format === 'pdf') {
        const filename = `TCCS_${p.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        const filepath = path.join(EXPORTS_DIR, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fsSync.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(14).text((user.company || '[Tên công ty]').toUpperCase(), { align: 'center' });
        doc.fontSize(10).text(`Địa chỉ: ${user.address || '[Địa chỉ công ty]'}`, { align: 'center' });
        doc.moveDown();
        doc.text('-------------------------------------------', { align: 'center' });
        doc.moveDown();

        // Title
        doc.fontSize(18).text('TIÊU CHUẨN CƠ SỞ', { align: 'center' });
        doc.fontSize(14).text(p.name.toUpperCase(), { align: 'center' });
        doc.moveDown(2);

        // Content
        doc.fontSize(12).text('1. PHẠM VI ÁP DỤNG', { underline: true });
        doc.fontSize(11).text(`Tiêu chuẩn này áp dụng cho sản phẩm ${p.name} do ${user.company || '[Tên công ty]'} sản xuất và kinh doanh.`);
        doc.moveDown();

        doc.fontSize(12).text('2. CHỈ TIÊU CẢM QUAN', { underline: true });
        doc.fontSize(11).text(`- Màu sắc: ${p.sensoryIndicators?.color}`);
        doc.text(`- Mùi: ${p.sensoryIndicators?.smell}`);
        doc.text(`- Vị: ${p.sensoryIndicators?.taste}`);
        doc.text(`- Trạng thái: ${p.sensoryIndicators?.texture}`);
        doc.moveDown();

        doc.fontSize(12).text('3. CHỈ TIÊU LÝ HÓA', { underline: true });
        if (p.physicalChemical && p.physicalChemical.length > 0) {
            p.physicalChemical.forEach(item => {
                doc.fontSize(11).text(`- ${item.indicator}: ${item.value} (${item.method})`);
            });
        } else {
            doc.fontSize(11).text('Theo quy định của tiêu chuẩn liên quan');
        }
        doc.moveDown();

        doc.fontSize(12).text('4. CHỈ TIÊU VI SINH', { underline: true });
        if (p.microbiological && p.microbiological.length > 0) {
            p.microbiological.forEach(item => {
                doc.fontSize(11).text(`- ${item.indicator}: ${item.limit} (${item.method})`);
            });
        } else {
            doc.fontSize(11).text('Theo QCVN 8-3:2012/BYT');
        }

        // Footer
        doc.moveDown(4);
        doc.fontSize(11).text(`Đại diện doanh nghiệp: ${user.name}`, { align: 'right' });
        doc.text(`Chức vụ: ${user.representativeRole || 'Giám đốc'}`, { align: 'right' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ filename, filepath }));
            stream.on('error', reject);
        });
    } else {
        // Existing Word (DOCX) logic
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
        const filename = `TCCS_${p.name.replace(/\s+/g, '_')}_${timestamp}.docx`;
        const filepath = path.join(EXPORTS_DIR, filename);

        await fs.writeFile(filepath, buffer);

        return { filename, filepath };
    }
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
    const timestamp = Date.now();

    if (format === 'pdf') {
        const filename = `PhieuKN_${p.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        const filepath = path.join(EXPORTS_DIR, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fsSync.createWriteStream(filepath);
        doc.pipe(stream);

        doc.fontSize(14).text('PHIẾU YÊU CẦU KIỂM NGHIỆM', { align: 'center', bold: true });
        doc.moveDown();
        doc.fontSize(11).text(`Khách hàng: ${user.company || user.name}`);
        doc.text(`Địa chỉ: ${user.address || ''}`);
        doc.text(`Sản phẩm: ${p.name}`);
        doc.text(`Mã HS: ${p.code}`);
        doc.moveDown();

        doc.fontSize(12).text('Danh sách chỉ tiêu yêu cầu:', { underline: true });
        doc.moveDown(0.5);

        if (p.testingRequirements && p.testingRequirements.length > 0) {
            let total = 0;
            p.testingRequirements.forEach((item, index) => {
                doc.fontSize(11).text(`${index + 1}. ${item.indicator} - ${item.method} - Chi phí: ${item.cost?.toLocaleString()} VNĐ`);
                total += (item.cost || 0);
            });
            doc.moveDown();
            doc.fontSize(12).text(`TỔNG CHI PHÍ ƯỚC TÍNH: ${total.toLocaleString()} VNĐ`, { bold: true });
        }

        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ filename, filepath }));
            stream.on('error', reject);
        });
    } else {
        const testingData = {
            company: user.company,
            address: user.address,
            phone: user.phone,
            productName: p.name,
            productCode: p.code,
            requirements: p.testingRequirements || [],
            totalCost: p.testingRequirements?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0
        };
        const filename = `PhieuKN_${p.name.replace(/\s+/g, '_')}_${timestamp}.json`;
        const filepath = path.join(EXPORTS_DIR, filename);
        await fs.writeFile(filepath, JSON.stringify(testingData, null, 2));
        return { filename, filepath };
    }
}

/**
 * Generate Label Template
 */
async function generateLabel(product, format, user, modifiedData) {
    await ensureExportsDir();
    const p = applyModifiedData(product, modifiedData);
    const timestamp = Date.now();

    if (format === 'pdf') {
        const filename = `Nhan_${p.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        const filepath = path.join(EXPORTS_DIR, filename);
        const doc = new PDFDocument({ size: [400, 300], margin: 20 });
        const stream = fsSync.createWriteStream(filepath);
        doc.pipe(stream);

        doc.rect(10, 10, 380, 280).stroke();
        doc.fontSize(16).text(p.name.toUpperCase(), { align: 'center', bold: true });
        doc.moveDown();
        doc.fontSize(10).text(`Mã HS: ${p.code}`, { align: 'left' });
        doc.text(`Thành phần: ${p.labelingRequirements?.find(r => r.requirement === 'Thành phần')?.detail || '[X]'}`);
        doc.moveDown(0.5);
        doc.text('NSX: .................... HSD: ....................');
        doc.moveDown();
        doc.text('Sản xuất bởi:', { bold: true });
        doc.text(`${user.company || '[Tên công ty]'}`);
        doc.text(`Địa chỉ: ${user.address || '[Địa chỉ]'}`);
        doc.text(`MST: ${user.taxCode || ''} | ĐT: ${user.phone || ''}`);
        doc.moveDown();
        doc.text(`HD Bảo quản: ${p.labelingRequirements?.find(r => r.requirement === 'Hướng dẫn bảo quản')?.detail || 'Nơi khô ráo'}`, { size: 8 });

        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ filename, filepath }));
            stream.on('error', reject);
        });
    } else {
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
===========================================`;
        const filename = `Nhan_${p.name.replace(/\s+/g, '_')}_${timestamp}.txt`;
        const filepath = path.join(EXPORTS_DIR, filename);
        await fs.writeFile(filepath, labelContent);
        return { filename, filepath };
    }
}

/**
 * Generate all documents as ZIP
 */
async function generateAllDocuments(product, user, modifiedData) {
    await ensureExportsDir();
    const timestamp = Date.now();
    const zipFilename = `HoSoFull_${product.name.replace(/\s+/g, '_')}_${timestamp}.zip`;
    const zipFilepath = path.join(EXPORTS_DIR, zipFilename);

    const output = fsSync.createWriteStream(zipFilepath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise(async (resolve, reject) => {
        output.on('close', () => resolve({ filename: zipFilename, filepath: zipFilepath }));
        archive.on('error', reject);
        archive.pipe(output);

        // Generate files in PDF
        const tccs = await generateTCCS(product, 'pdf', user, modifiedData);
        const testing = await generateTestingForm(product, 'pdf', user, modifiedData);
        const declaration = await generateDeclaration(product, 'pdf', user, modifiedData);
        const label = await generateLabel(product, 'pdf', user, modifiedData);

        archive.file(tccs.filepath, { name: tccs.filename });
        archive.file(testing.filepath, { name: testing.filename });
        archive.file(declaration.filepath, { name: declaration.filename });
        archive.file(label.filepath, { name: label.filename });

        archive.finalize();
    });
}

module.exports = {
    generateTCCS,
    generateTestingForm,
    generateDeclaration,
    generateLabel,
    generateAllDocuments
};
