import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sql from './db.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Init DB Tables
async function initDB() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
        await sql`
      CREATE TABLE IF NOT EXISTS menus (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        owner_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        company_name TEXT,
        share_token TEXT UNIQUE NOT NULL,
        is_open BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
        await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT
      );
    `
        await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        buyer_name TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        content JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
        console.log('Database initialized')
    } catch (err) {
        console.error('Error initializing DB:', err)
    }
}

initDB()

// Auth / User Sync
app.post('/api/auth/login', async (req, res) => {
    const { userId, displayName, pictureUrl } = req.body
    try {
        await sql`
      INSERT INTO users (id, display_name, avatar_url)
      VALUES (${userId}, ${displayName}, ${pictureUrl})
      ON CONFLICT (id) DO UPDATE
      SET display_name = ${displayName}, avatar_url = ${pictureUrl}
    `
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Login failed' })
    }
})

// Get Menus (My Menus)
app.get('/api/menus', async (req, res) => {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId required' })

    try {
        const menus = await sql`
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM orders o WHERE o.menu_id = m.id) as order_count
      FROM menus m
      WHERE m.owner_id = ${userId}
      ORDER BY m.created_at DESC
    `
        res.json(menus)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Fetch menus failed' })
    }
})

// Create Menu
app.post('/api/menus', async (req, res) => {
    const { ownerId, title, companyName, items } = req.body
    const shareToken = Math.random().toString(36).substring(2, 10)

    try {
        const [menu] = await sql`
      INSERT INTO menus (owner_id, title, company_name, share_token)
      VALUES (${ownerId}, ${title}, ${companyName}, ${shareToken})
      RETURNING id, share_token
    `

        for (const item of items) {
            await sql`
        INSERT INTO menu_items (menu_id, name, price, description)
        VALUES (${menu.id}, ${item.name}, ${item.price}, ${item.description})
      `
        }

        res.json(menu)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Create menu failed' })
    }
})

// Get Menu by Token (Public)
app.get('/api/menus/:token', async (req, res) => {
    const { token } = req.params
    try {
        const [menu] = await sql`SELECT * FROM menus WHERE share_token = ${token}`
        if (!menu) return res.status(404).json({ error: 'Menu not found' })

        const items = await sql`SELECT * FROM menu_items WHERE menu_id = ${menu.id}`
        res.json({ menu, items })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Fetch menu failed' })
    }
})

// Submit Order
app.post('/api/orders', async (req, res) => {
    const { menuId, buyerName, totalPrice, content } = req.body
    try {
        await sql`
      INSERT INTO orders (menu_id, buyer_name, total_price, content)
      VALUES (${menuId}, ${buyerName}, ${totalPrice}, ${content})
    `
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Order failed' })
    }
})

// Export Orders
app.get('/api/menus/:id/orders', async (req, res) => {
    const { id } = req.params
    try {
        const orders = await sql`SELECT * FROM orders WHERE menu_id = ${id}`
        res.json(orders)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Fetch orders failed' })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
