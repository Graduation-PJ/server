const $signUpIdText = document.getElementById("signUpIdText");
const $signUpPasswordText = document.getElementById("signUpPassword")
const $checkingIdOverlapButton = document.getElementById("checkingIdOverlapButton");
const $checkedIdOverlapText = document.getElementById("checkedIdOverlapText");
const $signUpButton = document.getElementById("signUpButton");

$checkingIdOverlapButton.addEventListener('click', async () =>
{
    const enteredId = $signUpIdText.value;
    if(enteredId === '')
    {
        alert("아이디를 입력해주세요.");
    }
    else
    {
        // 해당 URL로 부터 아이디가 중복되었는지 알아온다. (해당 URL에서 true, false 중 하나로 반환할거임.)
        const isIdOverlap = await axios.get(`http://localhost:8080/signUp/idChecking/${enteredId}`);
        if(!isIdOverlap.data)
        {
            // innerHTML로 한 이유: HTML 태그 들어간 문자열 파싱하기 위해서
            $checkedIdOverlapText.innerHTML = "<b style='color:greenyellow;'>사용 가능한 아이디 입니다!</b>";
        }
        else
        {
            $checkedIdOverlapText.innerHTML = "<b style='color:crimson;'>중복된 아이디 입니다!</b>";
        }
    }
});

$signUpButton.addEventListener('click', (event) =>
{
    if($checkedIdOverlapText === null)
    {
        event.preventDefault();
        return;
    }
    if($checkedIdOverlapText.textContent === '중복된 아이디 입니다!')
    {
        alert("중복 확인을 해주세요.");
        event.preventDefault();
        return;
    }
});