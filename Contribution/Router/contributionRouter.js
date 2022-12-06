import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';

const router = express.Router();

router.use(cors({origin: true, credentials: true}));
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

router.get('/', async (req, res, next) =>
{
    const numberOfBoardArray = [];
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        console.log(req.query.dateString);
        const dateString = req.query.dateString;
        const month = Number(dateString.substring(5));
        let numberOfDay = null;
        if(month === 2)
        {
            numberOfDay = 29;
        }
        else
        {
            numberOfDay = (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12)? 31:30;
        }
        for(let day = 1; day <= numberOfDay; day++)
        {
            const stringDay = (day < 10)? '0' + day : day;
            const query = `SELECT COUNT(*) FROM BOARD WHERE upload_date LIKE "${dateString}-${stringDay}%" AND user_id = "${req.user}"`;
            const [result] = await connection.query(query);
            if(result.length !== 0)
            {
                numberOfBoardArray.push(result[0]["COUNT(*)"]);
            }
            else
            {
                throw new Error();
            }
        }
        connection.end();
        res.status(200).send(numberOfBoardArray);
    }
    catch (error)
    {
        console.log(error);
        connection.end();
        res.status(500).send("error");
    }
});


export default router;