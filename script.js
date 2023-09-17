const signIn = document.querySelector(".header__login")
const signUp = document.querySelector(".header__signup")
const modal = document.querySelector(".modal_container")
const modalClose = document.querySelector(".modal__close")
const headerText = document.querySelector(".modal-container-header__text")
const modalSignIn = document.querySelector(".modal__login")
const modalSignup = document.querySelector(".modal__signup")
const modalAddPost = document.querySelector(".add-post__inner")
const signinSubmit = document.querySelector(".login__submit")
const signupSubmit = document.querySelector(".signup__submit")
const signupError = document.querySelector(".signup__error")
const signinError = document.querySelector(".signin__error")
const addPost = document.querySelector(".add_post__button")
const postsWrap = document.querySelector(".posts__wrapper")
const postsAll = document.querySelectorAll(".posts__post")

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

if(signIn != null){
    signIn.addEventListener("click", () => {
        modal.style.display = "block"
        modalSignIn.style.display = "inline"
        headerText.innerHTML = "Вход"
    })
    signUp.addEventListener("click", () => {
        modal.style.display = "block"
        modalSignup.style.display = "inline"
        headerText.innerHTML = "Регистрация"
    })
}
else {
    document.querySelector(".header__exit").addEventListener("click", () => {
        deleteAllCookies()
        window.location.href="/"
    })
    addPost.addEventListener("click", () => {
        modal.style.display = "block"
        modalAddPost.style.display = "inline"
        headerText.innerHTML = "Постинг"
    })
    
    postsWrap.addEventListener("click", (e) => {
        let res = new XMLHttpRequest()
        res.open("POST", "/post/vote", true)
        res.setRequestHeader('Content-type', 'application/json')
        const points = e.target.parentNode.querySelector(".post_reactions__points")
        console.log(e.target.parentNode)
        const target = Array.from(e.target.classList)
        if(target.includes("post_reactions__add")){
            let resObj = {
                post: e.target.parentNode.parentNode.dataset.id,
                points: 1
            }
            if(target.includes("voted")){
                resObj.points = 0
                points.innerHTML = +points.innerHTML - 1
            }
            else {
                points.innerHTML = +points.innerHTML + 1
            }
            res.send(JSON.stringify(resObj))
            e.target.classList.toggle("voted")
        }
        else if(target.includes("post_reactions__minus")){
            let resObj = {
                post: e.target.parentNode.parentNode.dataset.id,
                points: -1
            }
            if(target.includes("voted")){
                resObj.points = 0
                points.innerHTML = +points.innerHTML + 1
            }
            else {
                points.innerHTML = +points.innerHTML - 1
            }
            res.send(JSON.stringify(resObj))
            e.target.classList.toggle("voted")
        }
    })
}
modalClose.addEventListener("click", () => {
    modal.style.display = "none"
    modalSignIn.style.display = "none"
    modalSignup.style.display = "none"
    modalAddPost.style.display = "none"
})



function validateSignUp(){
    signupError.innerHTML = ""
    document.querySelector(".signup__password__2").style.backgroundColor = ""
    document.querySelector(".signup__password").style.backgroundColor = ""
    if(document.querySelector(".signup__password").value != document.querySelector(".signup__password__2").value){
        document.querySelector(".signup__password__2").style.backgroundColor = "#f99"
        signupError.innerHTML = "Пароль не сходится"
        return false
    }
    if(document.querySelector(".signup__password").value.length < 6){
        document.querySelector(".signup__password").style.backgroundColor = "#f99"
        signupError.innerHTML = "Слишком короткий пароль"
        return false
    }
    let res = new XMLHttpRequest()
    const resObj = {
        name: document.querySelector(".signup__name").value,
        email: document.querySelector(".signup__email").value,
        password: document.querySelector(".signup__password").value
    }
    res.open("POST", "/auth/signup", true)
    res.setRequestHeader('Content-type', 'application/json')
    res.send(JSON.stringify(resObj))
    res.onload = () => {
        if(res.status == 400){
            signupError.innerHTML = res.response
            console.log(res.response)
        }
        else {
            window.location.href = "/"
        }
        return false
    }

    return false
}

function validateSignIn(){
    let res = new XMLHttpRequest()
    const resObj = {
        email: document.querySelector(".login__email").value,
        password: document.querySelector(".login__password").value
    }
    res.open("POST", "/auth/signin", true)
    res.setRequestHeader('Content-type', 'application/json')
    res.send(JSON.stringify(resObj))
    res.onload = () => {
        if(res.status == 400){
            signinError.innerHTML = res.response
            console.log(res.response)
        }
        else {
            window.location.href = "/"
        }
        return false
    }
    return false
}

function checkLikes(){
    let res = new XMLHttpRequest()
    res.open("GET", "/user/votes", true)
    res.send()
    res.onload = () => {
        const liked = JSON.parse(res.response)
        for(let i in liked){
            for(let k in postsAll){
                
                if(postsAll[k].dataset.id == liked[i].post){
                    if(liked[i].liked){
                        postsAll[k].querySelector(".post_reactions__add").classList.add("voted")
                    }
                    else {
                        postsAll[k].querySelector(".post_reactions__minus").classList.add("voted")
                    }
                    break
                }
            }
        }
    }
}
checkLikes()
document.querySelector(".signup__form").onsubmit = validateSignUp
document.querySelector(".signin__form").onsubmit = validateSignIn

