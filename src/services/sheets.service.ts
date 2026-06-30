import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let doc: GoogleSpreadsheet | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
  if (doc) return doc;

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID not configured');
  }

  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();
  return doc;
}

export interface OrderData {
  title: string;
  quantity: number;
  material: string;
  deliveryType: string;
  totalPrice: number;
  shippingCost: number;
  paymentMethod: string;
  printerName: string;
  productionCost: number;
  pribyl: number;
  nalog: number;
  komPlat: number;
  komMesta: number;
  contactMethod?: string;
  driveLink?: string;
  comment?: string;
  tempFilePath?: string;
  plannedShipDate?: string;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function addOrderToTable(order: OrderData): Promise<void> {
  const spreadsheet = await getDoc();
  const sheet = spreadsheet.sheetsByIndex[0];

  const date = new Date();

  await sheet.addRow({
    'Дата': formatDate(date),
    'Изделие': order.title,
    'Кол-во': order.quantity,
    'Материал': order.material,
    'Место продажи': 'Сайт',
    'Доставка': order.deliveryType,
    'Сумма продажи': order.totalPrice,
    'Сумма доставки': order.shippingCost,
    'Форма платежа': order.paymentMethod,
    'Принтер': order.printerName,
    'Затраты на пр-во': order.productionCost,
    'Прибыль': order.pribyl,
    'Год': date.getFullYear(),
    'Месяц': date.getMonth() + 1,
    'Ком. места прод.': order.komMesta || 0,
    'Ком. платежа': order.komPlat,
    'Налог': order.nalog,
    'Способ контакта': order.contactMethod || 'Сайт',
    'Дата отправки по договоренности': order.plannedShipDate || '',
    'Статус': 'Новый',
    'Комментарий': order.driveLink || order.comment || '',
  });
}