const { z } = require('zod');

const createProductSchema = z.object({
    name: z.string().min(2),
    category: z.string(),
    metal: z.string(),
    purity: z.string(),
    grossWeight: z.number().positive(),
    netWeight: z.number().positive(),
    stoneWeight: z.number().min(0),
    wastage: z.number().min(0),
    makingCharges: z.number().min(0),
    price: z.number().positive(),
    stock: z.number().int().min(0).default(0),
    barcode: z.string().optional(),
});

const d = { name: 'earring', category: 'jumka', metal: 'Gold', purity: '22k', grossWeight: '2.01', netWeight: '4.00', wastage: '0', makingCharges: '30000', price: '50000' };

const payload = {
    ...d,
    grossWeight: Number(d.grossWeight),
    netWeight: Number(d.netWeight),
    stoneWeight: Number(d.stoneWeight) || 0,
    wastage: Number(d.wastage) || 0,
    makingCharges: Number(d.makingCharges),
    price: Number(d.price),
    stock: Number(d.stock) || 0,
};

try {
    const res = createProductSchema.parse(payload);
    console.log("Success", res);
} catch (e) {
    console.error(e.errors);
}
