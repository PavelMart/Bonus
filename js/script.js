'use strict';

class Bonus {
    constructor(list, menu, showMore, popup) {
        this.list = document.querySelector(list);
        this.menu = document.querySelector(menu);
        this.showMore = document.querySelector(showMore);
        this.heroList = [];
        this.popup = document.querySelector(popup);
        this.lastRenderElement = 0;
        this.heroKey = [
            'name',
            'species',
            'gender',
            'birthDay',
            'deathDay',
            'status',
            'actors',
            'movies'
        ];
    }

    createElement(item) {

        this.lastRenderElement++;

        if ( this.lastRenderElement === this.heroList.length) {
            this.showMore.style.display = 'none';
        }

        const li = document.createElement('li');
        const name = item.name;
        const photo = item.photo;

        li.classList.add('hero');
        li.innerHTML = `
            <a href="#" class="hero-link">
                <div class="hero-img">
                    <img class="hero-photo" src="dbHeroes/${photo}">
                </div>
                <h4 class="hero-name">${name}</h4>
            </a>
        `;

        return li;
    
    }

    showElement(li) {
        
        let count = 0,
            interval;
        
        interval = setInterval(() => {
            if (count !== 100) {
                count += 1;
                li.style.opacity = `${count/100}`;
            } else {
                clearInterval(interval);
            }
        }, 10);

    }

    renderData(data) {
        const liElems = [];

        data.forEach( item => {
            const li = this.createElement(item);
            liElems.push(li);
        });

        liElems.forEach( li => {
            this.list.append(li);
        });

        liElems.forEach( li => {
            this.showElement(li);
        });
    }

    showHero(target) {
        const popup = this.popup,
            popupBody = popup.querySelector('.popup-body');

        const heroSearchName = target.closest('.hero').querySelector('.hero-name').textContent;
        let hero;

        this.heroList.forEach( item => {
            if (item.name === heroSearchName) {
                hero = item;
            }
        });
        
        popupBody.insertAdjacentHTML('beforeend', `
            <button class="popup-close">×</button>
            <div class="popup-photo">
                <img class="popup-photo-img" src="dbHeroes/${hero.photo}">
            </div>
            <div class="popup-info">
                <h2>${hero.name}</h2>
                <table class="popup-table">
                    
                </table>
            </div>
        `);

        const popupTable = popupBody.querySelector('table');

        for (let key in hero) {
            const tableRow = document.createElement('tr');

            if (key === 'name' || key === 'photo') {
                continue;
            }

            if (key === 'movies') {
                tableRow.insertAdjacentHTML('beforeend', `
                <td>${key}</td>
                `);

                let filmText = '';
                hero[key].forEach( item => {
                    filmText += `${item}<br>`;
                });

                tableRow.insertAdjacentHTML('beforeend', `
                <td>${filmText}</td>
                `);

                popupTable.insertAdjacentElement('beforeend', tableRow);
                continue;
            }


            tableRow.insertAdjacentHTML('beforeend', `
                <td>${key}</td>
                <td>${hero[key]}</td>
            `);

            popupTable.insertAdjacentElement('beforeend', tableRow);
        }

        popup.style.display = 'flex';

        this.popup.addEventListener('click', this.closePopup.bind(this));

    }

    getFilms() {
        let films = [];

        this.heroList.forEach( hero => {
            if (hero.movies) {
                hero.movies.forEach( movie => {
                    if (!films.includes(movie)) {
                        films.push(movie);
                    }
                });
            }
        });

        return films;
    }

    createFiltersMenu() {
        const filterList = document.querySelector('.filter-films'),
            filterFilms = this.getFilms();

        filterFilms.forEach( film => {
            const li = document.createElement('li');
            li.classList.add('filter-item');
    
            li.insertAdjacentHTML('beforeend', `
                <label><input type="checkbox" name="${film}" value="${film}">${film}</label>
            `);

            filterList.append(li);
        });
    }

    getFilterHeroes( films ) {
        let selectedHeroes = this.heroList.filter( hero => {
            let flag = true;
            if (hero.movies) {
                films.forEach( film => {
                    flag *= hero.movies.includes(film);
                });
            } else if (films.length === 0) {
                flag = true;
            } else {
                flag = false;
            }

            return flag;
        });

        return selectedHeroes;
    }

    applyFilters() {
        const inputFilms = this.menu.querySelectorAll('input');
        let selectedFilms = [];
        
        inputFilms.forEach( film => {
            if (film.checked === true) {
                selectedFilms.push(film.value);
            }
        });

        this.list.textContent = '';
        this.showMore.style.display = 'none';

        const selectedHeroes = this.getFilterHeroes( selectedFilms );
        if (selectedHeroes.length === 0) {
            this.list.insertAdjacentHTML('beforeend', `
                <h3 class="not-found">No heroes found, change the filter parameters</h3>
            `);
        } else {
            this.renderData(selectedHeroes);
        }
    }

    closePopup(e) {
        const target = e.target,
            popupBody = this.popup.querySelector('.popup-body');

        if (target.className === 'popup-close' || !target.closest('.popup-body')) {
            this.popup.removeEventListener('click', this.closePopup.bind(this));
            this.popup.style.display = 'none';
            popupBody.textContent = '';
        }
    }

    closeFirstScreen() {
        const firstScreen = document.querySelector('.first-screen');
        
        let count = 100,
            interval;

        interval = setInterval(() => {
            if (count !== 0) {
                count -= 1;
                firstScreen.style.opacity = `${count/100}`;
            } else {
                firstScreen.style.display = 'none';
                clearInterval(interval);
            }
        }, 20);
    }

    toggleMenu() {
        this.menu.classList.toggle('active-menu');
    }

    eventListeners() {
        this.showMore.addEventListener('click', () => {
            this.renderData(this.heroList.slice(this.lastRenderElement, this.lastRenderElement + 4));
            const height = document.documentElement.offsetHeight;
            window.scrollTo(0, height);
        });

        this.list.addEventListener('click', e => {
            e.preventDefault();
            const target = e.target;
            
            if (target.closest('li')) {
                this.showHero(target);
            }

        });

        document.addEventListener('click', e => {
            const target = e.target;

            if (target.closest('.menu-button')) {
                this.toggleMenu();
            }

            const menu = target.closest('.menu'),
                menuButton = target.closest('.menu-button');

            if (!menu && !menuButton) {
                this.menu.classList.remove('active-menu');
            }
        });

        const films = this.menu.querySelectorAll('li');
        
        films.forEach( film => {
            film.addEventListener('change', this.applyFilters.bind(this));
        });



    }

    getData() {
        return fetch('./dbHeroes/dbHeroes.json');
    }

    addData(data) {
        data.forEach( item => {
            this.heroList.push(item);
        });
    }

    init() {
        setTimeout(this.closeFirstScreen, 1000);

        this.getData()
            .then( response => {
                if (response.status !== 200) {
                    throw new Error('status network not 200');
                }
                return response.json();
            })
            .then( this.addData.bind(this) )
            .then( this.createFiltersMenu.bind(this) )
            .then( () => {
                this.renderData(this.heroList.slice(this.lastRenderElement, this.lastRenderElement + 4));
            })
            .then(this.eventListeners.bind(this))
            .catch(error => console.error(error));
    }

}

const bonus = new Bonus('.hero-list', '.menu', '.show-more', '.popup');

bonus.init();




