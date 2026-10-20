const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const senha = bcrypt.hashSync('Demo@1234', 10);

async function main() {
  let admin, jogador;
  try {
    admin = await prisma.user.upsert({ where: { email: 'admin@demo.app' }, update: {}, create: { email: 'admin@demo.app', name: 'Administrador Demo', passwordHash: senha, role: 'admin', plan: 'pro', termsAcceptedAt: new Date() } });
    jogador = await prisma.user.upsert({ where: { email: 'jogador@demo.app' }, update: {}, create: { email: 'jogador@demo.app', name: 'João Jogador', passwordHash: senha, role: 'user', plan: 'free', termsAcceptedAt: new Date() } });
    await prisma.user.upsert({ where: { email: 'maria@demo.app' }, update: {}, create: { email: 'maria@demo.app', name: 'Maria Silva', passwordHash: senha, role: 'user', plan: 'free', termsAcceptedAt: new Date() } });
    await prisma.user.upsert({ where: { email: 'carlos@demo.app' }, update: {}, create: { email: 'carlos@demo.app', name: 'Carlos Souza', passwordHash: senha, role: 'user', plan: 'free', termsAcceptedAt: new Date() } });
  } catch (e) { console.warn('[seed] pulou User:', e.message); }

  try {
    const n = await prisma.project.count();
    if (n === 0 && admin) await prisma.project.createMany({ data: [
      { name: 'Projeto Alpha', ownerId: admin.id },
      { name: 'Projeto Beta', ownerId: admin.id },
    ]});
  } catch (e) { console.warn('[seed] pulou Project:', e.message); }

  let rests = [];
  try {
    const n = await prisma.restaurant.count();
    if (n === 0) {
      rests.push(await prisma.restaurant.create({ data: { name: 'Restaurante Sabor Brasileiro' } }));
      rests.push(await prisma.restaurant.create({ data: { name: 'Cantina Bella Itália' } }));
    } else { rests = await prisma.restaurant.findMany({ take: 2 }); }
  } catch (e) { console.warn('[seed] pulou Restaurant:', e.message); }

  let tables = [];
  try {
    const n = await prisma.table.count();
    if (n === 0 && rests.length >= 2) {
      for (let i = 1; i <= 4; i++) tables.push(await prisma.table.create({ data: { number: i, restaurantId: rests[0].id } }));
      for (let i = 1; i <= 4; i++) tables.push(await prisma.table.create({ data: { number: i, restaurantId: rests[1].id } }));
    } else { tables = await prisma.table.findMany(); }
  } catch (e) { console.warn('[seed] pulou Table:', e.message); }

  let cats = [];
  try {
    const n = await prisma.category.count();
    if (n === 0) {
      for (const name of ['Entradas', 'Pratos Principais', 'Sobremesas', 'Bebidas']) cats.push(await prisma.category.create({ data: { name } }));
    } else { cats = await prisma.category.findMany(); }
  } catch (e) { console.warn('[seed] pulou Category:', e.message); }

  let items = [];
  try {
    const n = await prisma.menuItem.count();
    if (n === 0 && rests.length >= 2 && cats.length >= 4) {
      const data = [
        { name: 'Bruschetta', description: 'Pão italiano com tomate e manjericão', price: 24.90, categoryId: cats[0].id, restaurantId: rests[1].id },
        { name: 'Feijoada Completa', description: 'Feijoada tradicional com arroz e couve', price: 59.90, categoryId: cats[1].id, restaurantId: rests[0].id },
        { name: 'Picanha na Brasa', description: 'Picanha grelhada com farofa', price: 89.90, categoryId: cats[1].id, restaurantId: rests[0].id },
        { name: 'Lasanha à Bolonhesa', description: 'Lasanha caseira com molho de carne', price: 54.90, categoryId: cats[1].id, restaurantId: rests[1].id },
        { name: 'Pudim de Leite', description: 'Pudim cremoso com calda de caramelo', price: 18.90, categoryId: cats[2].id, restaurantId: rests[0].id },
        { name: 'Caipirinha', description: 'Caipirinha de limão', price: 19.90, categoryId: cats[3].id, restaurantId: rests[0].id },
      ];
      for (const d of data) items.push(await prisma.menuItem.create({ data: d }));
    } else { items = await prisma.menuItem.findMany(); }
  } catch (e) { console.warn('[seed] pulou MenuItem:', e.message); }

  try {
    const n = await prisma.reservation.count();
    if (n === 0 && jogador && tables.length >= 3 && rests.length >= 1) {
      const now = Date.now();
      await prisma.reservation.createMany({ data: [
        { userId: jogador.id, tableId: tables[0].id, restaurantId: rests[0].id, startDate: new Date(now + 86400000), endDate: new Date(now + 86400000 + 7200000), status: 'confirmed' },
        { userId: jogador.id, tableId: tables[1].id, restaurantId: rests[0].id, startDate: new Date(now + 172800000), endDate: new Date(now + 172800000 + 7200000), status: 'pending' },
        { userId: jogador.id, tableId: tables[2].id, restaurantId: rests[0].id, startDate: new Date(now - 86400000), endDate: new Date(now - 86400000 + 7200000), status: 'completed' },
      ]});
    }
  } catch (e) { console.warn('[seed] pulou Reservation:', e.message); }

  try {
    const n = await prisma.order.count();
    if (n === 0 && jogador && tables.length >= 2 && items.length >= 3) {
      await prisma.order.createMany({ data: [
        { userId: jogador.id, tableId: tables[0].id, menuItemId: items[0].id, quantity: 2, status: 'delivered' },
        { userId: jogador.id, tableId: tables[0].id, menuItemId: items[1].id, quantity: 1, status: 'preparing' },
        { userId: jogador.id, tableId: tables[1].id, menuItemId: items[2].id, quantity: 3, status: 'pending' },
      ]});
    }
  } catch (e) { console.warn('[seed] pulou Order:', e.message); }

  try {
    const n = await prisma.notification.count();
    if (n === 0 && jogador) {
      await prisma.notification.createMany({ data: [
        { userId: jogador.id, message: 'Sua reserva foi confirmada para amanhã às 19h.', read: false },
        { userId: jogador.id, message: 'Seu pedido está sendo preparado.', read: false },
        { userId: jogador.id, message: 'Bem-vindo ao Sistema de Reservas!', read: true },
      ]});
    }
  } catch (e) { console.warn('[seed] pulou Notification:', e.message); }
}

main().then(()=>prisma.$disconnect()).catch(async(e)=>{console.error('[seed] ERRO:',e.message);await prisma.$disconnect();process.exitCode = 0;});