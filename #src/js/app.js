// burger menu
const burger = document.querySelector(".burger");
const menu = document.querySelector(".header-menu");
const headerBottom = document.querySelector(".header-bottom");
const wrapper = document.querySelector(".wrapper");
const body = document.querySelector("body");
const buttonSubmenu = document.querySelectorAll(".menu-header__button");
const submenu = document.querySelectorAll(".submenu-header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");

const showOverlay = () => {
    body.classList.add('_lock')
    wrapper.classList.add('_overlay')
}

const hideOverlay = () => {
    body.classList.remove('_lock')
    wrapper.classList.remove('_overlay')
}

const showMenu = () => {
    burger.classList.add('_active')
    menu.classList.add('_active')
    body.classList.add('_lock')
    wrapper.classList.add('_overlay')
    headerBottom.classList.add('_header-menu-open')
    main.classList.add('_header-menu-open')
    footer.classList.add('_header-menu-open')
}

const closeMenu = () => {
    burger.classList.remove('_active')
    menu.classList.remove('_active')
    headerBottom.classList.remove('_header-menu-open')
    main.classList.remove('_header-menu-open')
    footer.classList.remove('_header-menu-open')
    buttonSubmenu.forEach((item) => {
        item.classList.add('collapsed')
    })
    submenu.forEach((item) => {
        item.classList.remove('show')
    })
}

burger.addEventListener("click", () => {
    if (!burger.classList.contains('_active')) {
        showOverlay()
        showMenu()
    } else {
        hideOverlay()
        closeMenu()
    }
})

document.addEventListener('click', (e) => {
    if (!e.target.closest(".header-menu, .burger, .header-search, .header-search-button, .form-documents__button-open, .form-documents__wrapper")) {
        hideOverlay()
    }
    if (!e.target.closest(".header-menu, .burger")) {
        closeMenu()
    }
    if (!e.target.closest(".header-search, .header-search-button")) {
        headerSearch.classList.remove('_active')
    }
})

// header search
const buttonOpenHeaderSearch = document.querySelector('.header-search-button'),
    buttonCloseHeaderSearch = document.querySelector('.header-search__button-close'),
    headerSearch = document.querySelector('.header-search');
buttonOpenHeaderSearch.addEventListener("click", () => {
    showOverlay()
    headerSearch.classList.add('_active')
})
buttonCloseHeaderSearch.addEventListener("click", () => {
    hideOverlay()
    headerSearch.classList.remove('_active')
})

// menu form news on main page (max-width: 768px)
const buttonMenuFormNews = document.querySelector('.form-news__button-menu'),
    formNewsMenu = document.querySelector('.form-news__menu'),
    categories = document.querySelectorAll('.item-news-category');

if (buttonMenuFormNews) {
    buttonMenuFormNews.addEventListener('click', () => {
        buttonMenuFormNews.classList.toggle('_active');
        formNewsMenu.classList.toggle('_show');
    });
    const closeMenuFormNews = () => {
        buttonMenuFormNews.classList.remove('_active');
        formNewsMenu.classList.remove('_show');
    }
    categories.forEach((label) => {
        label.addEventListener('click', function (e) {
            e.preventDefault()
            closeMenuFormNews()
        });
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.form-news__menu, .form-news__button-menu')) {
            closeMenuFormNews()
        }
    });
}

// form-documents
const buttonOpenFormDocuments = document.querySelector('.form-documents__button-open'),
    buttonCloseFormDocuments = document.querySelector('.form-documents__button-close'),
    wrapperFormDocuments = document.querySelector('.form-documents__wrapper');
if (buttonOpenFormDocuments) {
    buttonOpenFormDocuments.addEventListener("click", () => {
        showOverlay()
        wrapperFormDocuments.classList.add('_open')
    })

    buttonCloseFormDocuments.addEventListener("click", () => {
        hideOverlay()
        wrapperFormDocuments.classList.remove('_open')
    })

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.form-documents__button-open, .form-documents__wrapper')) {
            wrapperFormDocuments.classList.remove('_open')
        }
    });
}

// function for form
function emailTest(input) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(
        input.value
    );
}

function formAddError(input) {
    input.parentElement.classList.add('_error');
}

function formRemoveError(input) {
    input.parentElement.classList.remove('_error');
}

const btnsVisibilityPassword = document.querySelectorAll(".icon-password");

const siblings = el => [].slice.call(el.parentNode.children).filter(child => (child !== el));

btnsVisibilityPassword.forEach(btn => btn.addEventListener('click', () => {
    let input = siblings(btn)
    if (input[0].type === "password") {
        input[0].type = "text";
        btn.classList.remove('bi-eye-slash')
        btn.classList.add('bi-eye')
    } else {
        input[0].type = "password";
        btn.classList.add('bi-eye-slash')
        btn.classList.remove('bi-eye')
    }
}))

// form-login
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-login');
    const buttonSubmitLogin = document.getElementById('submit-login')

    if (form) {
        form.addEventListener('submit', formSend);

        async function formSend(e) {
            e.preventDefault();

            let error = formValidate(form);

            if (error === 0) {
                form.reset()
                alert('Вы вошли на портал-чик-чик-чик')
                buttonSubmitLogin.disabled = true
            }

            function formValidate(form) {
                let error = 0;
                let formRequired = document.querySelectorAll('._required');

                for (let i = 0; i < formRequired.length; i++) {
                    const input = formRequired[i];
                    formRemoveError(input);

                    if (input.classList.contains('_email') && input.value !== '') {
                        if (emailTest(input)) {
                            input.parentElement.classList.add('_error-email');
                            error++;
                        } else {
                            input.parentElement.classList.remove('_error-email');
                        }
                    } else {
                        if (input.value === '') {
                            formAddError(input);
                            error++;
                        }
                    }
                }
                return error;
            }
        }
    }
});

// form-registration
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-registration');
    const buttonSubmitLogin = document.getElementById('submit-registration')
    if (form) {
        form.addEventListener('submit', formSend);

        async function formSend(e) {
            e.preventDefault();

            let error = formValidate(form);

            if (error === 0) {
                form.reset()
                alert('Спасибо за регистрацию')
                buttonSubmitLogin.disabled = true
            }

            function formValidate(form) {
                let error = 0;
                let formRequired = document.querySelectorAll('._required-registr');
                let password = document.getElementById("password-registration").value

                for (let i = 0; i < formRequired.length; i++) {
                    const input = formRequired[i];
                    formRemoveError(input);

                    if (input.classList.contains('_email') && input.value !== '') {
                        if (emailTest(input)) {
                            input.parentElement.classList.add('_error-email');
                            error++;
                        } else {
                            input.parentElement.classList.remove('_error-email');
                        }
                    } else if (input.getAttribute('type') === 'checkbox' && input.checked === false) {
                        formAddError(input);
                        error++;
                    } else if (input.classList.contains('password-confirmation') && input.value !== '') {

                        if (input.value !== password) {
                            formAddError(input);
                            error++;
                        } else {
                            console.log('yes', password)
                        }
                    } else {
                        if (input.value === '') {
                            formAddError(input);
                            error++;
                        }
                    }
                }
                return error;
            }
        }
    }
});

// Exchange Rates from Rest API
const usd = document.getElementById('usd');
const eur = document.getElementById('eur');
const rub = document.getElementById('rub');

async function getExchangeRates() {
    try {
        let response = await fetch('https://www.nbrb.by/api/exrates/rates?periodicity=0');
        let exchangeRates = await response.json();
        exchangeRates.forEach(item => {
            if (item.Cur_Abbreviation === 'USD') {
                usd.innerText = item.Cur_OfficialRate;
            } else if (item.Cur_Abbreviation === 'EUR') {
                eur.innerText = item.Cur_OfficialRate;
            } else if (item.Cur_Abbreviation === 'RUB') {
                rub.innerText = item.Cur_OfficialRate;
            }
        })
        return exchangeRates;
    } catch (error) {
        console.log(error);
    }
}

getExchangeRates();

(function ($) {
    $('#phone-registration').mask('+375 (99) 999-99-99');
    $('#unp-registration').mask('999999999');

    $(function () {
        $('.button-hover')
            .on('mouseenter', function (e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('.button-hover__hover-wrap').css({top: relY, left: relX})
            })
            .on('mouseout', function (e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('.button-hover__hover-wrap').css({top: relY, left: relX})
            });
        // $('[href=#]').click(function(){return false});
    });


    $(window).on("load", function () {
        $(".scrollbar-y").mCustomScrollbar();
        $(".scrollbar-x").mCustomScrollbar({
            axis:"x"
        });
    });
})(jQuery);
