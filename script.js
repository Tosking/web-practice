const signIn = document.querySelector(".header__login")
const signUp = document.querySelector(".header__signup")
const modal = document.querySelector(".modal_container")
const modalClose = document.querySelector(".modal__close")
const headerText = document.querySelector(".modal_header__text")
const modalSignIn = document.querySelector(".modal__login")
const modalSignup = document.querySelector(".modal__signup")
const signinSubmit = document.querySelector(".login__submit")
const signupSubmit = document.querySelector(".signup__submit")

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
}
modalClose.addEventListener("click", () => {
    modal.style.display = "none"
    modalSignIn.style.display = "none"
    modalSignup.style.display = "none"
})



function validateSignUp(){
    if(document.querySelector(".signup__password").value != document.querySelector(".signup__password__2").value){
        document.querySelector(".signup__password__2").style.backgroundColor = "#f99"
        return false
    }
    console.log("123")
    return true
}

document.querySelector(".signup__form").onsubmit = validateSignUp

