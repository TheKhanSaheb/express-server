import express, { type Application, type Request, type Response } from 'express'
import { Pool } from 'pg'
import config from './config'

const app: Application = express()
const port = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text())

const pool = new Pool({
    connectionString: config.connection_string
})

// Initialize database
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                age INT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `)

        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Error initializing database:', error)
    }
}

initDB()

// Home route
app.get('/', (req: Request, res: Response) => {
    res.send('Server is running')
})

// POST route
app.post('/api/users', async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, age]
        )

        res.status(200).json({
            message: 'User inserted successfully',
            data: result.rows[0]
        })
    } catch (error) {
        console.error('Error inserting user data:', error)

        res.status(500).json({
            error: 'Internal Server Error',
            data: error
        })
    }
})




app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`)
        res.status(200).json({
            message: 'Users fetched successfully',
            data: result.rows
        })






    }
   
   
   
    catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({
            error: 'Internal Server Error',
            data: error
        })
    }


})

app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = req.params.id

    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId])
        res.status(200).json({
            message: 'User fetched successfully',
            data: result.rows[0]
        })

        if (result.rows.length === 0) {
            res.status(404).json({
                error: 'User not found'
            })
        }


    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({
            error: 'Internal Server Error',
            data: error
        })
    }
})

app.put('/api/users/:id', async (req: Request, res: Response) => {
    const userId = req.params.id
    const { name, email, password, age } = req.body

    try {
        const result = await

            pool.query(
                `UPDATE users SET name = $1, email = $2, password = $3, age = $4 WHERE id = $5 RETURNING *`,
                [name, email, password, age, userId]
            )
        res.status(200).json({
            message: 'User updated successfully',
            data: result.rows[0]
        })

        if (result.rows.length === 0) {
            res.status(404).json({
                error: 'User not found'
            })

        }
    } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).json({
            error: 'Internal Server Error',
            data: error
        })
    }
})

app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const userId = req.params.id
    try {
        const result = await
            pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [userId])
        res.status(200).json({
            message: 'User deleted successfully',
            data: result.rows[0]
        })
        if (result.rows.length === 0) {
            res.status(404).json({
                error: 'User not found'
            })
        }
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({
            error: 'Internal Server Error',
            data: error
        })
    }
})


// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})