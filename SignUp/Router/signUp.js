import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import fs from 'fs';

const router = express.Router();
router.use(cors({origin:true, credentials: true}));
router.use(express.json());
router.use(bodyParser.urlencoded({extended : false}));

const connectInformation =
{
    host: '192.168.3.3',
    port: '4567',
    user: 'root',
    password: '1234',
    database: 'dev_work',
};

router.get('/idChecking/:userId', (req, res, next) =>
{
    const query = `SELECT * FROM USER`;
    const connection = mysql.createConnection(connectInformation);
    connection.promise().query(query)
        .then(([results, fields]) => results.map(object => object.user_id))
        .then(userIdArray => res.send(userIdArray.includes(req.params.userId)))
        .catch(error => res.status(500).send(error))
        .finally(() => connection.end());
});

router.post('/success', async (req, res, next) =>
{
    const newUserId = req.body.userId;
    const newUserPassword = req.body.userPassword;
    const newEmail = req.body.email;
    const newNickName = req.body.nickname;
    console.log(newUserId, newUserPassword, newEmail, newNickName);
    try
    {
        const hashedPassword = await bcrypt.hash(newUserPassword, 7);
        const query = `INSERT INTO USER (user_id, password, email, nickname) VALUES ('${newUserId}','${hashedPassword}', '${newEmail}', '${newNickName}')`;
        const connection = mysql.createConnection(connectInformation);
        connection.promise().query(query)
            .then(() => res.status(201).send("success"))
            .catch(console.log)
            .finally(() => connection.end);
    }
    catch(error)
    {
        res.status(500).send("error");
    }
});

export default router;