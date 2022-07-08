(function burgerMenu() {
    const burger = document.querySelector(".header-menu__burger");
    const menu = document.querySelector(".header-menu");
    const arrayOverlay = document.querySelectorAll(".overlay");
    const body = document.querySelector("body");
    const buttonSubmenu = document.querySelectorAll(".menu-header__button");
    const submenu = document.querySelectorAll(".submenu-header");

    const showMenu = () => {
        menu.classList.add('_active')
        body.classList.add('_lock')
        arrayOverlay.forEach((item) => {
            item.classList.add('_header-menu-open')
        })
    }

    const closeMenu = () => {
        menu.classList.remove('_active')
        body.classList.remove('_lock')
        arrayOverlay.forEach((item) => {
            item.classList.remove('_header-menu-open')
        })
        buttonSubmenu.forEach((item) => {
            item.classList.add('collapsed')
        })
        submenu.forEach((item) => {
            item.classList.remove('show')
        })
    }

    burger.addEventListener("click", () => {
        if (!menu.classList.contains('_active')) {
            showMenu()
        } else {
            closeMenu()
        }
    })
    document.addEventListener('click', (e) => {
        if (!e.target.closest(".header-menu")) {
            closeMenu()
        }
    })
})()

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

$(".scrollbar-y").mCustomScrollbar();

