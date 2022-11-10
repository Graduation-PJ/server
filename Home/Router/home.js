import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const router = express.Router();
router.use(cors({origin:true, credentials: true}));
router.use(express.json());
router.use(bodyParser.urlencoded({extended : false}));

router.get('/', (req, res, next) =>
{
    if(!req.user)
    {
        console.log("error");
        next(new Error());
    }
    else
    {
        req.send(req.user);
    }
});

router.get('/whois', (req, res, next) =>
{
    if(!req.user)
    {
        next(new Error());
    }
    else
    {
        // user 정보 전송 :user.userId, user.userPassword
        res.send(req.user);
    }   
});

export default router;