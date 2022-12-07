import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import fs from 'fs';

const connectInformation =
    {
        host: '192.168.3.3',
        port: '4567',
        user: 'root',
        password: '1234',
        database: 'dev_work',
    };

const router = express.Router();

router.use(cors({origin: true, credentials: true}));
router.use(express.json());
router.use(bodyParser.urlencoded({extended : false}));

router.get('/content', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const query = `SELECT board_id, board_date, board_category, board_title, board_content FROM shelter_suggestions WHERE employee_id = "${req.user}" AND board_id = ${req.query.id}`;
        const [results, fields] = await connection.query(query);
        connection.end();
        res.status(200).send(results);
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.delete('/delete', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const countQuery = `SELECT COUNT(*) FROM shelter_suggestions WHERE employee_id = "${req.user}"`;
        const [countResults] = await connection.query(countQuery);
        const numberOfBoards = countResults[0]["COUNT(*)"];
        const deleteQuery = `DELETE FROM shelter_suggestions WHERE board_id = ${req.body.boardId} AND employee_id = "${req.user}"`;
        const [deleteResults] = await connection.query(deleteQuery);
        const afterQuery = `SELECT board_id FROM shelter_suggestions WHERE employee_id = "${req.user}"`;
        const [afterResults] = await connection.query(afterQuery);
        if(deleteResults)
        {
            if(afterResults.length === 0)
            {
                connection.end();
                res.status(200).send("success");
            }
            else
            {
                for(let i = 1; i < numberOfBoards; i++)
                {
                    const updateQuery = `UPDATE shelter_suggestions SET board_id = ${i} WHERE board_id = ${afterResults[i-1].board_id} AND employee_id = "${req.user}"`;
                    const [updateResults] = await connection.query(updateQuery);
                    if(!updateResults)
                    {
                        throw new Error();
                    }
                }
                connection.end();
                res.status(200).send("success");
            }
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.get('/update', async (req, res, next) =>
{
    fs.createReadStream("./public/HTML/suggestionUpdate.html").pipe(res);
});

router.put('/update/process', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const boardId = req.body.boardId;
        const boardTitle = req.body.boardTitle;
        const boardCategory = req.body.boardCategory;
        const boardContent = req.body.boardContent;
        const updateQuery = `UPDATE shelter_suggestions SET board_title = "${boardTitle}", board_category = "${boardCategory}", board_content = "${boardContent}" WHERE employee_id = "${req.user}" AND board_id = ${boardId}`;
        const [updateResults] = await connection.query(updateQuery);
        if(updateResults)
        {
            connection.end();
            res.status(200).send("success");
        }
        else
        {
            connection.end();
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.get('/myList', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const query = `SELECT * FROM BOARD, USER WHERE BOARD.user_id = "${req.user}" AND USER.user_id = BOARD.user_id`;
        const [results, fields] = await connection.query(query);
        if(results)
        {
            connection.end();
            res.status(200).send(results);
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.delete("/myList/delete", async (req, res, next) =>
{
    // http://localhost:8080/board/myList/delete?postId=게시글아이디
    // console.log(req.body.postId);
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const query = `DELETE FROM BOARD WHERE board_id = "${req.body.postId}" AND user_id = "${req.user}"`;
        const [result] = await connection.query(query);
        if(result)
        {
            connection.end();
            res.status(200).send("success");
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.get('/list', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const query = `SELECT * FROM BOARD as B, USER as U where B.user_id=U.user_id`;
        const [results, fields] = await connection.query(query);
        if(results)
        {
            connection.end();
            res.status(200).send(results);
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.put('/myList/update', async (req, res, next) =>
{
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const newTitle = req.body.title;
        const newContent = req.body.content;
        const query = `UPDATE BOARD SET title = "${newTitle}", content = "${newContent}" WHERE board_id = "${req.body.postId}" AND user_id = "${req.user}"`;
        const [result] = await connection.query(query);
        if(result)
        {
            connection.end();
            res.status(200).send("success");
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        console.error(error);
        connection.end();
        res.status(500).send("error");
    }
});

router.post('/writing', async (req, res, next) =>
{
    console.log(req.body);
    const dateFormat = (date) =>
    {
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let seconds = date.getSeconds();

        month = (month >= 10) ? (month) : ('0' + month);
        day = (day >= 10) ? (day) : ('0' + day);
        hour = (hour >= 10) ? (hour) : ('0' + hour);
        minute = (minute >= 10) ? (minute) : ('0' + minute);
        seconds = (seconds >= 10) ? (seconds) : ('0' + seconds);

        return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${seconds}`;
    }
    const title = req.body.title;
    const content = req.body.content;
    const category = req.body.category;
    const date = dateFormat(new Date());
    const userId = req.user;
    const connection = await mysql.createConnection(connectInformation);
    try
    {
        const query = `INSERT INTO BOARD(user_id, title, category, content, upload_date, hit_count) VALUES("${userId}", "${title}", "${category}", "${content}", "${date}", 0)`;
        const [results, fields] = await connection.query(query);
        if(results)
        {
            connection.end();
            res.status(200).send("success");
        }
        else
        {
            throw new Error();
        }
    }
    catch(error)
    {
        connection.end();
        console.error(error);
        res.status(500).send("error");
    }
});

export default router;