const signIn = document.querySelector(".header__login")
const signUp = document.querySelector(".header__signup")
const modal = document.querySelector(".modal_container")
const modalClose = document.querySelector(".modal__close")
const headerText = document.querySelector(".modal_header__text")
const modalSignIn = document.querySelector(".modal__login")
const modalSignup = document.querySelector(".modal__signup")

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

modalClose.addEventListener("click", () => {
    modal.style.display = "none"
    modalSignIn.style.display = "none"
    modalSignup.style.display = "none"
})
