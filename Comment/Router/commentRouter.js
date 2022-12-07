import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql, {createConnection} from 'mysql2/promise';

const router = express.Router();

router.use(cors({origin: true, credentials: true}));
router.use(express.json());
router.use(bodyParser.urlencoded({extended: false}));

const connectInformation =
    {
        host: '192.168.3.3',
        port: '4567',
        user: 'root',
        password: '1234',
        database: 'dev_work',
    };

router.post('/', async (req, res, next) => {
    // 요청 보낼 때, ?boardId=3 이런식으로 보내셈
    console.log(req.body);
    const board_id = req.body.boardId;
    console.log(board_id);
    const query =
        `SELECT c.write_time, c.board_id, c.content, u.nickname 
         FROM COMMENT as c, USER as u 
         WHERE board_id = "${board_id}" AND c.user_id = u.user_id`;
    const connection = await mysql.createConnection(connectInformation);
    try {
        const [result, field] = await connection.query(query);
        if (result.length !== 0) {
            connection.end();
            res.status(201).send(result);
        } else {
            throw new Error();
        }
    } catch (error) {
        connection.end();
        console.error(error);
        res.status(500).send("error");
    }
});

router.post("/post", async (req, res, next) => {
    console.log(req.body);
    const writeTime = req.body.writeTime;
    const boardId = req.body.boardId;
    const userId = req.user;
    const content = req.body.content;
    const connection = await createConnection(connectInformation);
    try {
        const query = `INSERT INTO COMMENT(write_time, board_id, user_id, content) VALUES("${writeTime}", "${boardId}", "${userId}", "${content}")`;
        const [result, field] = await connection.query(query);
        if (result.length !== 0) {
            connection.end();
            res.status(201).send("success");
        }
        else{
            throw new Error();
        }
    }
    catch (error){
        connection.end();
        console.error(error);
        res.status(500).send("error");
    }
});

export default router;