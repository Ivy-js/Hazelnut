/* ******************************************************************************************************* */
/*                                                                                                         */
/*                                                              :::::::::::    :::     :::    :::   :::    */
/*   main.js                                                    :+:        :+:     :+:    :+:   :+:        */
/*                                                             +:+        +:+     +:+     +:+ +:+          */
/*   By: Ivy <contact@1sheol.xyz>                             +#+        +#+     +:+      +#++:            */
/*                                                           +#+         +#+   +#+        +#+              */
/*   Created: 2024/11/09 22:44:30 by Ivy                    #+#         #+#+#+#         #+#                */
/*   Updated: 2024/11/09 22:44:30 by Ivy              ###########        ###           ###                 */
/*                                                                                                         */
/* ******************************************************************************************************* */

const express = require("express")
const app = express()
const { v4: uuidv4 } = require("uuid")
const { QuickDB } = require("quick.db")
const db = new QuickDB()
require("colors")
app.use(express.json())


async function generateUniqueKey(format) {
    let key
    let exists = true
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    while (exists) {
        key = format.replace(/X/g, () => characters.charAt(Math.floor(Math.random() * characters.length)))
        exists = await db.has(key)
    }

    return key
}

app.post('/create-key', async (req, res) => {
    const { type, format, gifter } = req.body
    if (!format || !format.includes('X')) {
        return res.status(400).json({ error: "Invalid format. Format must include 'X' characters." })
    }
    const key = await generateUniqueKey(format)
    const expiration = getExpirationDate(type)
    
    await db.set(key, { type, expiration, gifter, redeemed: false })
    res.json({ key, type, expiration, gifter })

    console.log(`Hazelnut`.yellow +  ` Key created: ${key} (${type}, expires on ${expiration}) | Gifted by ${gifter}`.green)
})

app.post('/redeem-key', async (req, res) => {
    const { key } = req.body
    const keyData = await db.get(key)

    if (!keyData) {
        return res.status(404).json({ error: "Key not found" })
    }

    if (keyData.redeemed) {
        return res.status(400).json({ error: "Key already redeemed" })
    }

    if (new Date() > new Date(keyData.expiration)) {
        return res.status(400).json({ error: "Key expired" })
    }

    await db.set(key, { ...keyData, redeemed: true })
    res.json({ message: "Key redeemed successfully", success: true, gifter: keyData.gifter })
    console.log(`Hazelnut`.yellow + ` Key redeemed: ${key}`.green)  
})


function getExpirationDate(type) {
    const now = new Date()
    switch (type) {
        case 'daily':
            return new Date(now.setDate(now.getDate() + 1))
        case 'monthly':
            return new Date(now.setMonth(now.getMonth() + 1))
        case 'yearly':
            return new Date(now.setFullYear(now.getFullYear() + 1))
        case 'one-time':
            return now
        case 'lifetime':
            return new Date(9999, 11, 31)
        default:
            throw new Error("Invalid key type")
    }
}

const PORT = process.env.PORT || 1335
app.listen(PORT, () => {
    console.log(`Hazelnut `.yellow + ` Hazelnut API`.yellow + ` is running on port ${PORT}`)
})