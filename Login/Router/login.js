import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import passport from 'passport';
import passportLocal from 'passport-local';
import mysql from 'mysql2/promise';

const LocalStrategy = passportLocal.Strategy;
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

let connection = null;
async function getConnection()
{
    connection = await mysql.createConnection(connectInformation);
}

router.post('/process', passport.authenticate('local'), (req, res) =>
{
    console.log(2);
    res.send("success");
});

passport.use(new LocalStrategy(
    {
        usernameField: 'userId',
        passwordField: 'userPassword',
    },

    async (username, password, done) =>
    {
        try
        {
            console.log(username, password);
            await getConnection();
            const query = `SELECT * FROM USER WHERE user_id = '${username}'`;
            const [results, fields] = await connection.query(query); 
            if(results.length === 0)
            {
                return (done(null, false, {message : "Incorrect"}));
            }
            const isAuthenticate = await bcrypt.compare(password, results[0].password);
            if(isAuthenticate)
            {
                console.log(results[0]);
                const userId = results[0].user_id;
                console.log(userId);
                return (done(null, userId));
            }
            else
            {
                return (done(null, false, {message : "Incorrect"}));
            }
        }
        catch(error)
        {
            console.error(error);
        }
    }
));

passport.serializeUser((user, done) =>
{
    console.log('serial', user);
    done(null, user);
});

passport.deserializeUser((id, done) =>
{
    console.log('deserial', id);
    done(null, id);
});

router.get('/success',(req, res, next) =>
{
    res.status(201).send("success");
});

router.get('/fault', (req, res, next) =>
{
    const faultScript = 
    `
    <script>
    alert("아이디 또는 비밀번호를 확인해주세요.");
    </script>
    `
    res.status(401).send(faultScript);
});

router.get('/logout', (req, res, next) =>
{
    if(!req.user)
    {
        next(new Error());
    }
    else
    {
        req.logOut(error =>
            {
                if(error)
                {
                    console.error(error);
                }
                else
                {
                    req.session.destroy(() =>
                    {
                        res.clearCookie('connect.sid');
                        res.status(200).send("success");
                    });
                }
            });
    }
});

export default router;