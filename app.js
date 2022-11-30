// 모듈 import 하려면, NPM에서 다운로드 -> 명령어: npm i 모듈이름 --save-dev;
// 그리고 package.json에서 "type":"module" 추가해야지 에러안남.
import express from 'express';
import loginRouter from './Login/Router/login.js';
import homeRouter from './Home/Router/home.js';
import signUpRouter from './SignUp/Router/signUp.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import mysql from 'mysql2/promise';
import boardRouter from "./Board/Router/boardRouter.js";

const app = express();
// app.use(cors());
app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('keyboard cat'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/board', boardRouter);
app.listen(8080, function (){
    console.log(("서버 시작"));
});

const connectInformation =
    {
        host: '192.168.3.3',
        port: '4567',
        user: 'root',
        password: '1234',
        database: 'dev_work',
    };


// 라우터?
// 클라이언트의 요청 경로(Path)를 보고, 이 요청을 처리할 수 있는 곳으로 기능을 전달해주는 역할을 한다.
// (그리고 이 역할을 라우팅이라고 한다.)
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/signUp', signUpRouter);

app.get('/', (req, res, next) => {
    console.log(4);
    console.log(req.user);
    res.send(req.user);
});

app.get('/getUser', async (req, res) => {
    const connection = await mysql.createConnection(connectInformation);
    const query = `SELECT user_id, email, nickname, intro_comment FROM USER WHERE user_id = '${req.user}'`;
    try {
        const [results, fields] = await connection.query(query);
        res.send(results[0]);
    } catch (error) {
        res.status(403).send("error");
    }
});


// 로그인 안 한 상태에서 URL에 접근하면 에러 뜨게 함.
// (다른 미들웨어에서 에러가 발생하면, next() 메소드를 통해서 에러를 전파할 수 있는데, 이런 경우 최종적으로 
//  이 메소드에서 처리가 된다.)
app.use((error, req, res, next) => {
    res.status(403).send("<h1 style='color:crimson;'>접근할 수 없습니다.</h1>");
});