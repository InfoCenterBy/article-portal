(function burgerMenu () {
    const burger = document.querySelector(".header-menu__burger");
    const menu = document.querySelector(".header-menu");
    const page = document.querySelector(".page");
    const headerBottom = document.querySelector(".header-bottom");
    const body = document.querySelector("body");

    burger.addEventListener("click", () => {
        console.log("click")
        if(!menu.classList.contains('_active')) {
            menu.classList.add('_active')
            page.classList.add('_active')
            headerBottom.classList.add('_active')
        } else {
            menu.classList.remove('_active')
            page.classList.remove('_active')
            headerBottom.classList.remove('_active')
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
        console.log(exchangeRates, 1111111111111)
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
    } catch(error) {
        console.log(error);
    }
}
getExchangeRates();

$(function() {
    $('.button-hover')
        .on('mouseenter', function(e) {
            var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
            $(this).find('.button-hover__hover-wrap').css({top:relY, left:relX})
        })
        .on('mouseout', function(e) {
            var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
            $(this).find('.button-hover__hover-wrap').css({top:relY, left:relX})
        });
    $('[href=#]').click(function(){return false});
});